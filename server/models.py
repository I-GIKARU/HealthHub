from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from flask_bcrypt import generate_password_hash, check_password_hash
import re
from sqlalchemy.orm import validates

email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

db = SQLAlchemy()

# Join Table for Clinics and Insurances
clinic_insurance = db.Table(
    'clinic_insurance',
    db.Column('clinic_id', db.Integer, db.ForeignKey('clinics.id'), primary_key=True),
    db.Column('insurance_id', db.Integer, db.ForeignKey('insurances.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.now)
)

# Association Model for Clinic and Service
class ClinicService(db.Model, SerializerMixin):
    __tablename__ = 'clinic_service'

    serialize_rules = (
        '-clinic.service_associations',
        '-service.clinic_associations',
        '-bookings.clinic_service',
        'clinic',
        'service',
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    clinic_id = db.Column(db.Integer, db.ForeignKey('clinics.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    clinic = db.relationship('Clinic', back_populates='service_associations')
    service = db.relationship('Service', back_populates='clinic_associations')
    bookings = db.relationship('Booking', back_populates='clinic_service', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'clinic_id': self.clinic_id,
            'service_id': self.service_id,
            'price': float(self.price) if self.price else None,
            'clinic': self.clinic.to_dict() if self.clinic else None,
            'service': self.service.to_dict() if self.service else None
        }

class Clinic(db.Model, SerializerMixin):
    __tablename__ = 'clinics'

    serialize_rules = (
        '-insurance_accepted.clinics',
        '-service_associations.clinic',
        '-user.clinic',
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    contact = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    street = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    user = db.relationship('User', back_populates='clinic')

    service_associations = db.relationship(
        'ClinicService',
        back_populates='clinic',
        cascade='all, delete-orphan'
    )
    insurance_accepted = db.relationship(
        'Insurance',
        secondary=clinic_insurance,
        back_populates='clinics'
    )

    @property
    def services(self):
        return [assoc.service for assoc in self.service_associations]

    @property
    def bookings(self):
        bookings = []
        for service_assoc in self.service_associations:
            bookings.extend(service_assoc.bookings)
        return bookings

    @property
    def reviews(self):
        reviews = []
        for booking in self.bookings:
            if booking.review:
                reviews.append(booking.review)
        return reviews

    @validates('email')
    def validate_email(self, key, address):
        if address:
            address = address.strip().lower()
            if not re.match(email_pattern, address):
                raise ValueError("Invalid email format")
        return address

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'specialty': self.specialty,
            'description': self.description,
            'contact': self.contact,
            'email': self.email,
            'street': self.street,
            'city': self.city,
            'image_url': self.image_url,
            'user_id': self.user_id,
            'services': [s.to_dict() for s in self.services],
            'insurance_accepted': [i.to_dict() for i in self.insurance_accepted]
        }

class Service(db.Model, SerializerMixin):
    __tablename__ = 'services'

    serialize_rules = (
        '-clinic_associations.service',
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes

    clinic_associations = db.relationship(
        'ClinicService',
        back_populates='service',
        cascade='all, delete-orphan'
    )

    @property
    def clinics(self):
        return [assoc.clinic for assoc in self.clinic_associations]

    @property
    def bookings(self):
        bookings = []
        for clinic_assoc in self.clinic_associations:
            bookings.extend(clinic_assoc.bookings)
        return bookings

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'duration': self.duration
        }

class Insurance(db.Model, SerializerMixin):
    __tablename__ = 'insurances'

    serialize_rules = ('-clinics.insurance_accepted',)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    clinics = db.relationship(
        'Clinic',
        secondary=clinic_insurance,
        back_populates='insurance_accepted'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

class Patient(db.Model, SerializerMixin):
    __tablename__ = 'patients'

    serialize_rules = (
        '-bookings.patient',
        '-user.password_hash',
        '-user.patient',
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    date_joined = db.Column(db.DateTime, default=datetime.now)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    user = db.relationship('User', back_populates='patient')

    bookings = db.relationship('Booking', back_populates='patient', cascade='all, delete-orphan')

    @property
    def reviews(self):
        return [booking.review for booking in self.bookings if booking.review]

    @validates('email')
    def validate_email(self, key, address):
        if address:
            address = address.strip().lower()
            if not re.match(email_pattern, address):
                raise ValueError("Invalid email format")
        return address

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact': self.contact,
            'email': self.email,
            'date_joined': self.date_joined.isoformat() if self.date_joined else None,
            'user_id': self.user_id
        }

class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'

    serialize_rules = (
        '-booking.review',
        'booking.clinic_service.clinic',
        'booking.patient',
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    comment = db.Column(db.Text)
    rating = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.now)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), unique=True)

    booking = db.relationship('Booking', back_populates='review')

    @property
    def clinic(self):
        return self.booking.clinic_service.clinic if self.booking else None

    @property
    def patient(self):
        return self.booking.patient if self.booking else None

    @validates('rating')
    def validate_rating(self, key, rating):
        if rating is not None and not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return rating

    def to_dict(self):
        return {
            'id': self.id,
            'comment': self.comment,
            'rating': self.rating,
            'date': self.date.isoformat() if self.date else None,
            'booking_id': self.booking_id,
            'clinic': self.clinic.to_dict() if self.clinic else None,
            'patient': self.patient.to_dict() if self.patient else None
        }

class Booking(db.Model, SerializerMixin):
    __tablename__ = 'bookings'

    serialize_rules = (
        '-patient.bookings',
        '-clinic_service.bookings',
        '-review.booking',
        'clinic_service.clinic',
        'clinic_service.service',
        'patient',
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_date = db.Column(db.DateTime, default=datetime.now, nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)
    notes = db.Column(db.Text)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    clinic_service_id = db.Column(db.Integer, db.ForeignKey('clinic_service.id'), nullable=False)

    patient = db.relationship('Patient', back_populates='bookings')
    clinic_service = db.relationship(
        'ClinicService',
        back_populates='bookings',
        lazy='joined'
    )
    review = db.relationship(
        'Review',
        back_populates='booking',
        uselist=False,
        cascade='all, delete-orphan'
    )

    @property
    def clinic(self):
        return self.clinic_service.clinic if self.clinic_service else None

    @property
    def service(self):
        return self.clinic_service.service if self.clinic_service else None

    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
        if status and status not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return status

    def to_dict(self):
        return {
            'id': self.id,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'status': self.status,
            'notes': self.notes,
            'patient_id': self.patient_id,
            'clinic_service_id': self.clinic_service_id,
            'patient': self.patient.to_dict() if self.patient else None,
            'clinic_service': self.clinic_service.to_dict() if self.clinic_service else None,
            'clinic': self.clinic.to_dict() if self.clinic else None,
            'service': self.service.to_dict() if self.service else None,
            'review': self.review.to_dict() if self.review else None
        }

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = ('-password_hash', '-patient.user', '-clinic.user')

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient')
    created_at = db.Column(db.DateTime, default=datetime.now)

    patient = db.relationship('Patient', back_populates='user', uselist=False)
    clinic = db.relationship('Clinic', back_populates='user', uselist=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @validates('role')
    def validate_role(self, key, role):
        valid_roles = ['patient', 'clinic', 'admin']
        if role and role not in valid_roles:
            raise ValueError(f"Role must be one of: {', '.join(valid_roles)}")
        return role

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

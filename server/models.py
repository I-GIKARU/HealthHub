from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
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

#Association Model for Clinic and Service
class ClinicService(db.Model, SerializerMixin):
    __tablename__ = 'clinic_service'
    
    serialize_rules = (
        '-clinic.service_associations',
        '-service.clinic_associations',
        '-bookings.clinic_service',
        'clinic',  # Include clinic in serialization
        'service',  # Include service in serialization
    )
    
    id = db.Column(db.Integer, primary_key=True)
    clinic_id = db.Column(db.Integer, db.ForeignKey('clinics.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    
    clinic = db.relationship('Clinic', back_populates='service_associations')
    service = db.relationship('Service', back_populates='clinic_associations')
    bookings = db.relationship('Booking', back_populates='clinic_service')

class Clinic(db.Model, SerializerMixin):
    __tablename__ = 'clinics'

    serialize_rules = (
        '-reviews.clinic',
        '-insurance_accepted.clinics',
        '-bookings.clinic',
        '-service_associations.clinic',
    )

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String)
    contact = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    street = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255))

    # Relationships
    service_associations = db.relationship(
        'ClinicService', 
        back_populates='clinic',
        cascade='all, delete-orphan'
    )
    reviews = db.relationship(
        'Review', 
        back_populates='clinic',
        cascade='all, delete-orphan'
    )
    insurance_accepted = db.relationship(
        'Insurance',
        secondary=clinic_insurance,
        back_populates='clinics'
    )
    bookings = db.relationship(
        'Booking',
        back_populates='clinic',
        cascade='all, delete-orphan'
    )

    @property
    def services(self):
        return [assoc.service for assoc in self.service_associations]
    
    @validates('email')
    def validate_email(self, key, address):
        address = address.strip().lower()
        if not re.match(email_pattern, address):
            raise ValueError("Invalid email format")
        return address

    def __repr__(self):
        return f'<Clinic {self.name} ({self.specialty}) in {self.city}>'

class Service(db.Model, SerializerMixin):
    __tablename__ = 'services'

    serialize_rules = (
        '-clinic_associations.service',
        '-bookings.service',
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    duration = db.Column(db.Integer, nullable=False)  

    # Relationships
    clinic_associations = db.relationship(
        'ClinicService',
        back_populates='service',
        cascade='all, delete-orphan'
    )
    bookings = db.relationship(
        'Booking',
        back_populates='service',
        cascade='all, delete-orphan'
    )

    @property
    def clinics(self):
        return [assoc.clinic for assoc in self.clinic_associations]

    def __repr__(self):
        return f'<Service {self.name}>'

class Insurance(db.Model, SerializerMixin):
    __tablename__ = 'insurances'

    serialize_rules = ('-clinics.insurance_accepted',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    
    clinics = db.relationship(
        'Clinic',
        secondary=clinic_insurance,
        back_populates='insurance_accepted'
    )

    def __repr__(self):
        return f'<Insurance {self.name}>'

class Patient(db.Model, SerializerMixin):
    __tablename__ = 'patients'

    serialize_rules = (
        '-reviews.patient',
        '-bookings.patient',
    )

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    date_joined = db.Column(db.DateTime, default=datetime.now)

    reviews = db.relationship(
        'Review',
        back_populates='patient',
        cascade='all, delete-orphan'
    )
    bookings = db.relationship(
        'Booking',
        back_populates='patient',
        cascade='all, delete-orphan'
    )
    
    @validates('email')
    def validate_email(self, key, address):
        address = address.strip().lower()
        if not re.match(email_pattern, address):
            raise ValueError("Invalid email format")
        return address

    def __repr__(self):
        return f'<Patient {self.name}>'

class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'

    serialize_rules = (
        '-booking.review',
        'booking.clinic_service.clinic',  # Include clinic through booking
        'booking.patient',  # Include patient through booking
    )

    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.String)
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

    def __repr__(self):
        return f'<Review {self.rating} stars for booking {self.booking_id}>'

class Booking(db.Model, SerializerMixin):
    __tablename__ = 'bookings'

    serialize_rules = (
        '-patient.bookings',
        '-clinic_service.bookings',
        '-review.booking',
        'clinic_service.clinic',  # Include clinic through clinic_service
        'clinic_service.service',  # Include service through clinic_service
        'patient',  # Include patient details
    )

    id = db.Column(db.Integer, primary_key=True)
    booking_date = db.Column(db.DateTime, nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.String)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'))
    clinic_service_id = db.Column(db.Integer, db.ForeignKey('clinic_service.id'))

    patient = db.relationship('Patient', back_populates='bookings')
    clinic_service = db.relationship(
        'ClinicService', 
        back_populates='bookings',
        lazy='joined'  # Eager load by default
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

    def __repr__(self):
        return f'<Booking #{self.id} for {self.patient.name}>'

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='patient')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_token(self):
        return create_access_token(identity={
            'id': self.id,
            'username': self.username,
            'role': self.role
        })
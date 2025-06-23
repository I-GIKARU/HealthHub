
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

db = SQLAlchemy()



class Clinic(db.Model, SerializerMixin):
    __tablename__ = 'clinics'

    serialize_rules = (
        '-reviews.clinic',
        '-insurance_accepted.clinic',
        '-bookings.clinic',
    )

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    contact = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    street = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255))

    # Relationships
    services = db.relationship(
        'Service', 
        secondary=clinic_service,
        back_populates='clinics',
        lazy='dynamic'  # Allows for querying on the relationship
    )
    reviews = db.relationship('Review', back_populates='clinic', cascade='all, delete-orphan')
    insurance_accepted = db.relationship('Insurance', back_populates='clinic', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', back_populates='clinic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Clinic {self.name} ({self.specialty}) in {self.city}>'

class Service(db.Model, SerializerMixin):
    __tablename__ = 'services'

    serialize_rules = (
        '-clinics.services',
        '-bookings.service',
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  

    # Relationships
    clinics = db.relationship(
        'Clinic',
        secondary=clinic_service,
        back_populates='services',
        lazy='dynamic'
    )
    bookings = db.relationship('Booking', back_populates='service', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Service {self.name} (KSh {self.price})>'


# Join table for clinics and services many-to-many relationship
clinic_service = db.Table(
    'clinic_service',
    db.Column('clinic_id', db.String(50), db.ForeignKey('clinics.id'), primary_key=True),
    db.Column('service_id', db.Integer, db.ForeignKey('services.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)
class Insurance(db.Model, SerializerMixin):
    __tablename__ = 'insurances'

    serialize_rules = ('-clinics.insurance_accepted',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    clinic_id = db.Column(db.String(50), db.ForeignKey('clinics.id'))

    clinic = db.relationship('Clinic', back_populates='insurance_accepted')



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
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)

    reviews = db.relationship('Review', back_populates='patient', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', back_populates='patient', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Patient {self.name}>'

class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'

    serialize_rules = (
        '-clinic.reviews',
        '-patient.reviews',
    )

    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.Text)
    rating = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    clinic_id = db.Column(db.String(50), db.ForeignKey('clinics.id'))
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'))

    clinic = db.relationship('Clinic', back_populates='reviews')
    patient = db.relationship('Patient', back_populates='reviews')

    def __repr__(self):
        return f'<Review {self.rating} stars by {self.patient.name}>'

class Booking(db.Model, SerializerMixin):
    __tablename__ = 'bookings'

    serialize_rules = (
        '-clinic.bookings',
        '-service.bookings',
        '-patient.bookings',
    )

    id = db.Column(db.Integer, primary_key=True)
    booking_date = db.Column(db.DateTime, nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled, completed
    notes = db.Column(db.Text)
    clinic_id = db.Column(db.String(50), db.ForeignKey('clinics.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'))

    clinic = db.relationship('Clinic', back_populates='bookings')
    service = db.relationship('Service', back_populates='bookings')
    patient = db.relationship('Patient', back_populates='bookings')

    def __repr__(self):
        return f'<Booking for {self.patient.name} at {self.clinic.name}>'












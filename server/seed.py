#!/usr/bin/env python3

from app import app
from models import db, Clinic, Service, Insurance, Patient, Review, Booking
from datetime import datetime
from faker import Faker
import random


fake = Faker()



def create_services():
    services = [
        Service(name='General Consultation', price=1000, duration=30),
        Service(name='Dental Checkup', price=2000, duration=45),
        Service(name='Pediatrics', price=1500, duration=40),
        Service(name='Cardiology', price=3000, duration=60),
        Service(name='Therapist', price=5000, duration=60),
        Service(name='Gynaecologist', price=3000, duration=60),
    ]
    db.session.add_all(services)
    db.session.commit()
    return services

def create_insurances():
    insurances = [
        Insurance(name='sHIF'),
        Insurance(name='Jubilee Insurance'),
        Insurance(name='AAR Insurance'),
        Insurance(name='SHA'),
        Insurance(name='UAP'),
        
    ]
    db.session.add_all(insurances)
    db.session.commit()
    return insurances

def create_clinics(services, insurances):
    clinics = []
    for clinic in range(10):
        clinic = Clinic(
            name=fake.company(),
            specialty=random.choice(['Dental', 'General', 'Pediatrics', 'Cardiology']),
            description=fake.paragraph(),
            contact=fake.phone_number(),
            email=fake.unique.email(),
            street=fake.street_address(),
            city=fake.city(),
            # image_url=fake.image_url()
        )
        for service in random.sample(services, k=2):
            clinic.services.append(service)
        for insurance in random.sample(insurances, k=2):
            clinic.insurance_accepted.append(insurance)

        clinics.append(clinic)
    db.session.add_all(clinics)
    db.session.commit()
    return clinics

def create_patients():
    patients = []
    for patient in range(10):
        patient = Patient(
            name=fake.name(),
            contact=fake.phone_number(),
            email=fake.unique.email(),
            date_joined=fake.date_time_this_year()
        )
        patients.append(patient)
    db.session.add_all(patients)
    db.session.commit()
    return patients

def create_reviews(clinics, patients):
    reviews = []
    for review in range(6):
        review = Review(
            comment=fake.sentence(),
            rating=random.randint(1, 5),
            date=datetime.utcnow(),
            clinic=random.choice(clinics),
            patient=random.choice(patients)
        )
        reviews.append(review)
    db.session.add_all(reviews)
    db.session.commit()
    return reviews

def create_bookings(clinics, services, patients):
    bookings = []
    for booking in range(10):
        clinic = random.choice(clinics)
        service = random.choice(services)
        patient = random.choice(patients)

        booking = Booking(
            booking_date=datetime.utcnow(),
            appointment_date=datetime.utcnow(),
            status=random.choice(['pending', 'confirmed', 'cancelled', 'completed']),
            notes=fake.text(),
            clinic=clinic,
            service=service,
            patient=patient
        )
        bookings.append(booking)
    db.session.add_all(bookings)
    db.session.commit()
    return bookings

with app.app_context():

    Clinic.query.delete()
    Service.query.delete()
    Insurance.query.delete()
    Patient.query.delete()
    Review.query.delete()
    Booking.query.delete()


    services = create_services()
    insurances = create_insurances()
    clinics = create_clinics(services, insurances)
    patients = create_patients()
    create_reviews(clinics, patients)
    create_bookings(clinics, services, patients)


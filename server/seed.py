#!/usr/bin/env python3

from app import app
from models import db, Clinic, Service, Insurance, Patient, Review, Booking, ClinicService
from datetime import datetime, timedelta
from faker import Faker
import random

fake = Faker()

def services():
    services = [
        Service(name='General Consultation', duration=30),
        Service(name='Dental Checkup', duration=45),
        Service(name='Pediatrics', duration=40),
        Service(name='Cardiology', duration=60),
        Service(name='Therapist', duration=60),
        Service(name='Gynaecologist', duration=60),
    ]
    db.session.add_all(services)
    db.session.commit()
    return services

def insurances():
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

def clinics(services, insurances):
    clinics = []
    for _ in range(10):
        clinic = Clinic(
            name=fake.company(),
            specialty=random.choice(['Dental', 'General', 'Pediatrics', 'Cardiology']),
            description=fake.paragraph(),
            # image=image.link  
        )

        # Create service associations (ClinicService)
        selected_services = random.sample(services, k=2)
        for service in selected_services:
            assoc = ClinicService(
                service=service,
                price=random.randint(1000, 5000)
            )
            clinic.service_associations.append(assoc)

        # Add insurance
        for insurance in random.sample(insurances, k=2):
            clinic.insurance_accepted.append(insurance)

        clinics.append(clinic)

    db.session.add_all(clinics)
    db.session.commit()
    return clinics

def patients():
    patients = []
    for patient in range(10):
        patient = Patient(
            name=fake.name(),
            contact=fake.phone_number()
        )
        patients.append(patient)
    db.session.add_all(patients)
    db.session.commit()
    return patients

def bookings(clinics, patients):
    bookings = []
    for booking in range(10):
        clinic = random.choice(clinics)

        clinic_service = random.choice(clinic.service_associations)
        patient = random.choice(patients)

        booking = Booking(
            booking_date=datetime.utcnow(),
            status=random.choice(['pending', 'confirmed', 'cancelled', 'completed']),
            clinic_service=clinic_service,
            patient=patient
        )
        bookings.append(booking)
    db.session.add_all(bookings)
    db.session.commit()
    return bookings

def reviews(bookings):
    reviews = []
    sampled_bookings = random.sample(bookings, k=min(6, len(bookings)))
    for booking in sampled_bookings:
        review = Review(
            comment=fake.sentence(),
            rating=random.randint(1, 6),
            booking=booking
        )
        reviews.append(review)
    db.session.add_all(reviews)
    db.session.commit()
    return reviews

with app.app_context():
    # Clear existing records
    Booking.query.delete()
    Review.query.delete()
    Patient.query.delete()
    ClinicService.query.delete()
    Clinic.query.delete()
    Service.query.delete()
    Insurance.query.delete()

    # Create fresh data
    services = services()
    insurances = insurances()
    clinics = clinics(services, insurances)
    patients = patients()
    bookings = bookings(clinics, patients)
    reviews(bookings)

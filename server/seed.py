#!/usr/bin/env python3

from app import app
from models import db, Clinic, Service, Insurance, Patient, Review, Booking, ClinicService, User
from datetime import datetime
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
        Insurance(name='NHIF'),
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
            contact=fake.unique.phone_number(),
            email=fake.unique.email(),
            street=fake.street_address(),
            city=fake.city(),
            image_url=fake.image_url()
        )

        selected_services = random.sample(services, k=2)
        for service in selected_services:
            assoc = ClinicService(
                service=service,
                price=random.randint(1000, 5000)
            )
            clinic.service_associations.append(assoc)

        for insurance in random.sample(insurances, k=2):
            clinic.insurance_accepted.append(insurance)

        clinics.append(clinic)

    db.session.add_all(clinics)
    db.session.commit()
    return clinics

def patients():
    patients = []
    for _ in range(10):
        patient = Patient(
            name=fake.name(),
            contact=fake.phone_number(),
            email=fake.email()
        )
        patients.append(patient)
    db.session.add_all(patients)
    db.session.commit()
    return patients

def bookings(clinics, patients):
    bookings = []
    for _ in range(10):
        clinic = random.choice(clinics)
        clinic_service = random.choice(clinic.service_associations)
        patient = random.choice(patients)
        appointment_date = datetime.utcnow() 

        booking = Booking(
            booking_date=datetime.utcnow(),
            appointment_date=appointment_date,
            status=random.choice(['pending', 'confirmed', 'cancelled', 'completed']),
            notes=fake.sentence(),
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
            rating=random.randint(1, 5),  
            booking=booking
        )
        reviews.append(review)
    db.session.add_all(reviews)
    db.session.commit()
    return reviews

def users():
    users = [
        User(username='admin_user', role='admin'),
        User(username='clinic_user', role='clinic'),
        User(username='patient_user', role='patient'),
    ]
    for user in users:
        user.set_password('admin123')
    db.session.add_all(users)
    db.session.commit()

with app.app_context():
   
    Booking.query.delete()
    Review.query.delete()
    Patient.query.delete()
    ClinicService.query.delete()
    Clinic.query.delete()
    Service.query.delete()
    Insurance.query.delete()
    User.query.delete()

   
    services = services()
    insurances = insurances()
    clinics = clinics(services, insurances)
    patients = patients()
    bookings = bookings(clinics, patients)
    reviews(bookings)
    users()


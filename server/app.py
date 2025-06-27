#!/usr/bin/env python3
import traceback

from flask_migrate import Migrate
from models import db, Clinic, Patient, Insurance, Service, User, Booking, Review, ClinicService
from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, verify_jwt_in_request, set_access_cookies, unset_jwt_cookies
)
from functools import wraps
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL',
                                                       f'sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), "healthhub.db")}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
# Update your Flask JWT configuration
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable for development
app.config['JWT_COOKIE_SAMESITE'] = 'None'
app.config['JWT_COOKIE_SECURE'] = True  # <-- Set this to True'
app.config['JWT_SESSION_COOKIE'] = False  # Persistent cookie
app.config['JWT_COOKIE_DOMAIN'] = None  # Let browser handle domain

# Update CORS configuration
CORS(app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type"],
            "allow_headers": ["Content-Type"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        }
    }
)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
api = Api(app)
migrate = Migrate(app, db)


# Role-based access decorator
def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()
            if not isinstance(identity, dict) or identity.get('role') != role:
                return {'message': f'{role.capitalize()} role required!'}, 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


# Admin or specific role required decorator
def admin_or_role_required(allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()

            if not isinstance(identity, dict):
                return {'error': 'Invalid identity format'}, 400

            user_role = identity.get('role')
            if user_role not in allowed_roles and user_role != 'admin':
                return {'message': 'Insufficient permissions'}, 403

            return fn(*args, **kwargs)

        return decorator

    return wrapper


# Resource: User Registration
class UserRegistration(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data or 'username' not in data or 'password' not in data:
                return {'message': 'Username and password required'}, 400

            if User.query.filter_by(username=data['username']).first():
                return {'message': 'Username already exists'}, 400

            user = User(
                username=data['username'],
                role=data.get('role', 'patient')
            )
            user.set_password(data['password'])
            db.session.add(user)
            db.session.flush()

            if user.role == 'patient':
                required_fields = ['name', 'email', 'contact']
                for f in required_fields:
                    if f not in data:
                        db.session.rollback()
                        return {'error': f'Missing patient field: {f}'}, 400

                if Patient.query.filter_by(contact=data['contact']).first():
                    db.session.rollback()
                    return {'error': 'Contact number already exists'}, 400
                if Patient.query.filter_by(email=data['email']).first():
                    db.session.rollback()
                    return {'error': 'Email already exists'}, 400

                patient = Patient(
                    name=data['name'],
                    email=data['email'],
                    contact=data['contact'],
                    user_id=user.id
                )
                db.session.add(patient)

            elif user.role == 'clinic':
                required_fields = ['name', 'specialty', 'contact', 'email', 'street', 'city']
                for f in required_fields:
                    if f not in data:
                        db.session.rollback()
                        return {'error': f'Missing clinic field: {f}'}, 400

                if Clinic.query.filter_by(contact=data['contact']).first():
                    db.session.rollback()
                    return {'error': 'Contact number already exists'}, 400
                if Clinic.query.filter_by(email=data['email']).first():
                    db.session.rollback()
                    return {'error': 'Email already exists'}, 400

                clinic = Clinic(
                    name=data['name'],
                    specialty=data['specialty'],
                    description=data.get('description'),
                    contact=data['contact'],
                    email=data['email'],
                    street=data['street'],
                    city=data['city'],
                    image_url=data.get('image_url'),
                    user_id=user.id
                )
                db.session.add(clinic)

            db.session.commit()
            return {'message': 'User created successfully'}, 201

        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Resource: User Login
class UserLogin(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data or 'username' not in data or 'password' not in data:
                return {'message': 'Username and password required'}, 400

            user = User.query.filter_by(username=data['username']).first()
            if not user or not user.check_password(data['password']):
                return {'message': 'Invalid credentials'}, 401

            identity = {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
            access_token = create_access_token(identity=identity)

            response = make_response(jsonify({
                'user': identity,
                'message': 'Login successful'
            }), 200)
            set_access_cookies(response, access_token)
            return response

        except Exception as exc:
            return {'error': str(exc)}, 500


class CurrentUser(Resource):
    def get(self):
        try:
            verify_jwt_in_request(optional=True)
            identity = get_jwt_identity()
            if identity:
                return jsonify({"user": identity})
            return jsonify({"user": None})
        except Exception as e:
            return {"message": "Error verifying user"}, 500


class UserLogout(Resource):
    def post(self):
        response = make_response(jsonify({'message': 'Logged out successfully'}), 200)
        unset_jwt_cookies(response)
        return response


class UserProfile(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        if not user:
            return {'message': 'User not found'}, 404

        profile_data = {
            'id': user.id,
            'username': user.username,
            'role': user.role
        }

        if user.role == 'patient':
            patient = Patient.query.filter_by(user_id=user.id).first()
            if patient:
                profile_data.update({
                    'name': patient.name,
                    'email': patient.email,
                    'contact': patient.contact
                })

        elif user.role == 'clinic':
            clinic = Clinic.query.filter_by(user_id=user.id).first()
            if clinic:
                profile_data.update({
                    'name': clinic.name,
                    'email': clinic.email,
                    'contact': clinic.contact,
                    'specialty': clinic.specialty,
                    'description': clinic.description,
                    'street': clinic.street,
                    'city': clinic.city,
                    'image_url': clinic.image_url,
                })

        return {'user': profile_data}, 200

    @jwt_required()
    def put(self):
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        if not user:
            return {'message': 'User not found'}, 404

        data = request.get_json()

        try:
            if user.role == 'patient':
                patient = Patient.query.filter_by(user_id=user.id).first()
                if not patient:
                    return {'error': 'Patient profile not found'}, 404

                if 'email' in data and data['email'] != patient.email:
                    if Patient.query.filter_by(email=data['email']).first():
                        return {'error': 'Email already exists'}, 400
                    patient.email = data['email']

                if 'contact' in data and data['contact'] != patient.contact:
                    if Patient.query.filter_by(contact=data['contact']).first():
                        return {'error': 'Contact already exists'}, 400
                    patient.contact = data['contact']

                patient.name = data.get('name', patient.name)

            elif user.role == 'clinic':
                clinic = Clinic.query.filter_by(user_id=user.id).first()
                if not clinic:
                    return {'error': 'Clinic profile not found'}, 404

                if 'email' in data and data['email'] != clinic.email:
                    if Clinic.query.filter_by(email=data['email']).first():
                        return {'error': 'Email already exists'}, 400
                    clinic.email = data['email']

                if 'contact' in data and data['contact'] != clinic.contact:
                    if Clinic.query.filter_by(contact=data['contact']).first():
                        return {'error': 'Contact already exists'}, 400
                    clinic.contact = data['contact']

                clinic.name = data.get('name', clinic.name)
                clinic.specialty = data.get('specialty', clinic.specialty)
                clinic.description = data.get('description', clinic.description)
                clinic.street = data.get('street', clinic.street)
                clinic.city = data.get('city', clinic.city)
                clinic.image_url = data.get('image_url', clinic.image_url)

            db.session.commit()
            return {'message': 'Profile updated successfully'}, 200

        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Dashboard Resources
class PatientDashboard(Resource):
    @jwt_required()
    @role_required('patient')
    def get(self):
        current_user = get_jwt_identity()
        patient = Patient.query.filter_by(user_id=current_user['id']).first()
        if not patient:
            return {'error': 'Patient profile not found'}, 404

        bookings = Booking.query.filter_by(patient_id=patient.id).all()
        return {
            'patient': patient.to_dict(),
            'bookings': [b.to_dict() for b in bookings]
        }, 200


class ClinicDashboard(Resource):
    @jwt_required()
    @role_required('clinic')
    def get(self):
        current_user = get_jwt_identity()
        clinic = Clinic.query.filter_by(user_id=current_user['id']).first()
        if not clinic:
            return {'error': 'Clinic profile not found'}, 404

        bookings = []
        for service in clinic.service_associations:
            bookings.extend(service.bookings)

        return {
            'clinic': clinic.to_dict(),
            'bookings': [b.to_dict() for b in bookings]
        }, 200


class AdminDashboard(Resource):
    @jwt_required()
    @role_required('admin')
    def get(self):
        stats = {
            'users': User.query.count(),
            'clinics': Clinic.query.count(),
            'patients': Patient.query.count(),
            'bookings': Booking.query.count()
        }
        return {'stats': stats}, 200


# Clinic resources
class Clinics(Resource):
    def get(self):
        try:
            clinics = [clinic.to_dict() for clinic in Clinic.query.all()]
            return clinics, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def post(self):
        try:
            data = request.get_json()
            required_fields = ['name', 'specialty', 'contact', 'email', 'street', 'city']
            for field in required_fields:
                if field not in data or not data[field]:
                    return {'error': f'Missing or empty required field: {field}'}, 400

            if Clinic.query.filter_by(contact=data['contact']).first():
                return {'error': 'Contact number already exists'}, 400
            if Clinic.query.filter_by(email=data['email']).first():
                return {'error': 'Email already exists'}, 400

            clinic = Clinic(
                name=data['name'],
                specialty=data['specialty'],
                description=data.get('description'),
                contact=data['contact'],
                email=data['email'],
                street=data['street'],
                city=data['city'],
                image_url=data.get('image_url')
            )
            db.session.add(clinic)
            db.session.commit()
            return {'message': 'Clinic created successfully', 'clinic': clinic.to_dict()}, 201
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


class ClinicsById(Resource):
    def get(self, id):
        try:
            clinic = Clinic.query.get(id)
            if not clinic:
                return {'error': 'Clinic not found'}, 404
            return {'clinic': clinic.to_dict()}, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def patch(self, id):
        try:
            clinic = Clinic.query.get(id)
            if not clinic:
                return {'error': 'Clinic not found'}, 404

            data = request.get_json()

            if 'contact' in data and data['contact'] != clinic.contact:
                if Clinic.query.filter_by(contact=data['contact']).first():
                    return {'error': 'Contact number already exists'}, 400

            if 'email' in data and data['email'] != clinic.email:
                if Clinic.query.filter_by(email=data['email']).first():
                    return {'error': 'Email already exists'}, 400

            fields = ['name', 'specialty', 'description', 'contact', 'email', 'street', 'city', 'image_url']
            for field in fields:
                if field in data:
                    setattr(clinic, field, data[field])

            db.session.commit()
            return {'message': 'Clinic updated successfully', 'clinic': clinic.to_dict()}, 200
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def delete(self, id):
        try:
            clinic = Clinic.query.get(id)
            if not clinic:
                return {'error': 'Clinic not found'}, 404

            db.session.delete(clinic)
            db.session.commit()
            return {'message': 'Clinic deleted successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Service resources
class Services(Resource):
    def get(self):
        try:
            services = [service.to_dict() for service in Service.query.all()]
            return services, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def post(self):
        try:
            data = request.get_json()
            fields = ['name', 'duration']
            for field in fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400

            if Service.query.filter_by(name=data['name']).first():
                return {'error': 'Service name already exists'}, 400

            service = Service(
                name=data['name'],
                duration=data['duration']
            )
            db.session.add(service)
            db.session.commit()
            return {'message': 'Service created successfully', 'service': service.to_dict()}, 201
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


class ServicesById(Resource):
    def get(self, id):
        try:
            service = Service.query.get(id)
            if not service:
                return {'error': 'Service not found'}, 404
            return {'service': service.to_dict()}, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def patch(self, id):
        try:
            service = Service.query.get(id)
            if not service:
                return {'error': 'Service not found'}, 404

            data = request.get_json()

            if 'name' in data and data['name'] != service.name:
                if Service.query.filter_by(name=data['name']).first():
                    return {'error': 'Service name already exists'}, 400

            fields = ['name', 'duration']
            for field in fields:
                if field in data:
                    setattr(service, field, data[field])

            db.session.commit()
            return {'message': 'Service updated successfully', 'service': service.to_dict()}, 200
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def delete(self, id):
        try:
            service = Service.query.get(id)
            if not service:
                return {'error': 'Service not found'}, 404

            db.session.delete(service)
            db.session.commit()
            return {'message': 'Service deleted successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Insurance resources
class Insurances(Resource):
    def get(self):
        try:
            insurances = [insurance.to_dict() for insurance in Insurance.query.all()]
            return insurances, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def post(self):
        try:
            data = request.get_json()
            if 'name' not in data:
                return {'error': 'Missing required field: name'}, 400

            if Insurance.query.filter_by(name=data['name']).first():
                return {'error': 'Insurance name already exists'}, 400

            insurance = Insurance(name=data['name'])
            db.session.add(insurance)
            db.session.commit()
            return {'message': 'Insurance created successfully', 'insurance': insurance.to_dict()}, 201
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


class InsurancesById(Resource):
    def get(self, id):
        try:
            insurance = Insurance.query.get(id)
            if not insurance:
                return {'error': 'Insurance not found'}, 404
            return {'insurance': insurance.to_dict()}, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def patch(self, id):
        try:
            insurance = Insurance.query.get(id)
            if not insurance:
                return {'error': 'Insurance not found'}, 404

            data = request.get_json()

            if 'name' in data and data['name'] != insurance.name:
                if Insurance.query.filter_by(name=data['name']).first():
                    return {'error': 'Insurance name already exists'}, 400
                insurance.name = data['name']

            db.session.commit()
            return {'message': 'Insurance updated successfully', 'insurance': insurance.to_dict()}, 200
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def delete(self, id):
        try:
            insurance = Insurance.query.get(id)
            if not insurance:
                return {'error': 'Insurance not found'}, 404

            db.session.delete(insurance)
            db.session.commit()
            return {'message': 'Insurance deleted successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Patient resources
class Patients(Resource):
    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def get(self):
        try:
            patients = [patient.to_dict() for patient in Patient.query.all()]
            return patients, 200
        except Exception as exc:
            return {'error': str(exc)}, 500


class PatientsById(Resource):
    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def get(self, id):
        try:
            patient = Patient.query.get(id)
            if not patient:
                return {'error': 'Patient not found'}, 404
            return {'patient': patient.to_dict()}, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def patch(self, id):
        try:
            patient = Patient.query.get(id)
            if not patient:
                return {'error': 'Patient not found'}, 404

            data = request.get_json()

            if 'contact' in data and data['contact'] != patient.contact:
                if Patient.query.filter_by(contact=data['contact']).first():
                    return {'error': 'Contact number already exists'}, 400

            if 'email' in data and data['email'] != patient.email:
                if Patient.query.filter_by(email=data['email']).first():
                    return {'error': 'Email already exists'}, 400

            fields = ['name', 'contact', 'email']
            for field in fields:
                if field in data:
                    setattr(patient, field, data[field])

            db.session.commit()
            return {'message': 'Patient updated successfully', 'patient': patient.to_dict()}, 200
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    @role_required('admin')
    def delete(self, id):
        try:
            patient = Patient.query.get(id)
            if not patient:
                return {'error': 'Patient not found'}, 404

            db.session.delete(patient)
            db.session.commit()
            return {'message': 'Patient deleted successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Review resources
class Reviews(Resource):
    def get(self):
        try:
            clinic_id = request.args.get('clinic_id')
            patient_id = request.args.get('patient_id')

            query = Review.query

            if clinic_id:
                query = query.join(Booking).join(ClinicService).filter(ClinicService.clinic_id == clinic_id)

            if patient_id:
                query = query.join(Booking).filter(Booking.patient_id == patient_id)

            reviews = [review.to_dict() for review in query.all()]
            return reviews, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            fields = ['rating', 'booking_id']
            for field in fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400

            if not (1 <= data['rating'] <= 5):
                return {'error': 'Rating must be between 1 and 5'}, 400

            booking = Booking.query.get(data['booking_id'])
            if not booking:
                return {'error': 'Booking not found'}, 404

            if booking.review:
                return {'error': 'Booking already has a review'}, 400

            current_user = get_jwt_identity()
            if current_user['role'] == 'patient' and booking.patient_id != current_user['id']:
                return {'error': 'You can only review your own bookings'}, 403

            review = Review(
                comment=data.get('comment'),
                rating=data['rating'],
                booking_id=data['booking_id']
            )
            db.session.add(review)
            db.session.commit()
            return {'message': 'Review created successfully', 'review': review.to_dict()}, 201
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


class ReviewsById(Resource):
    def get(self, id):
        try:
            review = Review.query.get(id)
            if not review:
                return {'error': 'Review not found'}, 404
            return {'review': review.to_dict()}, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    def patch(self, id):
        try:
            review = Review.query.get(id)
            if not review:
                return {'error': 'Review not found'}, 404

            current_user = get_jwt_identity()
            if current_user['role'] == 'patient' and review.booking.patient_id != current_user['id']:
                return {'error': 'You can only edit your own reviews'}, 403

            data = request.get_json()

            if 'rating' in data and not (1 <= data['rating'] <= 5):
                return {'error': 'Rating must be between 1 and 5'}, 400

            fields = ['comment', 'rating']
            for field in fields:
                if field in data:
                    setattr(review, field, data[field])

            db.session.commit()
            return {'message': 'Review updated successfully', 'review': review.to_dict()}, 200
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    def delete(self, id):
        try:
            review = Review.query.get(id)
            if not review:
                return {'error': 'Review not found'}, 404

            current_user = get_jwt_identity()
            if (current_user['role'] == 'patient' and review.booking.patient_id != current_user['id']
                    and current_user['role'] != 'admin'):
                return {'error': 'You can only delete your own reviews'}, 403

            db.session.delete(review)
            db.session.commit()
            return {'message': 'Review deleted successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Booking resources
class Bookings(Resource):
    @jwt_required()
    def get(self):
        try:
            current_user = get_jwt_identity()
            clinic_id = request.args.get('clinic_id')
            patient_id = request.args.get('patient_id')
            status = request.args.get('status')

            query = Booking.query

            if current_user['role'] == 'patient':
                query = query.filter_by(patient_id=current_user['id'])
            elif current_user['role'] == 'clinic':
                clinic = Clinic.query.filter_by(user_id=current_user['id']).first()
                if clinic:
                    query = query.join(ClinicService).filter(ClinicService.clinic_id == clinic.id)

            if clinic_id and current_user['role'] != 'patient':
                query = query.join(ClinicService).filter(ClinicService.clinic_id == clinic_id)
            if patient_id and current_user['role'] == 'admin':
                query = query.filter_by(patient_id=patient_id)
            if status:
                query = query.filter_by(status=status)

            bookings = [booking.to_dict() for booking in query.all()]
            return bookings, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            fields = ['appointment_date', 'clinic_service_id', 'patient_id']
            for field in fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400

            current_user = get_jwt_identity()
            if current_user['role'] == 'patient' and data['patient_id'] != current_user['id']:
                return {'error': 'You can only create bookings for yourself'}, 403

            try:
                appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d %H:%M')
                if appointment_date <= datetime.now():
                    return {'error': 'Appointment date must be in the future'}, 400
            except (ValueError, TypeError):
                return {'error': 'Invalid appointment date format. Use YYYY-MM-DD HH:MM'}, 400

            clinic_service = ClinicService.query.get(data['clinic_service_id'])
            if not clinic_service:
                return {'error': 'Clinic service combination not found'}, 404

             patient = Patient.query.filter_by(user_id=data['patient_id']).first()
            if not patient:
                return {'error': 'Patient not found'}, 404

            statuses = ['pending', 'confirmed', 'cancelled', 'completed']
            status = data.get('status', 'pending')
            if status not in statuses:
                return {'error': f'Invalid status. Must be one of: {", ".join(statuses)}'}, 400

            booking = Booking(
                booking_date=datetime.now(),
                appointment_date=appointment_date,
                status=status,
                notes=data.get('notes'),
                clinic_service_id=data['clinic_service_id'],
                patient_id=data['patient_id']
            )

            db.session.add(booking)
            db.session.commit()
            return {'message': 'Booking created successfully', 'booking': booking.to_dict()}, 201
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


class BookingsById(Resource):
    @jwt_required()
    def get(self, id):
        try:
            booking = Booking.query.get(id)
            if not booking:
                return {'error': 'Booking not found'}, 404

            current_user = get_jwt_identity()
            if (current_user['role'] == 'patient' and booking.patient_id != current_user['id']
                    and current_user['role'] != 'admin'):
                return {'error': 'You can only view your own bookings'}, 403

            return {'booking': booking.to_dict()}, 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    def patch(self, id):
        try:
            booking = Booking.query.get(id)
            if not booking:
                return {'error': 'Booking not found'}, 404

            current_user = get_jwt_identity()
            if (current_user['role'] == 'patient' and booking.patient_id != current_user['id']
                    and current_user['role'] not in ['admin', 'clinic']):
                return {'error': 'Insufficient permissions to modify this booking'}, 403

            data = request.get_json()

            if 'appointment_date' in data:
                try:
                    appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d %H:%M')
                    if appointment_date <= datetime.now():
                        return {'error': 'Appointment date must be in the future'}, 400
                    booking.appointment_date = appointment_date
                except (ValueError, TypeError):
                    return {'error': 'Invalid appointment date format. Use YYYY-MM-DD HH:MM'}, 400

            if 'status' in data:
                statuses = ['pending', 'confirmed', 'cancelled', 'completed']
                if data['status'] not in statuses:
                    return {'error': f'Invalid status. Must be one of: {", ".join(statuses)}'}, 400
                booking.status = data['status']

            if 'notes' in data:
                booking.notes = data['notes']

            db.session.commit()
            return {'message': 'Booking updated successfully', 'booking': booking.to_dict()}, 200
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    def delete(self, id):
        try:
            booking = Booking.query.get(id)
            if not booking:
                return {'error': 'Booking not found'}, 404

            current_user = get_jwt_identity()
            if (current_user['role'] == 'patient' and booking.patient_id != current_user['id']
                    and current_user['role'] != 'admin'):
                return {'error': 'You can only delete your own bookings'}, 403

            db.session.delete(booking)
            db.session.commit()
            return {'message': 'Booking deleted successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# ClinicService management resources
class ClinicServices(Resource):
    def get(self, clinic_id):
        try:
            clinic = Clinic.query.get(clinic_id)
            if not clinic:
                return {'error': 'Clinic not found'}, 404

            clinic_services = ClinicService.query.filter_by(clinic_id=clinic_id).all()
            return [cs.to_dict() for cs in clinic_services], 200
        except Exception as exc:
            return {'error': str(exc)}, 500

    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def post(self, clinic_id):
        try:
            data = request.get_json()
            fields = ['service_id', 'price']
            for field in fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400

            clinic = Clinic.query.get(clinic_id)
            service = Service.query.get(data['service_id'])

            if not clinic:
                return {'error': 'Clinic not found'}, 404
            if not service:
                return {'error': 'Service not found'}, 404

            existing = ClinicService.query.filter_by(
                clinic_id=clinic_id,
                service_id=data['service_id']
            ).first()

            if existing:
                return {'error': 'Service already offered by this clinic'}, 400

            clinic_service = ClinicService(
                clinic_id=clinic_id,
                service_id=data['service_id'],
                price=data['price']
            )

            db.session.add(clinic_service)
            db.session.commit()
            return {'message': 'Service added to clinic successfully', 'clinic_service': clinic_service.to_dict()}, 201
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

class ClinicServicesByClinicId(Resource):
    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def post(self, clinic_id):
        try:
            data = request.get_json()
            service_id = data.get('service_id')
            price = data.get('price')

            if not service_id or price is None:
                return {'error': 'Missing service_id or price'}, 400

            clinic = Clinic.query.get(clinic_id)
            service = Service.query.get(service_id)

            if not clinic or not service:
                return {'error': 'Clinic or service not found'}, 404

            existing = ClinicService.query.filter_by(
                clinic_id=clinic_id, service_id=service_id
            ).first()
            if existing:
                return {'error': 'Service already added to clinic'}, 400

            clinic_service = ClinicService(
                clinic_id=clinic_id,
                service_id=service_id,
                price=price
            )

            db.session.add(clinic_service)
            db.session.commit()

            return {
                'message': 'Service added to clinic successfully',
                'clinic_service': clinic_service.to_dict()
            }, 201

        except Exception as exc:
            db.session.rollback()
            print("ERROR:", exc)
            return {'error': str(exc)}, 500


class ClinicServiceById(Resource):
    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def patch(self, clinic_service_id):
        try:
            clinic_service = ClinicService.query.get(clinic_service_id)
            if not clinic_service:
                return {'error': 'Clinic service not found'}, 404

            data = request.get_json()

            if 'price' in data:
                clinic_service.price = data['price']

            db.session.commit()
            return {'message': 'Clinic service updated successfully', 'clinic_service': clinic_service.to_dict()}, 200
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def delete(self, clinic_service_id):
        try:
            clinic_service = ClinicService.query.get(clinic_service_id)
            if not clinic_service:
                return {'error': 'Clinic service not found'}, 404

            db.session.delete(clinic_service)
            db.session.commit()
            return {'message': 'Service removed from clinic successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Insurance management for clinics
class ClinicInsurancesById(Resource):
    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def post(self, clinic_id):
        try:
            data = request.get_json()
            if 'insurance_id' not in data:
                return {'error': 'Missing required field: insurance_id'}, 400

            clinic = Clinic.query.get(clinic_id)
            insurance_id = int(data['insurance_id'])
            insurance = Insurance.query.get(insurance_id)

            if not clinic:
                return {'error': 'Clinic not found'}, 404
            if not insurance:
                return {'error': 'Insurance not found'}, 404
            if insurance in clinic.insurance_accepted:
                return {'error': 'Insurance already associated with this clinic'}, 400

            clinic.insurance_accepted.append(insurance)
            db.session.commit()
            return {'message': 'Insurance added to clinic successfully'}, 201
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500

    @jwt_required()
    @admin_or_role_required(['admin', 'clinic'])
    def delete(self, clinic_id):
        try:
            data = request.get_json()
            if 'insurance_id' not in data:
                return {'error': 'Missing required field: insurance_id'}, 400

            clinic = Clinic.query.get(clinic_id)
            insurance = Insurance.query.get(data['insurance_id'])

            if not clinic:
                return {'error': 'Clinic not found'}, 404
            if not insurance:
                return {'error': 'Insurance not found'}, 404
            if insurance not in clinic.insurance_accepted:
                return {'error': 'Insurance not associated with this clinic'}, 400

            clinic.insurance_accepted.remove(insurance)
            db.session.commit()
            return {'message': 'Insurance removed from clinic successfully'}, 204
        except Exception as exc:
            db.session.rollback()
            return {'error': str(exc)}, 500


# Register API endpoints
api.add_resource(UserRegistration, '/api/register')
api.add_resource(CurrentUser, '/api/me')
api.add_resource(UserLogin, '/api/login')
api.add_resource(UserLogout, '/api/logout')
api.add_resource(UserProfile, '/api/profile')
api.add_resource(PatientDashboard, '/api/patient-dashboard')
api.add_resource(ClinicDashboard, '/api/clinic-dashboard')
api.add_resource(AdminDashboard, '/api/admin-dashboard')

# Main resource endpoints
api.add_resource(Clinics, '/api/clinics')
api.add_resource(ClinicsById, '/api/clinics/<int:id>')
api.add_resource(Services, '/api/services')
api.add_resource(ServicesById, '/api/services/<int:id>')
api.add_resource(Insurances, '/api/insurances')
api.add_resource(InsurancesById, '/api/insurances/<int:id>')
api.add_resource(Patients, '/api/patients')
api.add_resource(PatientsById, '/api/patients/<int:id>')
api.add_resource(Reviews, '/api/reviews')
api.add_resource(ReviewsById, '/api/reviews/<int:id>')
api.add_resource(Bookings, '/api/bookings')
api.add_resource(BookingsById, '/api/bookings/<int:id>')

# ClinicService management routes
api.add_resource(ClinicServices, '/api/clinics/<int:clinic_id>/services')
api.add_resource(ClinicServiceById, '/api/clinic-services/<int:clinic_service_id>')
api.add_resource(ClinicServicesByClinicId, '/api/clinics/<int:clinic_id>/services')

# Insurance management for clinics
api.add_resource(ClinicInsurancesById, '/api/clinics/<int:clinic_id>/insurances')

# Initialize DB and run app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

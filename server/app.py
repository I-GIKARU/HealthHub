from models import db, Clinic, Patient,Insurance,Service,User, Booking,Review
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, verify_jwt_in_request
)
from functools import wraps
import os

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL',
                                                       f'sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), "app.db")}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-jwt-secret')

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
api = Api(app)


# Role-based access decorator
def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()
            if identity.get('role') != role:
                return {'message': f'{role.capitalize()} role required!'}, 403
            return fn(*args, **kwargs)

        return decorator

    return wrapper


# Resource: User Registration
class UserRegistration(Resource):
    def post(self):
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
        db.session.commit()

        return {'message': 'User created successfully'}, 201


# Resource: User Login
class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return {'message': 'Username and password required'}, 400

        user = User.query.filter_by(username=data['username']).first()
        if not user or not user.check_password(data['password']):
            return {'message': 'Invalid credentials'}, 401

        token = create_access_token(identity={
            'id': user.id,
            'username': user.username,
            'role': user.role
        })

        return {
            'access_token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        }, 200


# Resource: User Logout
class UserLogout(Resource):
    @jwt_required()
    def post(self):
        return {'message': 'Successfully logged out'}, 200


# Resource: Patient Dashboard
class PatientDashboard(Resource):
    @jwt_required()
    @role_required('patient')
    def get(self):
        current_user = get_jwt_identity()
        return {'message': f'Welcome Patient {current_user["username"]}'}, 200


# Resource: Clinic Dashboard
class ClinicDashboard(Resource):
    @jwt_required()
    @role_required('clinic')
    def get(self):
        current_user = get_jwt_identity()
        return {'message': f'Welcome Clinic Staff {current_user["username"]}'}, 200


# Resource: Admin Dashboard
class AdminDashboard(Resource):
    @jwt_required()
    @role_required('admin')
    def get(self):
        current_user = get_jwt_identity()
        return {'message': f'Welcome Admin {current_user["username"]}'}, 200


# Register API endpoints
api.add_resource(UserRegistration, '/api/register')
api.add_resource(UserLogin, '/api/login')
api.add_resource(UserLogout, '/api/logout')
api.add_resource(PatientDashboard, '/api/patient')
api.add_resource(ClinicDashboard, '/api/clinic')
api.add_resource(AdminDashboard, '/api/admin')

# Initialize DB and run app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create initial admin user if none exists
        if not User.query.filter_by(role='admin').first():
            admin = User(username='admin', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    app.run(debug=True)
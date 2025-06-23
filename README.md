# HealthHub
A RESTful API built with Flask for managing medical clinics, services, patients, bookings, and reviews. Includes role-based authentication for **admins**, **clinics**, and **patients**.

---

## 🚀 Features

- Role-based JWT authentication (`admin`, `clinic`, `patient`)
- Book appointments for medical services
- Manage clinics, services, and accepted insurance
- Submit and view patient reviews
- Secure password hashing & login
- Flask-Migrate for database migrations

---

## 🧱 Tech Stack

- **Flask** + **Flask-JWT-Extended**
- **SQLAlchemy** + **Flask-Migrate**
- **PostgreSQL** / SQLite (dev)
- **bcrypt** for password hashing


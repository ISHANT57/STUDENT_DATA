import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///students.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

with app.app_context():
    # Import models to ensure tables are created
    import models
    db.create_all()
    
    # Add sample data if no students exist
    if models.Student.query.count() == 0:
        sample_students = [
            models.Student(
                student_name='Ishant Bhoyar',
                batch_year='2023-24',
                course_program='B.Tech Computer Science',
                college_university='Sitare University (SRMU) Lucknow, Uttar Pradesh',
                current_status='Currently Studying'
            ),
            models.Student(
                student_name='Prerna Hasija',
                batch_year='2023-24', 
                course_program='MBA Marketing',
                college_university='Delhi University, New Delhi',
                current_status='Graduated'
            ),
            models.Student(
                student_name='Rahul Sharma',
                batch_year='2023-24',
                course_program='BCA',
                college_university='Mumbai University, Maharashtra',
                current_status='Employed'
            ),
            models.Student(
                student_name='Anita Singh',
                batch_year='2023-24',
                course_program='B.Tech Information Technology',
                college_university='IIT Delhi, New Delhi',
                current_status='Higher Studies'
            ),
            models.Student(
                student_name='Vikram Patel',
                batch_year='2023-24',
                course_program='B.Com',
                college_university='Gujarat University, Ahmedabad',
                current_status='Job Seeking'
            )
        ]
        
        for student in sample_students:
            db.session.add(student)
        
        db.session.commit()
        print("Sample student data added successfully!")

# Import routes
import routes

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

from app import db
from datetime import datetime

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    batch_year = db.Column(db.String(20), nullable=False)
    course_program = db.Column(db.String(100), nullable=False)
    college_university = db.Column(db.String(200), nullable=False)
    current_status = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Student {self.student_name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'batch_year': self.batch_year,
            'course_program': self.course_program,
            'college_university': self.college_university,
            'current_status': self.current_status,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

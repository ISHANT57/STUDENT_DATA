from flask import render_template, request, redirect, url_for, flash, send_file, make_response
from app import app, db
from models import Student
import pandas as pd
import io
from datetime import datetime
import logging

@app.route('/')
def index():
    """Display all students in a table format with search and filter functionality"""
    # Get search and filter parameters
    search_query = request.args.get('search', '').strip()
    status_filter = request.args.get('status', '').strip()
    
    # Start with base query
    query = Student.query
    
    # Apply search filter
    if search_query:
        query = query.filter(
            db.or_(
                Student.student_name.ilike(f'%{search_query}%'),
                Student.college_university.ilike(f'%{search_query}%'),
                Student.course_program.ilike(f'%{search_query}%')
            )
        )
    
    # Apply status filter
    if status_filter:
        query = query.filter(Student.current_status == status_filter)
    
    # Get filtered results
    students = query.order_by(Student.created_at.desc()).all()
    
    # Get all unique statuses for filter dropdown
    all_statuses = db.session.query(Student.current_status).distinct().all()
    unique_statuses = [status[0] for status in all_statuses if status[0]]
    unique_statuses.sort()
    
    return render_template('index.html', 
                         students=students, 
                         search_query=search_query,
                         status_filter=status_filter,
                         unique_statuses=unique_statuses)

@app.route('/add_student', methods=['GET', 'POST'])
def add_student():
    """Add a new student record"""
    if request.method == 'POST':
        try:
            # Get form data
            student_name = request.form.get('student_name', '').strip()
            batch_year = request.form.get('batch_year', '').strip()
            course_program = request.form.get('course_program', '').strip()
            college_university = request.form.get('college_university', '').strip()
            current_status = request.form.get('current_status', '').strip()

            # Validate required fields
            if not all([student_name, batch_year, course_program, college_university, current_status]):
                flash('All fields are required!', 'error')
                return render_template('add_student.html')

            # Create new student record
            new_student = Student(
                student_name=student_name,
                batch_year=batch_year,
                course_program=course_program,
                college_university=college_university,
                current_status=current_status
            )

            db.session.add(new_student)
            db.session.commit()

            flash(f'Student {student_name} added successfully!', 'success')
            return redirect(url_for('index'))

        except Exception as e:
            logging.error(f"Error adding student: {str(e)}")
            flash('An error occurred while adding the student. Please try again.', 'error')
            db.session.rollback()

    return render_template('add_student.html')

@app.route('/edit_student/<int:student_id>', methods=['GET', 'POST'])
def edit_student(student_id):
    """Edit an existing student record"""
    student = Student.query.get_or_404(student_id)

    if request.method == 'POST':
        try:
            # Get form data
            student_name = request.form.get('student_name', '').strip()
            batch_year = request.form.get('batch_year', '').strip()
            course_program = request.form.get('course_program', '').strip()
            college_university = request.form.get('college_university', '').strip()
            current_status = request.form.get('current_status', '').strip()

            # Validate required fields
            if not all([student_name, batch_year, course_program, college_university, current_status]):
                flash('All fields are required!', 'error')
                return render_template('edit_student.html', student=student)

            # Update student record
            student.student_name = student_name
            student.batch_year = batch_year
            student.course_program = course_program
            student.college_university = college_university
            student.current_status = current_status
            student.updated_at = datetime.utcnow()

            db.session.commit()

            flash(f'Student {student_name} updated successfully!', 'success')
            return redirect(url_for('index'))

        except Exception as e:
            logging.error(f"Error updating student: {str(e)}")
            flash('An error occurred while updating the student. Please try again.', 'error')
            db.session.rollback()

    return render_template('edit_student.html', student=student)

@app.route('/delete_student/<int:student_id>', methods=['POST'])
def delete_student(student_id):
    """Delete a student record"""
    try:
        student = Student.query.get_or_404(student_id)
        student_name = student.student_name
        
        db.session.delete(student)
        db.session.commit()
        
        flash(f'Student {student_name} deleted successfully!', 'success')
    except Exception as e:
        logging.error(f"Error deleting student: {str(e)}")
        flash('An error occurred while deleting the student. Please try again.', 'error')
        db.session.rollback()

    return redirect(url_for('index'))

@app.route('/export_csv')
def export_csv():
    """Export all student data to CSV format"""
    try:
        # Get all students (with current filters if any)
        search_query = request.args.get('search', '').strip()
        status_filter = request.args.get('status', '').strip()
        
        query = Student.query
        
        # Apply same filters as index view
        if search_query:
            query = query.filter(
                db.or_(
                    Student.student_name.ilike(f'%{search_query}%'),
                    Student.college_university.ilike(f'%{search_query}%'),
                    Student.course_program.ilike(f'%{search_query}%')
                )
            )
        
        if status_filter:
            query = query.filter(Student.current_status == status_filter)
        
        students = query.order_by(Student.id).all()
        
        if not students:
            flash('No student data available to export.', 'warning')
            return redirect(url_for('index'))

        # Create DataFrame
        data = []
        for student in students:
            data.append({
                'ID': student.id,
                'Student Name': student.student_name,
                'Batch Year': student.batch_year,
                'Course/Program': student.course_program,
                'College/University': student.college_university,
                'Current Status': student.current_status,
                'Created Date': student.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'Last Updated': student.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })

        df = pd.DataFrame(data)

        # Create CSV file in memory
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)

        # Generate filename with current timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'student_data_{timestamp}.csv'

        # Create response
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename={filename}'

        flash(f'CSV file exported successfully! ({len(students)} records)', 'success')
        return response

    except Exception as e:
        logging.error(f"Error exporting CSV: {str(e)}")
        flash('An error occurred while exporting data. Please try again.', 'error')
        return redirect(url_for('index'))

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    flash('An internal error occurred. Please try again.', 'error')
    return redirect(url_for('index'))

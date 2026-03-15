from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uvicorn
from typing import List

from . import models, schemas, database, auth

# Initialize the database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Student Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"

# Helper function to convert datetime properties to strings
def model_to_dict(model_instance):
    if not model_instance:
        return None
    d = {c.name: getattr(model_instance, c.name) for c in model_instance.__table__.columns}
    if 'created_at' in d and d['created_at']:
        d['createdAt'] = d.pop('created_at').isoformat() + "Z"
    if 'updated_at' in d and d['updated_at']:
        d['updatedAt'] = d.pop('updated_at').isoformat() + "Z"

    if hasattr(model_instance, 'first_name'):
        d['firstName'] = d.pop('first_name')
        d['lastName'] = d.pop('last_name')
    return d

def format_student(student):
    d = model_to_dict(student)
    if hasattr(student, 'courses') and student.courses:
         d['courses'] = [model_to_dict(c) for c in student.courses]
    else:
        d['courses'] = []
    return d

def format_course(course):
    return model_to_dict(course)

# --- Auth Endpoints ---
@app.post("/api/auth/register", response_model=schemas.ApiResponse[schemas.AuthResponse])
def register(user: schemas.RegisterRequest, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": new_user.username}, expires_delta=access_token_expires
    )

    return schemas.ApiResponse(
        success=True,
        message="Registration successful",
        data=schemas.AuthResponse(
            token=access_token,
            username=new_user.username,
            role=new_user.role,
            expiresIn=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        ),
        timestamp=get_timestamp()
    )

@app.post("/api/auth/login", response_model=schemas.ApiResponse[schemas.AuthResponse])
def login(user: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )

    return schemas.ApiResponse(
        success=True,
        message="Login successful",
        data=schemas.AuthResponse(
            token=access_token,
            username=db_user.username,
            role=db_user.role,
            expiresIn=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        ),
        timestamp=get_timestamp()
    )

# --- Course Endpoints ---
@app.get("/api/courses", response_model=schemas.ApiResponse[List[schemas.Course]])
def get_courses(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    courses = db.query(models.Course).all()
    return schemas.ApiResponse(
        success=True,
        data=[format_course(c) for c in courses],
        timestamp=get_timestamp()
    )

@app.get("/api/courses/{id}", response_model=schemas.ApiResponse[schemas.Course])
def get_course(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return schemas.ApiResponse(
        success=True,
        data=format_course(course),
        timestamp=get_timestamp()
    )

@app.get("/api/courses/{id}/students", response_model=schemas.ApiResponse[List[schemas.Student]])
def get_course_students(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return schemas.ApiResponse(
        success=True,
        data=[format_student(s) for s in course.students],
        timestamp=get_timestamp()
    )

@app.post("/api/courses", response_model=schemas.ApiResponse[schemas.Course])
def create_course(course: schemas.CourseRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    new_course = models.Course(**course.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return schemas.ApiResponse(
        success=True,
        message="Course created successfully",
        data=format_course(new_course),
        timestamp=get_timestamp()
    )

@app.put("/api/courses/{id}", response_model=schemas.ApiResponse[schemas.Course])
def update_course(id: int, course_data: schemas.CourseRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for key, value in course_data.model_dump().items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)
    return schemas.ApiResponse(
        success=True,
        message="Course updated successfully",
        data=format_course(course),
        timestamp=get_timestamp()
    )

@app.delete("/api/courses/{id}", response_model=schemas.ApiResponse[None])
def delete_course(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return schemas.ApiResponse(
        success=True,
        message="Course deleted successfully",
        timestamp=get_timestamp()
    )

# --- Student Endpoints ---
@app.get("/api/students", response_model=schemas.ApiResponse[List[schemas.Student]])
def get_students(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    students = db.query(models.Student).all()
    return schemas.ApiResponse(
        success=True,
        data=[format_student(s) for s in students],
        timestamp=get_timestamp()
    )

@app.get("/api/students/{id}", response_model=schemas.ApiResponse[schemas.Student])
def get_student(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return schemas.ApiResponse(
        success=True,
        data=format_student(student),
        timestamp=get_timestamp()
    )

@app.get("/api/students/{id}/courses", response_model=schemas.ApiResponse[List[schemas.Course]])
def get_student_courses(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return schemas.ApiResponse(
        success=True,
        data=[format_course(c) for c in student.courses],
        timestamp=get_timestamp()
    )

@app.post("/api/students", response_model=schemas.ApiResponse[schemas.Student])
def create_student(student: schemas.StudentRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    new_student = models.Student(
        first_name=student.firstName,
        last_name=student.lastName,
        email=student.email,
        phone=student.phone
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return schemas.ApiResponse(
        success=True,
        message="Student created successfully",
        data=format_student(new_student),
        timestamp=get_timestamp()
    )

@app.put("/api/students/{id}", response_model=schemas.ApiResponse[schemas.Student])
def update_student(id: int, student_data: schemas.StudentRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.first_name = student_data.firstName
    student.last_name = student_data.lastName
    student.email = student_data.email
    student.phone = student_data.phone

    db.commit()
    db.refresh(student)
    return schemas.ApiResponse(
        success=True,
        message="Student updated successfully",
        data=format_student(student),
        timestamp=get_timestamp()
    )

@app.delete("/api/students/{id}", response_model=schemas.ApiResponse[None])
def delete_student(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return schemas.ApiResponse(
        success=True,
        message="Student deleted successfully",
        timestamp=get_timestamp()
    )

@app.post("/api/students/{studentId}/enroll/{courseId}", response_model=schemas.ApiResponse[schemas.Student])
def enroll_student(studentId: int, courseId: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    student = db.query(models.Student).filter(models.Student.id == studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.query(models.Course).filter(models.Course.id == courseId).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course not in student.courses:
        student.courses.append(course)
        db.commit()
        db.refresh(student)

    return schemas.ApiResponse(
        success=True,
        message="Student enrolled successfully",
        data=format_student(student),
        timestamp=get_timestamp()
    )

@app.delete("/api/students/{studentId}/unenroll/{courseId}", response_model=schemas.ApiResponse[schemas.Student])
def unenroll_student(studentId: int, courseId: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_admin)):
    student = db.query(models.Student).filter(models.Student.id == studentId).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.query(models.Course).filter(models.Course.id == courseId).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course in student.courses:
        student.courses.remove(course)
        db.commit()
        db.refresh(student)

    return schemas.ApiResponse(
        success=True,
        message="Student unenrolled successfully",
        data=format_student(student),
        timestamp=get_timestamp()
    )

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8080, reload=True)

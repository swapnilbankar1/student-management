from pydantic import BaseModel, Field
from typing import List, Optional, TypeVar, Generic
from datetime import datetime

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: Optional[str] = None
    data: Optional[T] = None
    timestamp: str

# Course Schemas
class CourseBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    credits: int

class CourseRequest(CourseBase):
    pass

class Course(CourseBase):
    id: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    model_config = {"from_attributes": True}

# Student Schemas
class StudentBase(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = None

class StudentRequest(StudentBase):
    pass

class Student(StudentBase):
    id: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    courses: Optional[List[Course]] = []

    model_config = {"from_attributes": True}

# Add students field to Course schema
class CourseWithStudents(Course):
    students: Optional[List[Student]] = []

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str

class AuthResponse(BaseModel):
    token: str
    tokenType: str = "Bearer"
    username: str
    role: str
    expiresIn: int

# Student Management Frontend

Angular 19 frontend for the Student Management Frontend application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 19 — standalone components |
| UI Library | Angular Material 19 (Material 3) |
| State | RxJS — BehaviorSubject, takeUntil |
| Auth | JWT — localStorage + HttpInterceptor |
| Forms | Reactive Forms with validation |
| Styling | SCSS + Angular Material theming |

---

## Prerequisites

- **Node.js 18+**
- **npm 9+**
- **Angular CLI 19** — `npm install -g @angular/cli@19`
- **Backend running** at `http://localhost:8080`

---

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the backend first
Make sure the Spring Boot backend is running on port 8080.
See `student-management-backend/README.md` for backend setup.

### 3. Start the Angular dev server
```bash
ng serve
```

App opens at **http://localhost:4200**

---

## Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin`  | `password` | Admin |
| `user`   | `password` | User  |

---

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # AuthGuard, AdminGuard
│   ├── interceptors/    # AuthInterceptor, ErrorInterceptor
│   ├── models/          # TypeScript interfaces
│   └── services/        # AuthService, StudentService, CourseService, ToastService
├── features/
│   ├── auth/
│   │   ├── login/       # Login page
│   │   └── register/    # Register page
│   └── admin/
│       ├── admin-layout/      # Shell: toolbar + tab nav
│       ├── dashboard/         # Stats + quick actions
│       ├── students/          # Student list + form dialog
│       ├── courses/           # Course list + form dialog + students dialog
│       └── enrollments/       # Enrollment management + enroll dialog
└── shared/
    └── components/
        ├── confirm-dialog/    # Reusable delete confirmation modal
        ├── loading-spinner/   # Spinner component
        └── unauthorized/      # 403 page
```

---

## Features

- **Login / Register** — JWT authentication with role selection
- **Dashboard** — student & course counts, quick action buttons
- **Students** — list with search, create, edit, delete (modal confirm)
- **Courses** — list with search, create, edit, delete, view enrolled students
- **Enrollments** — select student, view enrolled courses, enroll in new course, unenroll
- **Toast notifications** — success/error/warning on every action
- **Global error handling** — 401 auto-logout, 400/409/500 error messages

---

## API Endpoints Consumed

| Method | Endpoint | Feature |
|--------|----------|---------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/students` | Student list |
| POST | `/api/students` | Create student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |
| GET | `/api/students/{id}/courses` | Student's courses |
| POST | `/api/students/{id}/enroll/{courseId}` | Enroll |
| DELETE | `/api/students/{id}/unenroll/{courseId}` | Unenroll |
| GET | `/api/courses` | Course list |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |
| GET | `/api/courses/{id}/students` | Course's students |

---

## Build for Production

```bash
ng build --configuration production
```

Output in `dist/student-management-ui/`

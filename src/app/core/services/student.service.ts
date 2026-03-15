import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Student, StudentRequest } from '../models/student.model';
import { Course } from '../models/course.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly API = 'http://localhost:8080/api/students';

  private studentsSubject = new BehaviorSubject<Student[]>([]);
  students$ = this.studentsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAll(): Observable<ApiResponse<Student[]>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<Student[]>>(this.API).pipe(
      tap({
        next: res => {
          this.studentsSubject.next(res.data);
          this.loadingSubject.next(false);
        },
        error: () => this.loadingSubject.next(false)
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.API}/${id}`);
  }

  getCourses(id: number): Observable<ApiResponse<Course[]>> {
    return this.http.get<ApiResponse<Course[]>>(`${this.API}/${id}/courses`);
  }

  create(request: StudentRequest): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(this.API, request).pipe(
      tap(res => this.studentsSubject.next([...this.studentsSubject.value, res.data]))
    );
  }

  update(id: number, request: StudentRequest): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.API}/${id}`, request).pipe(
      tap(res => {
        const updated = this.studentsSubject.value.map(s => s.id === id ? res.data : s);
        this.studentsSubject.next(updated);
      })
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      tap(() => {
        const filtered = this.studentsSubject.value.filter(s => s.id !== id);
        this.studentsSubject.next(filtered);
      })
    );
  }

  enroll(studentId: number, courseId: number): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(`${this.API}/${studentId}/enroll/${courseId}`, {});
  }

  unenroll(studentId: number, courseId: number): Observable<ApiResponse<Student>> {
    return this.http.delete<ApiResponse<Student>>(`${this.API}/${studentId}/unenroll/${courseId}`);
  }
}

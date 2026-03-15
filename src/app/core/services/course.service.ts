import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Course, CourseRequest } from '../models/course.model';
import { Student } from '../models/student.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly API = 'http://localhost:8080/api/courses';

  private coursesSubject = new BehaviorSubject<Course[]>([]);
  courses$ = this.coursesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAll(): Observable<ApiResponse<Course[]>> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<Course[]>>(this.API).pipe(
      tap({
        next: res => {
          this.coursesSubject.next(res.data);
          this.loadingSubject.next(false);
        },
        error: () => this.loadingSubject.next(false)
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Course>> {
    return this.http.get<ApiResponse<Course>>(`${this.API}/${id}`);
  }

  getStudents(id: number): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(`${this.API}/${id}/students`);
  }

  create(request: CourseRequest): Observable<ApiResponse<Course>> {
    return this.http.post<ApiResponse<Course>>(this.API, request).pipe(
      tap(res => this.coursesSubject.next([...this.coursesSubject.value, res.data]))
    );
  }

  update(id: number, request: CourseRequest): Observable<ApiResponse<Course>> {
    return this.http.put<ApiResponse<Course>>(`${this.API}/${id}`, request).pipe(
      tap(res => {
        const updated = this.coursesSubject.value.map(c => c.id === id ? res.data : c);
        this.coursesSubject.next(updated);
      })
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      tap(() => {
        const filtered = this.coursesSubject.value.filter(c => c.id !== id);
        this.coursesSubject.next(filtered);
      })
    );
  }

  getSnapshot(): Course[] {
    return this.coursesSubject.value;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentService } from '../../../core/services/student.service';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  studentCount = 0;
  courseCount = 0;
  loading = true;
  username = '';
  private destroy$ = new Subject<void>();

  stats = [
    { label: 'Total Students', icon: 'people',      color: '#1976d2', key: 'students' },
    { label: 'Total Courses',  icon: 'book',         color: '#388e3c', key: 'courses'  },
    { label: 'Active Enrollments', icon: 'assignment', color: '#f57c00', key: 'enrollments' }
  ];

  quickActions = [
    { label: 'Add Student',  icon: 'person_add', route: '/admin/students',    color: 'primary' },
    { label: 'Add Course',   icon: 'add_circle', route: '/admin/courses',     color: 'accent'  },
    { label: 'Enroll',       icon: 'assignment', route: '/admin/enrollments', color: 'warn'    }
  ];

  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getCurrentUser()?.username || '';

    forkJoin({
      students: this.studentService.loadAll(),
      courses:  this.courseService.loadAll()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ students, courses }) => {
          this.studentCount = students.data.length;
          this.courseCount  = courses.data.length;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  getCount(key: string): number {
    if (key === 'students') return this.studentCount;
    if (key === 'courses')  return this.courseCount;
    return 0;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

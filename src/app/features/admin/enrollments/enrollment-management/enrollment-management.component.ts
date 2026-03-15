import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StudentService } from '../../../../core/services/student.service';
import { CourseService } from '../../../../core/services/course.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Student } from '../../../../core/models/student.model';
import { Course } from '../../../../core/models/course.model';
import { EnrollDialogComponent } from '../enroll-dialog/enroll-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-enrollment-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    MatChipsModule, MatProgressSpinnerModule, MatDividerModule, MatTooltipModule
  ],
  templateUrl: './enrollment-management.component.html',
  styleUrl: './enrollment-management.component.scss'
})
export class EnrollmentManagementComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  courses: Course[] = [];
  selectedStudentId: number | null = null;
  selectedStudent: Student | null = null;
  enrolledCourses: Course[] = [];
  loading = false;
  loadingCourses = false;
  searchStudent = '';
  private destroy$ = new Subject<void>();

  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      students: this.studentService.loadAll(),
      courses:  this.courseService.loadAll()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ students, courses }) => {
        this.students = students.data;
        this.courses  = courses.data;
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filteredStudents(): Student[] {
    const q = this.searchStudent.toLowerCase();
    return q ? this.students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)) : this.students;
  }

  onStudentSelect(studentId: number): void {
    this.selectedStudentId = studentId;
    this.selectedStudent   = this.students.find(s => s.id === studentId) || null;
    this.loadEnrolledCourses(studentId);
  }

  loadEnrolledCourses(studentId: number): void {
    this.loadingCourses = true;
    this.studentService.getCourses(studentId).subscribe({
      next: res => { this.enrolledCourses = res.data; this.loadingCourses = false; },
      error: () => { this.loadingCourses = false; }
    });
  }

  openEnroll(): void {
    this.dialog.open(EnrollDialogComponent, {
      data: { students: this.students, courses: this.courses }, width: '520px'
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.studentService.enroll(result.studentId, result.courseId).subscribe({
        next: () => {
          this.toast.success('Student enrolled successfully');
          if (this.selectedStudentId === result.studentId) {
            this.loadEnrolledCourses(result.studentId);
          }
        },
        error: () => {}
      });
    });
  }

  unenroll(course: Course): void {
    if (!this.selectedStudent) return;
    const s = this.selectedStudent;
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Unenroll Student',
        message: `Remove ${s.firstName} ${s.lastName} from "${course.name}"?`,
        confirmText: 'Unenroll', type: 'warning'
      }, width: '400px'
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.studentService.unenroll(s.id, course.id).subscribe({
        next: () => {
          this.toast.success('Student unenrolled successfully');
          this.enrolledCourses = this.enrolledCourses.filter(c => c.id !== course.id);
        },
        error: () => {}
      });
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}

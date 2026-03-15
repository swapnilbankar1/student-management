import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { CourseService } from '../../../../core/services/course.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Course } from '../../../../core/models/course.model';
import { CourseFormDialogComponent } from '../course-form-dialog/course-form-dialog.component';
import { CourseStudentsDialogComponent } from '../course-students-dialog/course-students-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatCardModule,
    MatProgressSpinnerModule, MatTooltipModule, MatChipsModule
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  filtered: Course[] = [];
  loading = false;
  search = '';
  displayedColumns = ['code', 'name', 'description', 'credits', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.courseService.loading$.pipe(takeUntil(this.destroy$)).subscribe(l => this.loading = l);
    this.courseService.courses$.pipe(takeUntil(this.destroy$)).subscribe(courses => {
      this.courses = courses;
      this.applyFilter();
    });
    this.courseService.loadAll().subscribe();
  }

  applyFilter(): void {
    const q = this.search.toLowerCase();
    this.filtered = q
      ? this.courses.filter(c =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q))
      : [...this.courses];
  }

  openCreate(): void {
    this.dialog.open(CourseFormDialogComponent, { data: { mode: 'create' }, width: '520px' })
      .afterClosed().subscribe(result => {
        if (!result) return;
        this.courseService.create(result).subscribe({
          next: () => this.toast.success('Course created successfully'),
          error: () => {}
        });
      });
  }

  openEdit(course: Course): void {
    this.dialog.open(CourseFormDialogComponent, { data: { mode: 'edit', course }, width: '520px' })
      .afterClosed().subscribe(result => {
        if (!result) return;
        this.courseService.update(course.id, result).subscribe({
          next: () => this.toast.success('Course updated successfully'),
          error: () => {}
        });
      });
  }

  openStudents(course: Course): void {
    this.dialog.open(CourseStudentsDialogComponent, { data: course, width: '480px' });
  }

  openDelete(course: Course): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Course',
        message: `Are you sure you want to delete "${course.name}"? All student enrollments for this course will be removed.`,
        confirmText: 'Delete', type: 'danger'
      }, width: '420px'
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.courseService.delete(course.id).subscribe({
        next: () => this.toast.success('Course deleted successfully'),
        error: () => {}
      });
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}

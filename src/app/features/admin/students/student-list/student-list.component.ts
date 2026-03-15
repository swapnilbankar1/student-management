import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Student } from '../../../../core/models/student.model';
import { StudentFormDialogComponent } from '../student-form-dialog/student-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatCardModule,
    MatChipsModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  filtered: Student[] = [];
  loading = false;
  search = '';
  displayedColumns = ['name', 'email', 'phone', 'courses', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private studentService: StudentService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.studentService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(l => this.loading = l);

    this.studentService.students$
      .pipe(takeUntil(this.destroy$))
      .subscribe(students => {
        this.students = students;
        this.applyFilter();
      });

    this.studentService.loadAll().subscribe();
  }

  applyFilter(): void {
    const q = this.search.toLowerCase();
    this.filtered = q
      ? this.students.filter(s =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q)  ||
          s.email.toLowerCase().includes(q))
      : [...this.students];
  }

  openCreate(): void {
    const ref = this.dialog.open(StudentFormDialogComponent, {
      data: { mode: 'create' }, width: '520px'
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.studentService.create(result).subscribe({
        next: () => this.toast.success('Student created successfully'),
        error: () => {}
      });
    });
  }

  openEdit(student: Student): void {
    const ref = this.dialog.open(StudentFormDialogComponent, {
      data: { mode: 'edit', student }, width: '520px'
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.studentService.update(student.id, result).subscribe({
        next: () => this.toast.success('Student updated successfully'),
        error: () => {}
      });
    });
  }

  openDelete(student: Student): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This will also remove all their enrollments.`,
        confirmText: 'Delete',
        type: 'danger'
      }, width: '400px'
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.studentService.delete(student.id).subscribe({
        next: () => this.toast.success('Student deleted successfully'),
        error: () => {}
      });
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}

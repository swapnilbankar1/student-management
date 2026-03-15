import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Course } from '../../../../core/models/course.model';

export interface CourseDialogData {
  course?: Course;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-course-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './course-form-dialog.component.html',
  styleUrl: './course-form-dialog.component.scss'
})
export class CourseFormDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  get isEdit(): boolean { return this.data.mode === 'edit'; }
  get title(): string   { return this.isEdit ? 'Edit Course' : 'Add New Course'; }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CourseFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CourseDialogData
  ) {}

  ngOnInit(): void {
    const c = this.data.course;
    this.form = this.fb.group({
      code:        [c?.code        ?? '', [Validators.required, Validators.maxLength(20)]],
      name:        [c?.name        ?? '', [Validators.required, Validators.maxLength(100)]],
      description: [c?.description ?? '', Validators.maxLength(500)],
      credits:     [c?.credits     ?? 3,  [Validators.required, Validators.min(1), Validators.max(6)]]
    });
    if (this.isEdit) {
      this.form.get('code')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = { ...this.form.getRawValue() };
    this.dialogRef.close(value);
  }
}

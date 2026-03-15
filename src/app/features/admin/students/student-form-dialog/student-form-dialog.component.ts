import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Student } from '../../../../core/models/student.model';

export interface StudentDialogData {
  student?: Student;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-student-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './student-form-dialog.component.html',
  styleUrl: './student-form-dialog.component.scss'
})
export class StudentFormDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  get isEdit(): boolean { return this.data.mode === 'edit'; }
  get title(): string   { return this.isEdit ? 'Edit Student' : 'Add New Student'; }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StudentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentDialogData
  ) {}

  ngOnInit(): void {
    const s = this.data.student;
    this.form = this.fb.group({
      firstName: [s?.firstName ?? '', [Validators.required, Validators.maxLength(50)]],
      lastName:  [s?.lastName  ?? '', [Validators.required, Validators.maxLength(50)]],
      email:     [s?.email     ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone:     [s?.phone     ?? '', [Validators.pattern(/^[\d\-+()\s]{0,20}$/)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Student } from '../../../../core/models/student.model';
import { Course } from '../../../../core/models/course.model';

export interface EnrollDialogData {
  students: Student[];
  courses: Course[];
}

@Component({
  selector: 'app-enroll-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatAutocompleteModule, MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './enroll-dialog.component.html',
  styleUrl: './enroll-dialog.component.scss'
})
export class EnrollDialogComponent implements OnInit {
  form!: FormGroup;
  filteredStudents$!: Observable<Student[]>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EnrollDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EnrollDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      studentSearch: [''],
      studentId: ['', Validators.required],
      courseId:  ['', Validators.required]
    });

    this.filteredStudents$ = this.form.get('studentSearch')!.valueChanges.pipe(
      startWith(''),
      map(val => this.filterStudents(val || ''))
    );
  }

  private filterStudents(val: string): Student[] {
    const q = val.toLowerCase();
    return this.data.students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q));
  }

  selectStudent(student: Student): void {
    this.form.patchValue({ studentId: student.id });
  }

  displayStudent(student: Student): string {
    return student ? `${student.firstName} ${student.lastName}` : '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({
      studentId: this.form.value.studentId,
      courseId:  this.form.value.courseId
    });
  }
}

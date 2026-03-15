import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CourseService } from '../../../../core/services/course.service';
import { Student } from '../../../../core/models/student.model';
import { Course } from '../../../../core/models/course.model';

@Component({
  selector: 'app-course-students-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatListModule, MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './course-students-dialog.component.html',
  styleUrl: './course-students-dialog.component.scss'
})
export class CourseStudentsDialogComponent implements OnInit {
  students: Student[] = [];
  loading = true;

  constructor(
    private courseService: CourseService,
    public dialogRef: MatDialogRef<CourseStudentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public course: Course
  ) {}

  ngOnInit(): void {
    this.courseService.getStudents(this.course.id).subscribe({
      next: res => { this.students = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

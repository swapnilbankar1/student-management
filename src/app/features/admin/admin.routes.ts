import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./students/student-list/student-list.component').then(m => m.StudentListComponent)
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./courses/course-list/course-list.component').then(m => m.CourseListComponent)
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./enrollments/enrollment-management/enrollment-management.component')
            .then(m => m.EnrollmentManagementComponent)
      }
    ]
  }
];

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="unauth-page">
      <mat-icon>lock</mat-icon>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <button mat-raised-button color="primary" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon> Go Back
      </button>
    </div>
  `,
  styles: [`
    .unauth-page {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; text-align: center;
      mat-icon { font-size: 80px; width: 80px; height: 80px; color: #f44336; }
      h1 { font-size: 32px; margin: 16px 0 8px; }
      p { color: #666; margin-bottom: 24px; }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  goBack(): void { this.router.navigate(['/admin/dashboard']); }
}

import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-header" [class]="data.type || 'danger'">
        <mat-icon>{{ icon }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button
                [color]="data.type === 'danger' ? 'warn' : 'primary'"
                (click)="dialogRef.close(true)">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { min-width: 360px; }
    .confirm-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 24px 8px;
      &.danger  { mat-icon { color: #f44336; } }
      &.warning { mat-icon { color: #ff9800; } }
      &.info    { mat-icon { color: #2196f3; } }
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
      h2 { margin: 0; font-size: 20px; }
    }
    mat-dialog-content p { color: #555; font-size: 15px; margin: 8px 0; }
    mat-dialog-actions { padding: 8px 16px 16px !important; gap: 8px; }
  `]
})
export class ConfirmDialogComponent {
  get icon(): string {
    return this.data.type === 'warning' ? 'warning'
         : this.data.type === 'info'    ? 'info'
         : 'delete_forever';
  }

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}

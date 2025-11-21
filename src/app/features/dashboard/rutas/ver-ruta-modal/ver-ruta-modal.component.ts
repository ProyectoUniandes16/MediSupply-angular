import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ver-ruta-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './ver-ruta-modal.component.html',
  styleUrl: './ver-ruta-modal.component.scss'
})
export class VerRutaModalComponent {
  htmlContent: SafeHtml;

  constructor(
    private readonly dialogRef: MatDialogRef<VerRutaModalComponent>,
    private readonly sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: { html: string }
  ) {
    // Sanitizar el HTML para permitir su visualización segura
    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(data.html);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

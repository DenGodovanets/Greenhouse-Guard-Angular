import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { form, FormField, submit, min, max } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { OfflineQueueService } from '@services';
import { SubmitReadingService } from '@services';
import { LABELS } from '@constants';
import { SubmitState } from '@enums';

@Component({
  selector: 'app-submit-reading',
  templateUrl: './submit-reading.component.html',
  styleUrl: './submit-reading.component.scss',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormField,
  ],
})
export class SubmitReadingComponent {
  private readonly dialogRef = inject(MatDialogRef<SubmitReadingComponent>);
  private readonly submitService = inject(SubmitReadingService);
  readonly offlineQueue = inject(OfflineQueueService);
  readonly labels = LABELS;
  readonly submitState = signal<SubmitState>(SubmitState.Idle);
  readonly SubmitState = SubmitState;

  readonly readingModel = signal({
    temperature: 22.0,
    humidity: 65.0,
    co2Ppm: 800,
  });

  readonly readingForm = form(this.readingModel, (s) => {
    min(s.temperature, -40, { message: 'Min −40 °C' });
    max(s.temperature, 85, { message: 'Max 85 °C' });
    min(s.humidity, 0, { message: 'Min 0 %' });
    max(s.humidity, 100, { message: 'Max 100 %' });
    min(s.co2Ppm, 300, { message: 'Min 300 PPM' });
    max(s.co2Ppm, 5000, { message: 'Max 5000 PPM' });
  });

  handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    submit(this.readingForm, async () => {
      const reading = this.readingModel();
      const success = await firstValueFrom(this.submitService.submitReading(reading));

      if (success) {
        this.submitState.set(SubmitState.Success);
        this.dialogRef.close();
      } else {
        this.submitState.set(SubmitState.Queued);
      }
    });
  }
}

import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Anomaly } from '@core/models/anomaly.model';
import { LABELS } from '@core/constants/labels';

@Component({
  selector: 'app-anomaly-list',
  templateUrl: './anomaly-list.component.html',
  styleUrl: './anomaly-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, TitleCasePipe, MatIconModule],
})
export class AnomalyListComponent {
  readonly labels = LABELS;

  readonly anomalies = input.required<Anomaly[] | null>();
}

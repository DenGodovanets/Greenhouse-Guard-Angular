import { Component, input } from '@angular/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Anomaly } from '@models';
import { LABELS } from '@constants';

@Component({
  selector: 'app-anomaly-list',
  templateUrl: './anomaly-list.component.html',
  styleUrl: './anomaly-list.component.scss',
  imports: [DatePipe, DecimalPipe, TitleCasePipe, MatIconModule],
})
export class AnomalyListComponent {
  readonly labels = LABELS;

  readonly anomalies = input<Anomaly[] | null>(null);
}

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { SensorDataService } from '@core/services/sensor-data.service';
import { HeaderComponent } from './components/header/header.component';
import { SensorGridComponent } from './components/sensor-grid/sensor-grid.component';
import { AnomalyListComponent } from './components/anomaly-list/anomaly-list.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    SensorGridComponent,
    AnomalyListComponent,
    AsyncPipe,
  ],
})
export class DashboardComponent {
  private readonly sensorDataService = inject(SensorDataService);
  readonly currentReading$ = this.sensorDataService.currentReading$;
  readonly lastUpdatedAt$ = this.sensorDataService.currentReading$.pipe(
    map(reading => reading?.timestamp ?? null)
  );
  readonly anomalies$ = this.sensorDataService.anomalies$;
  readonly connectionStatus$ = this.sensorDataService.connectionStatus$;
}

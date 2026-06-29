import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SensorDataService } from '@services';
import { ConnectionStatus } from '@enums';
import { HeaderComponent, SensorGridComponent, AnomalyListComponent, ReadingsChartComponent } from '@components';
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
    ReadingsChartComponent,
    AsyncPipe,
    MatProgressSpinnerModule,
  ],
})
export class DashboardComponent {
  private readonly sensorDataService = inject(SensorDataService);
  readonly currentReading$ = this.sensorDataService.currentReading$;
  readonly lastUpdatedAt$ = this.sensorDataService.currentReading$.pipe(
    map(reading => reading?.timestamp ?? null)
  );
  readonly anomalies$ = this.sensorDataService.anomalies$;
  readonly readings$ = this.sensorDataService.readings$;
  readonly connectionStatus$ = this.sensorDataService.connectionStatus$;
  readonly ConnectionStatus = ConnectionStatus;
}

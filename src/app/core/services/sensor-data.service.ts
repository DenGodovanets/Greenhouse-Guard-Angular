import { inject, Service, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, scan, shareReplay, startWith, switchMap, map } from 'rxjs';
import { environment } from '@env';
import { SensorReading } from '@core/models/sensor-reading.model';
import { Anomaly } from '@core/models/anomaly.model';
import { SignalRService } from '@core/services/signalr.service';
import { ConnectionStatus } from '@core/enums/connection-status.enum';

@Service()
export class SensorDataService {
  private readonly http = inject(HttpClient);
  private readonly signalR = inject(SignalRService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly readingLatestUrl = `${environment.apiUrl}/readings/latest`;
  private readonly anomaliesUrl = `${environment.apiUrl}/anomalies`;

  readonly connectionStatus$: Observable<ConnectionStatus> =
    this.signalR.connectionStatus$.asObservable();

  readonly currentReading$: Observable<SensorReading | null> = this.http
    .get<SensorReading>(this.readingLatestUrl)
    .pipe(
      switchMap((initial) => this.signalR.sensorReading$.pipe(startWith(initial))),
      shareReplay(1),
    );

  readonly anomalies$: Observable<Anomaly[]> = this.http
    .get<Anomaly[]>(this.anomaliesUrl)
    .pipe(
      map((initial: Anomaly[]) => initial.slice(0, 10)),
      switchMap((initial) =>
        this.signalR.anomaly$.pipe(
          scan((acc, anomaly) => [anomaly, ...acc].slice(0, 10), initial),
          startWith(initial),
        ),
      ),
      shareReplay(1),
    );

  constructor() {
    this.signalR.connect();
    this.destroyRef.onDestroy(() => this.signalR.disconnect());
  }
}

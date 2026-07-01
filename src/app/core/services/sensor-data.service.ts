import { inject, Service, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  scan,
  shareReplay,
  filter,
  switchMap,
  startWith,
  map,
  catchError,
  of,
} from 'rxjs';
import { environment } from '@env';
import { SensorReading, Anomaly } from '@models';
import { SignalRService } from '@services';
import { ConnectionStatus } from '@enums';

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
      catchError(() => of(null)),
      switchMap((initial: SensorReading | null) =>
        this.signalR.sensorReading$.pipe(startWith(initial)),
      ),
      shareReplay(1),
    );

  readonly anomalies$: Observable<Anomaly[]> = this.http.get<Anomaly[]>(this.anomaliesUrl).pipe(
    catchError(() => of([])),
    map((initial: Anomaly[]) => initial.slice(0, 10)),
    switchMap((initial: Anomaly[]) =>
      this.signalR.anomaly$.pipe(
        scan((acc: Anomaly[], anomaly: Anomaly) => [anomaly, ...acc].slice(0, 10), initial),
        startWith(initial),
      ),
    ),
    shareReplay(1),
  );

  readonly readings$: Observable<SensorReading[]> = this.currentReading$.pipe(
    filter(Boolean),
    scan((acc, reading) => [reading, ...acc].slice(0, 20), [] as SensorReading[]),
  );

  constructor() {
    this.signalR.connect();
    this.destroyRef.onDestroy(() => this.signalR.disconnect());
  }
}

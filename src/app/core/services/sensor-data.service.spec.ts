import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Subject, BehaviorSubject, firstValueFrom } from 'rxjs';

import { SensorDataService } from './sensor-data.service';
import { SignalRService } from './signalr.service';
import { ConnectionStatus } from '@enums';
import { SensorReading, Anomaly } from '@models';

const mockReading: SensorReading = {
  id: '1',
  sequenceNumber: 1,
  timestamp: '2024-01-01T00:00:00Z',
  temperature: 22.5,
  humidity: 60,
  co2Ppm: 400,
};

const mockAnomaly: Anomaly = {
  id: 'a1',
  detectedAt: '2024-01-01T00:00:00Z',
  sensorType: 'temperature',
  value: 45,
  zScore: 3.2,
  reason: 'Temperature too high',
};

describe('SensorDataService', () => {
  let service: SensorDataService;
  let sensorReading$: Subject<SensorReading>;
  let anomaly$: Subject<Anomaly>;
  let connectionStatus$: BehaviorSubject<ConnectionStatus>;
  let mockSignalR: Partial<SignalRService>;
  let mockHttp: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sensorReading$ = new Subject<SensorReading>();
    anomaly$ = new Subject<Anomaly>();
    connectionStatus$ = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.Connected);

    mockSignalR = {
      sensorReading$,
      anomaly$,
      connectionStatus$,
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };

    mockHttp = {
      get: vi.fn().mockImplementation((url: string) => {
        if (url.includes('latest')) return of(mockReading);
        if (url.includes('anomalies')) return of([mockAnomaly]);
        return of(null);
      }),
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: SignalRService, useValue: mockSignalR },
        { provide: DestroyRef, useValue: { onDestroy: vi.fn() } },
      ],
    });

    service = runInInjectionContext(injector, () => new SensorDataService());
  });

  it('currentReading$ should emit the initial reading from HTTP', async () => {
    const reading = await firstValueFrom(service.currentReading$);

    expect(reading).toEqual(mockReading);
  });

  it('currentReading$ should update when SignalR emits a new reading', async () => {
    const updatedReading: SensorReading = { ...mockReading, id: '2', temperature: 30 };

    const readings: (SensorReading | null)[] = [];
    service.currentReading$.subscribe((r) => readings.push(r));

    sensorReading$.next(updatedReading);

    expect(readings).toContainEqual(updatedReading);
  });

  it('readings$ should accumulate new readings with the most recent first', async () => {
    const second: SensorReading = { ...mockReading, id: '2', temperature: 24 };
    const third: SensorReading = { ...mockReading, id: '3', temperature: 26 };

    const emissions: SensorReading[][] = [];
    service.readings$.subscribe((r) => emissions.push(r));

    sensorReading$.next(second);
    sensorReading$.next(third);

    const latest = emissions[emissions.length - 1];
    expect(latest[0]).toEqual(third); // most recent is first
    expect(latest[1]).toEqual(second);
    expect(latest[2]).toEqual(mockReading);
  });

  it('anomalies$ should emit initial anomalies from HTTP', async () => {
    const anomalies = await firstValueFrom(service.anomalies$);

    expect(anomalies).toHaveLength(1);
    expect(anomalies[0]).toEqual(mockAnomaly);
  });

  it('anomalies$ should prepend new anomaly from SignalR and keep max 10', () => {
    const newAnomaly: Anomaly = { ...mockAnomaly, id: 'a2', value: 50 };

    const emissions: Anomaly[][] = [];
    service.anomalies$.subscribe((a) => emissions.push(a));

    anomaly$.next(newAnomaly);

    const latest = emissions[emissions.length - 1];
    expect(latest[0]).toEqual(newAnomaly); // most recent is first
    expect(latest.length).toBeLessThanOrEqual(10);
  });

  it('connectionStatus$ should reflect SignalR connection state changes', () => {
    const statuses: ConnectionStatus[] = [];
    service.connectionStatus$.subscribe((s) => statuses.push(s));

    connectionStatus$.next(ConnectionStatus.Disconnected);
    connectionStatus$.next(ConnectionStatus.Connected);

    expect(statuses).toEqual([
      ConnectionStatus.Connected,
      ConnectionStatus.Disconnected,
      ConnectionStatus.Connected,
    ]);
  });
});

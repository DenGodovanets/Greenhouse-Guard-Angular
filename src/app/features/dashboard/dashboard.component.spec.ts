import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { SensorDataService } from '@services';
import { ConnectionStatus } from '@enums';
import { SensorReading, Anomaly } from '@models';
import {
  HeaderComponent,
  SensorGridComponent,
  AnomalyListComponent,
  ReadingsChartComponent,
} from '@components';

vi.mock('@microsoft/signalr', () => ({
  HubConnectionState: { Disconnected: 0, Connecting: 1, Connected: 2 },
  HubConnectionBuilder: class {
    withUrl() {
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    build() {
      return {
        state: 0,
        start: vi.fn(),
        stop: vi.fn(),
        on: vi.fn(),
        onreconnecting: vi.fn(),
        onreconnected: vi.fn(),
        onclose: vi.fn(),
      };
    }
  },
}));

vi.mock('@env', () => ({
  environment: {
    apiUrl: 'http://localhost:5000/api',
    signalRHubUrl: 'http://localhost:5000/sensorchannel',
  },
}));

vi.mock('ng2-charts', () => ({ BaseChartDirective: class {} }));

@Component({ selector: 'app-header', template: '' })
class StubHeaderComponent {}

@Component({ selector: 'app-sensor-grid', template: '' })
class StubSensorGridComponent {}

@Component({ selector: 'app-anomaly-list', template: '' })
class StubAnomalyListComponent {}

@Component({ selector: 'app-readings-chart', template: '' })
class StubReadingsChartComponent {}

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const mockSensorDataService = {
      currentReading$: new BehaviorSubject<SensorReading | null>(null),
      anomalies$: new BehaviorSubject<Anomaly[]>([]),
      readings$: new BehaviorSubject<SensorReading[]>([]),
      connectionStatus$: new BehaviorSubject<ConnectionStatus>(ConnectionStatus.Connected),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: SensorDataService, useValue: mockSensorDataService }],
    })
      .overrideComponent(DashboardComponent, {
        remove: {
          imports: [
            HeaderComponent,
            SensorGridComponent,
            AnomalyListComponent,
            ReadingsChartComponent,
          ],
        },
        add: {
          imports: [
            StubHeaderComponent,
            StubSensorGridComponent,
            StubAnomalyListComponent,
            StubReadingsChartComponent,
          ],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});

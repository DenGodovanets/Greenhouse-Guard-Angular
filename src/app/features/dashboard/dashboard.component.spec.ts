import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { SensorDataService } from '@services';
import { ConnectionStatus } from '@enums';
import { SensorReading, Anomaly } from '@models';

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

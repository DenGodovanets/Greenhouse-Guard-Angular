import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Directive } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

import { ReadingsChartComponent } from './anomaly-chart.component';
import { SensorReading } from '@models';

vi.mock('ng2-charts', () => ({ BaseChartDirective: class {} }));

@Directive({ selector: '[baseChart]' })
class StubBaseChartDirective {}

const mockReadings: SensorReading[] = [
  {
    id: '1',
    sequenceNumber: 1,
    timestamp: '2024-01-01T10:00:00Z',
    temperature: 22,
    humidity: 60,
    co2Ppm: 400,
  },
  {
    id: '2',
    sequenceNumber: 2,
    timestamp: '2024-01-01T10:01:00Z',
    temperature: 25,
    humidity: 65,
    co2Ppm: 420,
  },
];

describe('ReadingsChartComponent', () => {
  let fixture: ComponentFixture<ReadingsChartComponent>;
  let component: ReadingsChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingsChartComponent],
    })
      .overrideComponent(ReadingsChartComponent, {
        remove: { imports: [BaseChartDirective] },
        add: { imports: [StubBaseChartDirective] },
      })
      .overrideTemplate(ReadingsChartComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ReadingsChartComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default selected sensor to temperature', () => {
    expect(component.selectedSensor()).toBe('temperature');
  });

  it('should expose all three sensor keys', () => {
    expect(component.sensorKeys).toEqual(
      expect.arrayContaining(['temperature', 'humidity', 'co2Ppm']),
    );
    expect(component.sensorKeys).toHaveLength(3);
  });

  it('should compute chartData with temperature values by default', () => {
    vi.spyOn(component as any, 'readings').mockReturnValue(mockReadings);
    const data = component.chartData();
    expect(data.datasets[0].data).toEqual([22, 25]);
    expect(data.labels).toHaveLength(2);
  });

  it('should update chartData when selected sensor changes', () => {
    vi.spyOn(component as any, 'readings').mockReturnValue(mockReadings);
    component.selectedSensor.set('humidity');
    const data = component.chartData();
    expect(data.datasets[0].data).toEqual([60, 65]);
    expect(data.datasets[0].label).toContain('Humidity');
  });

  it('should return empty datasets when readings is null', () => {
    vi.spyOn(component as any, 'readings').mockReturnValue(null);
    const data = component.chartData();
    expect(data.datasets[0].data).toEqual([]);
    expect(data.labels).toEqual([]);
  });
});

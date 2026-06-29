import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { SensorReading } from '@models';
import { SensorStatus } from '@enums';
import { SENSOR_THRESHOLDS, LABELS } from '@constants';

@Component({
  selector: 'app-sensor-grid',
  templateUrl: './sensor-grid.component.html',
  styleUrl: './sensor-grid.component.scss',
  imports: [DecimalPipe, MatCardModule, MatIconModule],
})
export class SensorGridComponent {
  readonly labels = LABELS;

  readonly currentReading = input.required<SensorReading | null>();

  readonly tempStatus = computed<SensorStatus>(() => {
    const t = this.currentReading()?.temperature;
    const { dangerHigh, dangerLow, warningHigh } = SENSOR_THRESHOLDS.temperature;
    if (t == null) return SensorStatus.Success;
    if (t > dangerHigh || t < dangerLow) return SensorStatus.Danger;
    if (t > warningHigh) return SensorStatus.Warning;
    return SensorStatus.Success;
  });

  readonly humidityStatus = computed<SensorStatus>(() => {
    const h = this.currentReading()?.humidity;
    const { dangerHigh, dangerLow, warningHigh, warningLow } = SENSOR_THRESHOLDS.humidity;
    if (h == null) return SensorStatus.Success;
    if (h > dangerHigh || h < dangerLow) return SensorStatus.Danger;
    if (h > warningHigh || h < warningLow) return SensorStatus.Warning;
    return SensorStatus.Success;
  });

  readonly co2Status = computed<SensorStatus>(() => {
    const c = this.currentReading()?.co2Ppm;
    const { dangerHigh, warningHigh } = SENSOR_THRESHOLDS.co2;
    if (c == null) return SensorStatus.Success;
    if (c > dangerHigh) return SensorStatus.Danger;
    if (c > warningHigh) return SensorStatus.Warning;
    return SensorStatus.Success;
  });
}

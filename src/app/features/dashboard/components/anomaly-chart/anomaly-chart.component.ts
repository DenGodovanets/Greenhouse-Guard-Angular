import { Component, input, signal, computed } from '@angular/core';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartData,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { SensorReading } from '@models';
import { SensorKey, SENSOR_CHART_CONFIG } from '@constants';

@Component({
  selector: 'app-readings-chart',
  templateUrl: './anomaly-chart.component.html',
  styleUrl: './anomaly-chart.component.scss',
  imports: [BaseChartDirective],
  providers: [
    provideCharts({
      registerables: [
        LineController,
        LineElement,
        PointElement,
        CategoryScale,
        LinearScale,
        Filler,
        Tooltip,
        Legend,
      ],
    }),
  ],
})
export class ReadingsChartComponent {
  readonly readings = input<SensorReading[] | null>(null);

  readonly selectedSensor = signal<SensorKey>('temperature');

  readonly sensorKeys = Object.keys(SENSOR_CHART_CONFIG) as SensorKey[];

  readonly sensorConfig = SENSOR_CHART_CONFIG;

  readonly chartData = computed((): ChartData<'line'> => {
    const sensor = this.selectedSensor();
    const config = SENSOR_CHART_CONFIG[sensor];
    const data = [...(this.readings() ?? [])].reverse();

    return {
      labels: data.map((r) =>
        new Date(r.timestamp).toLocaleTimeString('en', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      ),
      datasets: [
        {
          label: `${config.label} (${config.unit})`,
          data: data.map((r) => r[sensor]),
          borderColor: config.color,
          backgroundColor: `${config.color}1a`,
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  });

  readonly chartOptions: Readonly<ChartConfiguration<'line'>['options']> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)', maxRotation: 45 },
        grid: { display: false },
      },
    },
  };
}

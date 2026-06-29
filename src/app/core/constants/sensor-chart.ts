export type SensorKey = 'temperature' | 'humidity' | 'co2Ppm';

export const SENSOR_CHART_CONFIG: Record<SensorKey, { label: string; color: string; unit: string }> = {
  temperature: { label: 'Temperature', color: '#ff6b6b', unit: '°C'  },
  humidity:    { label: 'Humidity',    color: '#4ecdc4', unit: '%'   },
  co2Ppm:         { label: 'CO2',         color: '#ffd93d', unit: 'ppm' },
};

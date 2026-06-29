export interface Anomaly {
  id: string;
  detectedAt: string;
  sensorType: string;
  value: number;
  zScore: number;
  reason: string;
}

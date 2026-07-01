export interface SubmittableSensorReading {
  temperature: number;
  humidity: number;
  co2Ppm: number;
}

export interface QueuedReading {
  reading: SubmittableSensorReading;
  queuedAt: string;
}

export const SENSOR_THRESHOLDS = {
  temperature: {
    dangerHigh: 28,
    dangerLow: 15,
    warningHigh: 25,
  },
  humidity: {
    dangerHigh: 80,
    dangerLow: 40,
    warningHigh: 70,
    warningLow: 50,
  },
  co2: {
    dangerHigh: 1200,
    warningHigh: 900,
  },
} as const;

export const LABELS = {
  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    title: 'Greenhouse Monitor',
    connection: {
      live: 'LIVE',
      offline: 'OFFLINE',
      liveAriaLabel: 'Connection status: Live',
      offlineAriaLabel: 'Connection status: Offline',
    },
  },

  // ── Sensor Cards ──────────────────────────────────────────────────────────
  sensors: {
    temperature: {
      label: 'Temperature',
      unit: '°C',
      unitLabel: 'Celsius (°C)',
    },
    humidity: {
      label: 'Humidity',
      unit: '%',
      unitLabel: 'Relative (%)',
    },
    co2: {
      label: 'CO2',
      unit: 'PPM',
      unitLabel: 'Parts Per Million (PPM)',
    },
  },

  // ── Anomalies Section ─────────────────────────────────────────────────────
  anomalies: {
    sectionTitle: 'Anomalies Detected',
    noAnomalies: 'No anomalies detected',
    detectionReason: 'Detection Reason',
    detectedAt: 'Detected',
  },

  // ── Status Messages ───────────────────────────────────────────────────────
  status: {
    success: 'Normal',
    warning: 'Warning',
    danger: 'Critical',
  },

  // ── Accessibility Labels ─────────────────────────────────────────────────
  accessibility: {
    sensorIcon: 'Sensor icon',
    statusIndicator: 'Status indicator',
    anomalyIcon: 'Anomaly icon',
  },

  // ── Submit Reading Dialog ─────────────────────────────────────────────────
  submitReading: {
    dialogTitle: 'Submit Sensor Reading',
    closeDialogLabel: 'Close dialog',
    temperatureLabel: 'Temperature',
    humidityLabel: 'Humidity',
    co2Label: 'CO₂',
    successMessage: 'Reading submitted successfully!',
    queuedMessage: 'Saved offline — will sync when back online.',
    offlineMessage: 'Internet issue — data saved locally and will be sent on next submit.',
    cancelButton: 'Cancel',
    submitButton: 'Submit',
    queueNotice: (count: number) => `${count} reading(s) pending sync`,
  },
} as const;

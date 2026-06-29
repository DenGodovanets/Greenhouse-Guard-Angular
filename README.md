# Greenhouse Guard - Angular Dashboard

Real-time greenhouse sensor monitoring with temperature, humidity, and CO2 tracking. Uses SignalR for live updates.

## Quick Start

### Prerequisites
- Node.js 22+
- npm 11+

### Installation
```bash
npm install
npm run start
# App runs at http://localhost:4200/
```

## Available Commands

```bash
npm start              # Dev server
npm run build          # Production build
npm run test           # Run tests
npm run lint           # Check code
npm run lint:fix       # Fix issues
npm run format         # Format code
```

## Project Structure

```
src/app/
├── core/
│   ├── services/
│   │   ├── sensor-data.service.ts      # Main service - fetches readings & anomalies
│   │   ├── signalr.service.ts          # WebSocket connection to .NET hub
│   ├── models/
│   │   ├── sensor-reading.model.ts     # {id, temperature, humidity, co2Ppm, timestamp}
│   │   └── anomaly.model.ts            # {id, sensorType, value, zScore, reason}
│   └── enums/                          # Connection status, hub events
└── features/
    └── dashboard/
        ├── dashboard.component.ts      # Main smart component
        └── components/
            ├── header/                 # Connection status & last update
            ├── sensor-grid/            # Shows current temp/humidity/CO2
            ├── anomaly-list/           # Recent anomalies table
            └── anomaly-chart/          # Historical data chart
```

---

## How It Works

### Data Flow

```
.NET Backend (SignalR hub)
    ↓
SignalRService (WebSocket connection)
    ├── sensorReading$ (Subject)
    └── anomaly$ (Subject)
    ↓
SensorDataService (aggregates data)
    ├── currentReading$ (latest sensor reading)
    ├── readings$ (last 20 readings)
    └── anomalies$ (last 10 anomalies)
    ↓
DashboardComponent (smart component)
    ├→ HeaderComponent (shows connection status)
    ├→ SensorGridComponent (shows 3 cards: temp, humidity, CO2)
    ├→ AnomalyListComponent (shows anomalies list)
    └→ ReadingsChartComponent (shows historical chart)
```

### Real Services

**SensorDataService** - manages current readings and anomalies
```typescript
// Automatically connects on init
this.signalRService.connect();

// Exposes these observables:
public readonly connectionStatus$ = this.signalRService.connectionStatus$;
public readonly currentReading$ = this.signalRService.sensorReading$.pipe(...);
public readonly readings$ = this.signalRService.sensorReading$.pipe(
  scan((acc: SensorReading[], reading: SensorReading) => {
    // Keep last 20 readings
    return [...acc.slice(-19), reading];
  }, [])
);
public readonly anomalies$ = this.signalRService.anomaly$.pipe(
  scan((acc: Anomaly[], anomaly: Anomaly) => {
    // Keep last 10 anomalies
    return [...acc.slice(-9), anomaly];
  }, [])
);
```

**SignalRService** - WebSocket connection
```typescript
public connect(): void {
  // Connects to your .NET SignalR hub
  // Auto-reconnects on disconnect
  // Emits to sensorReading$ and anomaly$ subjects
}

public disconnect(): void {
  // Stops connection
}
```

### Real Models

**SensorReading** - what each sensor reading contains
```typescript
export interface SensorReading {
  id: string;
  sequenceNumber: number;
  timestamp: string;           // ISO timestamp
  temperature: number;         // Celsius
  humidity: number;            // Percentage (0-100)
  co2Ppm: number;             // CO2 concentration
}
```

**Anomaly** - what anomaly detection returns
```typescript
export interface Anomaly {
  id: string;
  detectedAt: string;
  sensorType: string;          // 'temperature' | 'humidity' | 'co2Ppm'
  value: number;               // The anomalous reading
  zScore: number;              // Statistical anomaly severity
  reason: string;              // Why it's anomalous
}
```

### Real Components

**DashboardComponent** (container/smart component)
```typescript
// Just passes service observables to child components
export class DashboardComponent {
  private readonly sensorService = inject(SensorDataService);

  public readonly currentReading$ = this.sensorService.currentReading$;
  public readonly readings$ = this.sensorService.readings$;
  public readonly anomalies$ = this.sensorService.anomalies$;
  public readonly connectionStatus$ = this.sensorService.connectionStatus$;
}
```

**SensorGridComponent** (displays 3 sensor cards)
```typescript
// Shows current temperature, humidity, CO2
// Receives currentReading$ from parent
public readonly reading = input.required<SensorReading>();

// Displays with status indicator (Success/Warning/Danger)
```

**AnomalyListComponent** (anomalies table)
```typescript
// Shows list of recent anomalies
// Each row displays: sensor type, value, z-score, detection time
public readonly anomalies = input.required<Anomaly[]>();
```

**ReadingsChartComponent** (historical chart)
```typescript
// Line chart showing last 20 readings
// User can select which sensor to view (temperature/humidity/CO2)
// Uses Chart.js + ng2-charts
public readonly readings = input.required<SensorReading[]>();
```

---

## Best Practices Used Here

- ✅ **OnPush change detection** - default on all components
- ✅ **Standalone components** - no NgModules
- ✅ **Services in root** - `providedIn: 'root'`
- ✅ **Private readonly fields** - fields that don't change are `private readonly`
- ✅ **Async pipe** - all subscriptions handled by template, no manual unsubscribe
- ✅ **RxJS Subjects in services** - not in components

---

## Code Quality

- ✅ Unused imports removed from ESLint (test files excluded)
- ✅ All service fields use `private readonly` where possible
- ✅ No legacy lifecycle hooks (OnDestroy, OnInit not needed with async pipe)
- ✅ Type-safe data models (no `any` types)
- ✅ WCAG AA accessibility compliance

---

## Testing

```bash
npm run test              # Run tests
```

---

## Troubleshooting

**Build errors:**
```bash
rm -rf .angular node_modules
npm install
```

**Linting errors:**
```bash
npm run lint:fix
```

**Type errors:**
```bash
npx tsc --noEmit
```

---

**Last Updated:** 2026-06-29  
**Angular:** 22.0.0+  
**Node:** 22.0.0+

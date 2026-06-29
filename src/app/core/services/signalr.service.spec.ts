import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignalRService } from './signalr.service';
import { ConnectionStatus } from '@enums';

const { HubConnectionState, mockConnection, MockHubConnectionBuilder } = vi.hoisted(() => {
  const HubConnectionState = {
    Disconnected: 0,
    Connecting: 1,
    Connected: 2,
    Disconnecting: 3,
    Reconnecting: 4,
  };

  const mockConnection = {
    state: HubConnectionState.Disconnected,
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
    onclose: vi.fn(),
  };

  class MockHubConnectionBuilder {
    withUrl() {
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    build() {
      return mockConnection;
    }
  }

  return { HubConnectionState, mockConnection, MockHubConnectionBuilder };
});

vi.mock('@microsoft/signalr', () => {
  return {
    HubConnectionState,
    HubConnectionBuilder: MockHubConnectionBuilder,
  };
});

vi.mock('@env', () => {
  return {
    environment: {
      signalRHubUrl: 'http://localhost:5000/sensorchannel',
    },
  };
});

describe('SignalRService', () => {
  let service: SignalRService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.state = HubConnectionState.Disconnected;
    mockConnection.start.mockResolvedValue(undefined);
    mockConnection.on.mockClear();
    mockConnection.onreconnecting.mockClear();
    mockConnection.onreconnected.mockClear();
    mockConnection.onclose.mockClear();

    service = new SignalRService();
  });

  it('should initialize with Disconnected status', () => {
    expect(service.connectionStatus$.getValue()).toBe(ConnectionStatus.Disconnected);
  });

  it('should emit sensor reading through sensorReading$ when ReceiveReading event is triggered', async () => {
    let emittedReading: any;
    service.sensorReading$.subscribe((reading) => {
      emittedReading = reading;
    });

    await service.connect();

    // Get the listener function passed to on() for ReceiveReading event
    const onCall = mockConnection.on.mock.calls.find(
      (call: any) => call[0] === 'ReceiveReading'
    );
    const listener = onCall?.[1];

    const testReading = { id: 1, value: 25.5, timestamp: '2024-01-01' };
    listener?.(testReading);

    expect(emittedReading).toEqual(testReading);
  });

  it('should emit anomaly through anomaly$ when ReceiveAnomaly event is triggered', async () => {
    let emittedAnomaly: any;
    service.anomaly$.subscribe((anomaly) => {
      emittedAnomaly = anomaly;
    });

    await service.connect();

    // Get the listener function passed to on() for ReceiveAnomaly event
    const onCall = mockConnection.on.mock.calls.find(
      (call: any) => call[0] === 'ReceiveAnomaly'
    );
    const listener = onCall?.[1];

    const testAnomaly = { id: 1, severity: 'high', description: 'Test anomaly' };
    listener?.(testAnomaly);

    expect(emittedAnomaly).toEqual(testAnomaly);
  });
});

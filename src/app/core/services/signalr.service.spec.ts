import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
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

vi.mock('@microsoft/signalr', () => ({
  HubConnectionState,
  HubConnectionBuilder: MockHubConnectionBuilder,
}));

describe('SignalRService', () => {
  let service: SignalRService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.state = HubConnectionState.Disconnected;
    service = new SignalRService();
  });

  it('should initialize with Disconnected status', () => {
    expect(service.connectionStatus$.getValue()).toBe(ConnectionStatus.Disconnected);
  });

  it('should emit sensor reading through sensorReading$ when ReceiveReading event is triggered', async () => {
    await service.connect();

    const onCall = mockConnection.on.mock.calls.find(
      (call: unknown[]) => call[0] === 'ReceiveReading',
    );
    const listener = onCall?.[1] as (data: unknown) => void;

    const testReading = { id: 1, value: 25.5, timestamp: '2024-01-01' };
    const emitted = firstValueFrom(service.sensorReading$);
    listener(testReading);

    expect(await emitted).toEqual(testReading);
  });

  it('should emit anomaly through anomaly$ when ReceiveAnomaly event is triggered', async () => {
    await service.connect();

    const onCall = mockConnection.on.mock.calls.find(
      (call: unknown[]) => call[0] === 'ReceiveAnomaly',
    );
    const listener = onCall?.[1] as (data: unknown) => void;

    const testAnomaly = { id: 1, severity: 'high', description: 'Test anomaly' };
    const emitted = firstValueFrom(service.anomaly$);
    listener(testAnomaly);

    expect(await emitted).toEqual(testAnomaly);
  });
});

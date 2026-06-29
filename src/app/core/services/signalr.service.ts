import { Service } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { environment } from '@env';
import { SensorReading } from '@core/models/sensor-reading.model';
import { Anomaly } from '@core/models/anomaly.model';
import { ConnectionStatus } from '@core/enums/connection-status.enum';
import { HubEvent } from '@core/enums/hub-events.enum';

@Service()
export class SignalRService {
  readonly sensorReading$ = new Subject<SensorReading>();
  readonly anomaly$ = new Subject<Anomaly>();
  readonly connectionStatus$ = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.Disconnected);

  private connection: HubConnection | null = null;

  async connect(): Promise<void> {
    if (this.connection && this.connection?.state !== HubConnectionState.Disconnected) {
      return;
    }

    this.connection = this.createConnection();
    this.registerEventHandlers();
    this.startConnection();
  }

  private createConnection(): HubConnection {
    return new HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl)
      .withAutomaticReconnect()
      .build();
  }

  private registerEventHandlers(): void {
    this.connection?.on(HubEvent.ReceiveReading, (reading: SensorReading) => {
      this.sensorReading$.next(reading);
    });

    this.connection?.on(HubEvent.ReceiveAnomaly, (anomaly: Anomaly) => {
      this.anomaly$.next(anomaly);
    });

    this.connection?.onreconnecting(() => {
      this.connectionStatus$.next(ConnectionStatus.Connecting);
    });

    this.connection?.onreconnected(() => {
      this.connectionStatus$.next(ConnectionStatus.Connected);
    });

    this.connection?.onclose(() => {
      this.connectionStatus$.next(ConnectionStatus.Disconnected);
    });
  }

  private async startConnection() {
    try {
      this.connectionStatus$.next(ConnectionStatus.Connecting);

      await this.connection?.start();
      this.connectionStatus$.next(ConnectionStatus.Connected);
      console.log('[SignalR] Connected successfully');
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      this.connectionStatus$.next(ConnectionStatus.Disconnected);
    }
  }

  async disconnect(): Promise<void> {
    await this.connection?.stop();
    this.connection = null;
  }
}

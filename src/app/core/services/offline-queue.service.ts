import { Service, signal } from '@angular/core';
import { SubmittableSensorReading, QueuedReading } from '@models';
import { OFFLINE_QUEUE_STORAGE_KEY } from '@constants';

const STORAGE_KEY = OFFLINE_QUEUE_STORAGE_KEY;

@Service()
export class OfflineQueueService {
  private queue: QueuedReading[] = this.load();
  readonly pendingCount = signal(this.queue.length);

  enqueue(reading: SubmittableSensorReading): void {
    this.queue.push({ reading, queuedAt: new Date().toISOString() });
    this.persist();
  }

  peek(): QueuedReading | null {
    return this.queue[0] ?? null;
  }

  dequeue(): QueuedReading | null {
    const item = this.queue.shift() ?? null;
    this.persist();
    return item;
  }

  getAll(): QueuedReading[] {
    return [...this.queue];
  }

  private load(): QueuedReading[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedReading[]) : [];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    this.pendingCount.set(this.queue.length);
  }
}

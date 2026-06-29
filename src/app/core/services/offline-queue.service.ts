// import { inject, Service, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { firstValueFrom } from 'rxjs';

// export interface QueuedRequest {
//   url: string;
//   body: unknown;
//   queuedAt: string;
// }

// const STORAGE_KEY = 'greenhouse_offline_queue';

// @Service()
// export class OfflineQueueService {
//   private readonly http = inject(HttpClient);

//   readonly pendingCount = signal(this.load().length);

//   enqueue(url: string, body: unknown): void {
//     const queue = this.load();
//     queue.push({ url, body, queuedAt: new Date().toISOString() });
//     this.persist(queue);
//     this.pendingCount.set(queue.length);
//     console.log(`[OfflineQueue] Enqueued request to ${url}. Pending: ${queue.length}`);
//   }

//   async flush(): Promise<void> {
//     const queue = this.load();
//     if (queue.length === 0) return;

//     console.log(`[OfflineQueue] Flushing ${queue.length} queued request(s)…`);

//     const remaining: QueuedRequest[] = [];

//     for (const request of queue) {
//       try {
//         await firstValueFrom(this.http.post(request.url, request.body));
//         console.log(`[OfflineQueue] Replayed request to ${request.url}`);
//       } catch {
//         remaining.push(request);
//       }
//     }

//     this.persist(remaining);
//     this.pendingCount.set(remaining.length);
//   }

//   private load(): QueuedRequest[] {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
//     } catch {
//       return [];
//     }
//   }

//   private persist(queue: QueuedRequest[]): void {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
//     } catch {
//       // localStorage unavailable or quota exceeded
//     }
//   }
// }

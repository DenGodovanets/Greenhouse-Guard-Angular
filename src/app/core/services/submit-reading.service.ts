import { inject, Service } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, of, map, catchError, forkJoin } from 'rxjs';
import { OfflineQueueService } from './offline-queue.service';
import { SubmittableSensorReading } from '@models';
import { SKIP_SNACKBAR } from '../interceptors/http-error.interceptor';
import { environment } from '@env';

@Service()
export class SubmitReadingService {
  private readonly http = inject(HttpClient);
  private readonly offlineQueue = inject(OfflineQueueService);
  private readonly apiUrl = `${environment.apiUrl}/readings`;

  submitReading(reading: SubmittableSensorReading): Observable<boolean> {
    const ctx = new HttpContext().set(SKIP_SNACKBAR, true);

    if (this.offlineQueue.pendingCount() > 0) {
      this.offlineQueue.enqueue(reading);
      return this.flushQueueInParallel(ctx);
    }

    return this.submitNewReading(reading, ctx);
  }

  private submitNewReading(
    reading: SubmittableSensorReading,
    ctx: HttpContext,
  ): Observable<boolean> {
    return this.http.post(this.apiUrl, reading, { context: ctx }).pipe(
      map(() => true),
      catchError(() => {
        this.offlineQueue.enqueue(reading);
        return of(false);
      }),
    );
  }

  private flushQueueInParallel(ctx: HttpContext): Observable<boolean> {
    const queue = this.offlineQueue.getAll();
    if (queue.length === 0) {
      return of(true);
    }

    // Create all POST requests in parallel
    const requests = queue.map((queuedItem) =>
      this.http.post(this.apiUrl, queuedItem.reading, { context: ctx }).pipe(
        map(() => ({ success: true })),
        catchError(() => of({ success: false })),
      ),
    );

    return forkJoin(requests).pipe(
      map((results) => {
        results.forEach((result) => {
          if (result.success) {
            this.offlineQueue.dequeue();
          }
        });

        const allSucceeded = results.every((r) => r.success);
        return allSucceeded;
      }),
      catchError(() => of(false)),
    );
  }
}

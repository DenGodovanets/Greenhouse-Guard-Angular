import { Component, inject, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SubmitReadingComponent } from '@components';
import { ConnectionStatus } from '@enums';
import { LABELS } from '@constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, DatePipe],
})
export class HeaderComponent {
  private readonly dialog = inject(MatDialog);

  readonly connectionStatus = input<ConnectionStatus | null>(null);
  readonly lastUpdatedAt = input<string | null>(null);

  readonly ConnectionStatus = ConnectionStatus;
  readonly labels = LABELS;

  openSubmitDialog(): void {
    this.dialog.open(SubmitReadingComponent, { width: '480px', autoFocus: 'first-tabbable' });
  }
}

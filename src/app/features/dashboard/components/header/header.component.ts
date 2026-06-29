import { Component, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { ConnectionStatus } from '@enums';
import { LABELS } from '@constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [MatToolbarModule, MatIconModule, DatePipe],
})
export class HeaderComponent {
  readonly connectionStatus = input.required<ConnectionStatus | null>();
  readonly lastUpdatedAt = input.required<string | null>();

  readonly ConnectionStatus = ConnectionStatus;
  readonly labels = LABELS;
}

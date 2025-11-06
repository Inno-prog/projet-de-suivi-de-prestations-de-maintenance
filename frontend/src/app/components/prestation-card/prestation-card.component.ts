import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prestation } from '../../core/models/business.models';

@Component({
  selector: 'app-prestation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prestation-card.component.html',
})
export class PrestationCardComponent {
  @Input() prestation!: Prestation;
  @Input() titre!: string;
  @Input() description!: string;
  @Input() fichierUrl?: string;
  @Input() prestationId!: string;

  @Output() statutChanged = new EventEmitter<{prestationId: number, newStatus: string}>();
  @Output() detailsClicked = new EventEmitter<string>();
  @Output() submitClicked = new EventEmitter<string>();
  @Output() deleteClicked = new EventEmitter<string>();

  statusOptions = ['en attente', 'en cours', 'terminé'];

  onStatusChange(newStatus: string): void {
    this.statutChanged.emit({ prestationId: this.prestation.id!, newStatus });
  }

  onDetailsClick(): void {
    this.detailsClicked.emit(this.prestationId);
  }

  onDownloadClick(): void {
    // Handle download if needed
  }

  onSubmitClick(): void {
    this.submitClicked.emit(this.prestationId);
  }

  onDeleteClick(): void {
    this.deleteClicked.emit(this.prestationId);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestationService, Prestation } from '../../core/services/prestation.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { PdfService } from '../../core/services/pdf.service';

@Component({
  selector: 'app-prestataire-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prestataire-dashboard.component.html',
  styleUrl: './prestataire-dashboard.component.css'
})
export class PrestataireDashboardComponent implements OnInit {
  prestations: Prestation[] = [];
  loading = false;
  currentUser: any = null;

  constructor(
    private prestationService: PrestationService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPrestations();
  }

  loadPrestations(): void {
    this.loading = true;
    this.prestationService.getAllPrestations().subscribe({
      next: (prestations) => {
        // Filter prestations for current prestataire
        this.prestations = prestations.filter(p =>
          p.nomPrestataire === this.currentUser?.nom
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des prestations:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement des prestations'
        });
        this.loading = false;
      }
    });
  }

  viewPrestationDetails(prestation: Prestation): void {
    // Navigate to prestation details or open modal
    this.router.navigate(['/prestations', prestation.id]);
  }

  downloadPrestationPDF(prestation: Prestation): void {
    // TODO: Implement PDF generation for prestation details
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité en développement',
      message: 'Le téléchargement PDF sera bientôt disponible'
    });
  }

  submitPrestation(prestation: Prestation): void {
    // Mark prestation as submitted
    const updatedPrestation = { ...prestation, statutIntervention: 'soumis' };
    this.prestationService.updatePrestation(prestation.id!, updatedPrestation).subscribe({
      next: () => {
        this.loadPrestations();
        this.toastService.show({
          type: 'success',
          title: 'Prestation soumise',
          message: 'La prestation a été soumise avec succès'
        });
      },
      error: (error) => {
        console.error('Erreur lors de la soumission:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la soumission de la prestation'
        });
      }
    });
  }

  getPrestationsByStatus(status: string): Prestation[] {
    return this.prestations.filter(p => p.statutIntervention === status);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'réussi': return 'success';
      case 'réussi nécessite autre intervention': return 'warning';
      case 'soumis': return 'info';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'réussi': return 'Réussi';
      case 'réussi nécessite autre intervention': return 'Réussi (nécessite autre intervention)';
      case 'soumis': return 'Soumis';
      default: return status;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('fr-FR');
  }
}

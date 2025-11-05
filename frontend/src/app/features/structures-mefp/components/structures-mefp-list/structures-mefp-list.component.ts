import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';
import { StructureMefp } from '../../../../core/models/business.models';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-structures-mefp-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <h1>Gestion des Structures du MEFP</h1>
          <button class="btn btn-primary" (click)="openCreateStructureModal()">
            {{ showStructureModal ? 'Annuler' : '+ Nouvelle Structure' }}
          </button>
        </div>

        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Structures du MEFP</h2>
            <div class="search-bar">
              <input type="text" placeholder="Rechercher par nom, email, contact, ville, description, catégorie..." [(ngModel)]="searchTerm" (input)="filterStructures()" class="search-input">
              <span class="search-icon">🔍</span>
              <button *ngIf="searchTerm" class="clear-btn" (click)="clearSearch()" title="Effacer la recherche">✕</button>
            </div>
          </div>

          <div class="table-wrapper">
            <table *ngIf="filteredStructures.length > 0; else noData">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Ville</th>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let structure of filteredStructures">
                  <td><i class="icon-building">🏢</i> {{ structure.nom }}</td>
                  <td>{{ structure.email }}</td>
                  <td><i class="icon-phone">📞</i> {{ structure.contact || '-' }}</td>
                  <td>{{ structure.ville || '-' }}</td>
                  <td>{{ structure.description || '-' }}</td>
                  <td>{{ structure.categorie || '-' }}</td>
                  <td>{{ formatDate(structure.createdAt) }}</td>
                  <td>
                    <button class="edit-btn" (click)="editStructure(structure)" title="Modifier">
                      <i class="icon-edit">✏️</i>
                    </button>
                    <button class="delete-btn" (click)="deleteStructure(structure)" title="Supprimer">
                      <i class="icon-delete">🗑️</i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucune structure trouvée</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loading">
          Chargement des structures...
        </div>
      </div>

      <!-- Structure Modal -->
      <div class="modal-overlay" *ngIf="showStructureModal" (click)="closeStructureModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <form [formGroup]="structureForm" (ngSubmit)="saveStructure()" class="structure-form">
            <h2 class="form-title">{{ isEditing ? 'Modifier' : 'Créer' }} une Structure du MEFP</h2>

            <div class="form-group">
              <label for="nom">Nom</label>
              <input
                type="text"
                id="nom"
                formControlName="nom"
                placeholder="Entrez le nom"
                class="line-input"
                [class.error]="structureForm.get('nom')?.invalid && structureForm.get('nom')?.touched"
              />
              <div class="input-line" [class.error]="structureForm.get('nom')?.invalid && structureForm.get('nom')?.touched"></div>
              <div class="error-message" *ngIf="structureForm.get('nom')?.invalid && structureForm.get('nom')?.touched">
                Le nom est requis
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="Entrez l'email"
                class="line-input"
                [class.error]="structureForm.get('email')?.invalid && structureForm.get('email')?.touched"
              />
              <div class="input-line" [class.error]="structureForm.get('email')?.invalid && structureForm.get('email')?.touched"></div>
              <div class="error-message" *ngIf="structureForm.get('email')?.invalid && structureForm.get('email')?.touched">
                L'email est requis et doit être valide
              </div>
            </div>

            <div class="form-group">
              <label for="contact">Contact</label>
              <input
                type="text"
                id="contact"
                formControlName="contact"
                placeholder="Entrez le contact"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="ville">Ville</label>
              <input
                type="text"
                id="ville"
                formControlName="ville"
                placeholder="Entrez la ville"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                placeholder="Entrez la description"
                class="line-input"
                rows="3"
              ></textarea>
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="categorie">Catégorie</label>
              <input
                type="text"
                id="categorie"
                formControlName="categorie"
                placeholder="Entrez la catégorie"
                class="line-input"
                [class.error]="structureForm.get('categorie')?.invalid && structureForm.get('categorie')?.touched"
              />
              <div class="input-line" [class.error]="structureForm.get('categorie')?.invalid && structureForm.get('categorie')?.touched"></div>
              <div class="error-message" *ngIf="structureForm.get('categorie')?.invalid && structureForm.get('categorie')?.touched">
                La catégorie est requise
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="closeStructureModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="structureForm.invalid || loading">
                {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
  `,
  styles: [`
    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1E2761;
      margin: 0;
      letter-spacing: 0.5px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
      width: 100%;
      padding: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
    }

    td {
      border-bottom: 2px solid #e5e7eb;
    }

    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #1E2761;
      font-size: 0.875rem;
    }

    td {
      color: #000000;
      font-size: 0.875rem;
      font-weight: 600;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    td:hover {
      white-space: normal;
      word-wrap: break-word;
      overflow: visible;
      background: rgba(255, 255, 255, 0.9);
      z-index: 10;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .edit-btn, .delete-btn {
      background: none;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      padding: 0.5rem;
      margin-right: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .edit-btn {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .edit-btn:hover {
      background: #bfdbfe;
      transform: scale(1.1);
    }

    .delete-btn {
      background: #fee2e2;
      color: #dc2626;
    }

    .delete-btn:hover {
      background: #fecaca;
      transform: scale(1.1);
    }


    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .table-header {
      background: #f9fafb;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h2 {
      margin: 0;
      color: #1E2761;
      font-size: 1.125rem;
      font-weight: 500;
      letter-spacing: 0.025em;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border-radius: 12px;
      padding: 0.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .search-bar:focus-within {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .search-input {
      border: none;
      outline: none;
      background: transparent;
      padding: 0.5rem 0.5rem 0.5rem 0;
      font-size: 0.875rem;
      width: 280px;
      color: #374151;
    }

    .search-input::placeholder {
      color: #9ca3af;
    }

    .search-icon {
      color: #6b7280;
      margin-right: 0.5rem;
      font-size: 1.1rem;
    }

    .clear-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .clear-btn:hover {
      background: #f3f4f6;
      color: #6b7280;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .structure-form {
      padding: 30px;
    }

    .form-title {
      font-size: 22px;
      font-weight: 600;
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 25px;
      position: relative;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #555;
      margin-bottom: 8px;
    }

    .line-input {
      width: 100%;
      padding: 12px 0;
      border: none;
      border-radius: 0;
      font-size: 16px;
      background: transparent;
      outline: none;
      color: #333;
    }

    .line-input::placeholder {
      color: #999;
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ddd;
      transition: all 0.3s ease;
    }

    .line-input:focus + .input-line {
      background: #1e293b;
      height: 2px;
    }

    .line-input.error + .input-line,
    .input-line.error {
      background: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
    }

    /* Boutons EXACTEMENT comme l'image */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #ea580c, #dc2626);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-outline:hover {
      background: #f5f5f5;
    }

    /* Style pour le textarea */
    textarea.line-input {
      resize: vertical;
      min-height: 80px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .table-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }
    }
  `]
})
export class StructuresMefpListComponent implements OnInit {
  structures: StructureMefp[] = [];
  filteredStructures: StructureMefp[] = [];
  searchTerm = '';
  loading = false;
  showStructureModal = false;
  isEditing = false;
  currentStructure: StructureMefp | null = null;
  structureForm: FormGroup;

  constructor(
    private structureMefpService: StructureMefpService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
    this.structureForm = this.formBuilder.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: [''],
      ville: [''],
      description: [''],
      categorie: ['', Validators.required]
    });

    // Initialize confirmation service with the component
    setTimeout(() => {
      if (this.confirmationService) {
        // The confirmation service should already be initialized in the layout component
        console.log('Confirmation service initialized for structures component');
      }
    });
  }

  ngOnInit(): void {
    this.loadStructures();
  }

  loadStructures(): void {
    this.loading = true;
    console.log('Loading structures from:', this.structureMefpService['API_URL']);
    this.structureMefpService.getAllStructures().subscribe({
      next: (structures) => {
        console.log('Successfully loaded structures:', structures);
        this.structures = structures;
        this.filterStructures();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading structures:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        this.toastService.show({
          type: 'error',
          title: 'Erreur de chargement',
          message: 'Impossible de charger les structures. Vérifiez la connexion réseau.'
        });
        this.loading = false;
      }
    });
  }

  filterStructures(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStructures = [...this.structures];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStructures = this.structures.filter(structure =>
        (structure.nom || '').toLowerCase().includes(term) ||
        (structure.email || '').toLowerCase().includes(term) ||
        String(structure.contact || '').toLowerCase().includes(term) ||
        (structure.ville || '').toLowerCase().includes(term) ||
        (structure.description || '').toLowerCase().includes(term) ||
        (structure.categorie || '').toLowerCase().includes(term)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterStructures();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  openCreateStructureModal(): void {
    this.isEditing = false;
    this.currentStructure = null;
    this.structureForm.reset({
      nom: '',
      email: '',
      contact: '',
      ville: '',
      description: '',
      categorie: ''
    });
    this.showStructureModal = true;
  }

  editStructure(structure: StructureMefp): void {
    this.isEditing = true;
    this.currentStructure = structure;
    this.structureForm.patchValue({
      nom: structure.nom,
      email: structure.email,
      contact: structure.contact,
      ville: structure.ville,
      description: structure.description,
      categorie: structure.categorie
    });
    this.showStructureModal = true;
  }

  closeStructureModal(): void {
    this.showStructureModal = false;
    this.currentStructure = null;
    this.structureForm.reset({
      nom: '',
      email: '',
      contact: '',
      ville: '',
      description: '',
      categorie: ''
    });
  }

  async saveStructure(): Promise<void> {
    console.log('saveStructure called, form valid:', this.structureForm.valid);
    console.log('Form value:', this.structureForm.value);

    if (this.structureForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';

      // Use custom confirmation dialog instead of browser alert
      const confirmed = await this.confirmationService.show({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} une structure`,
        message: `Voulez-vous vraiment ${action} cette structure ?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Annuler'
      });
      console.log('Custom dialog result:', confirmed);

      if (confirmed) {
        console.log('Proceeding with structure creation...');
        this.performStructureSave();
      } else {
        console.log('User cancelled via custom dialog');
      }
    } else {
      console.log('Form is invalid, marking all fields as touched');
      this.structureForm.markAllAsTouched();
    }
  }

  private performStructureSave(): void {
    const structureData = this.structureForm.value;
    console.log('Structure data to save:', structureData);

    if (this.isEditing && this.currentStructure) {
      console.log('Updating structure with ID:', this.currentStructure.id);
      this.structureMefpService.updateStructure(this.currentStructure.id!, structureData).subscribe({
        next: (updatedStructure) => {
          console.log('Structure updated successfully:', updatedStructure);
          const index = this.structures.findIndex(s => s.id === updatedStructure.id);
          if (index !== -1) {
            this.structures[index] = updatedStructure;
            this.filterStructures();
          }
          this.closeStructureModal();
          this.toastService.show({ type: 'success', title: 'Structure modifiée', message: 'La structure a été modifiée avec succès' });
        },
        error: (error) => {
          console.error('Error updating structure:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification de la structure' });
        }
      });
    } else {
      console.log('Creating new structure');
      this.structureMefpService.createStructure(structureData).subscribe({
        next: (newStructure) => {
          console.log('Structure created successfully:', newStructure);
          this.structures.push(newStructure);
          this.filterStructures();
          this.closeStructureModal();
          this.toastService.show({ type: 'success', title: 'Structure créée', message: 'La structure a été créée avec succès' });
        },
        error: (error) => {
          console.error('Error creating structure:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création de la structure' });
        }
      });
    }
  }

  async deleteStructure(structure: StructureMefp): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer une structure',
      message: `Êtes-vous sûr de vouloir supprimer la structure "${structure.nom}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });
    console.log('Delete confirmation result:', confirmed);

    if (confirmed) {
      console.log('Proceeding with structure deletion for:', structure.nom);
      this.structureMefpService.deleteStructure(structure.id!).subscribe({
        next: () => {
          console.log('Structure deleted successfully');
          this.structures = this.structures.filter(s => s.id !== structure.id);
          this.filterStructures();
          this.toastService.show({ type: 'success', title: 'Structure supprimée', message: 'La structure a été supprimée avec succès' });
        },
        error: (error) => {
          console.error('Error deleting structure:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de la structure' });
        }
      });
    } else {
      console.log('User cancelled deletion');
    }
  }
}
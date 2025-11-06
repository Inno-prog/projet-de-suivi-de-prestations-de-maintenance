import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { ItemService } from '../../../../core/services/item.service';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';
import { Item, Equipement, StructureMefp } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-prestation-form',
  templateUrl: './prestation-form.component.html',
  styleUrls: ['./prestation-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ]
})
export class PrestationFormComponent implements OnInit {
  prestationForm: FormGroup;
  isEditMode = false;
  items: Item[] = [];
  prestataires: User[] = [];
  selectedItem: Item | null = null;
  equipements: Equipement[] = [];
  selectedEquipements: Equipement[] = [];
  maxQuantityForTrimestre: number = 0;
  existingPrestationsCount: number = 0;
  showForm = false;

  // Multi-step wizard properties
  currentStep = 1;
  totalSteps = 4;
  stepTitles = [
    'Informations du Prestataire',
    'Détails de l\'Intervention',
    'Informations du Client',
    'Récapitulatif'
  ];

  // Selected items for intervention step
  selectedItems: Item[] = [];

  // Prestataire selection
  selectedPrestataire: User | null = null;
  isNewPrestataire = false;

  // Client selection (Structures MEFP)
  structuresMefp: StructureMefp[] = [];
  selectedClient: StructureMefp | null = null;
  isNewClient = false;

  statutOptions = [
    { value: 'réussi', label: 'Réussi' },
    { value: 'réussi nécessite autre intervention', label: 'Réussi nécessite autre intervention' }
  ];

  trimestreOptions = [
    { value: 'trimestre 1', label: 'Trimestre 1' },
    { value: 'trimestre 2', label: 'Trimestre 2' },
    { value: 'trimestre 3', label: 'Trimestre 3' },
    { value: 'trimestre 4', label: 'Trimestre 4' }
  ];

  constructor(
    private fb: FormBuilder,
    private prestationService: PrestationService,
    private itemService: ItemService,
    private userService: UserService,
    private structureMefpService: StructureMefpService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    public dialogRef: MatDialogRef<PrestationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.prestation;
    this.prestationForm = this.fb.group({
      // Step 1: Prestataire info
      prestataireSelection: [data?.prestation?.prestataireSelection || ''],
      nomPrestataire: [data?.prestation?.nomPrestataire || '', Validators.required],
      contactPrestataire: [data?.prestation?.contactPrestataire || '', Validators.required],
      structurePrestataire: [data?.prestation?.structurePrestataire || '', Validators.required],
      servicePrestataire: [data?.prestation?.servicePrestataire || '', Validators.required],
      rolePrestataire: [data?.prestation?.rolePrestataire || '', Validators.required],
      qualificationPrestataire: [data?.prestation?.qualificationPrestataire || '', Validators.required],

      // Step 2: Intervention details
      itemsCouverts: [data?.prestation?.itemsCouverts || [], Validators.required],
      montantIntervention: [data?.prestation?.montantIntervention || '', [Validators.required, Validators.min(0)]],
      equipementsUtilises: [data?.prestation?.equipementsUtilises || [], []],
      trimestre: [data?.prestation?.trimestre || '', Validators.required],
      dateDebut: [data?.prestation?.dateDebut || '', Validators.required],
      heureDebut: [data?.prestation?.heureDebut || '', Validators.required],
      dateFin: [data?.prestation?.dateFin || '', Validators.required],
      heureFin: [data?.prestation?.heureFin || '', Validators.required],
      observationsPrestataire: [data?.prestation?.observationsPrestataire || ''],
      statutIntervention: [data?.prestation?.statutIntervention || '', Validators.required],

      // Step 3: Client info
      clientSelection: [data?.prestation?.clientSelection || ''],
      nomClient: [data?.prestation?.nomClient || '', Validators.required],
      contactClient: [data?.prestation?.contactClient || '', Validators.required],
      adresseClient: [data?.prestation?.adresseClient || '', Validators.required],
      fonctionClient: [data?.prestation?.fonctionClient || '', Validators.required],
      observationsClient: [data?.prestation?.observationsClient || '']
    });
  }

  ngOnInit(): void {
    this.showForm = true;
    this.loadItems();
    this.loadPrestataires();
    this.loadStructuresMefp();
    this.loadEquipements();
    this.setupItemSelectionListener();
  }

  loadItems(): void {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des items:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des items' });
        }
      }
    });
  }

  loadPrestataires(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.prestataires = users;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des prestataires:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des prestataires' });
        }
      }
    });
  }

  loadEquipements(): void {
    // TODO: Implement equipement service call
    // For now, we'll leave this empty as the service might not exist yet
    this.equipements = [];
  }

  loadStructuresMefp(): void {
    this.structureMefpService.getAllStructures().subscribe({
      next: (structures) => {
        this.structuresMefp = structures;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des structures MEFP:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des structures MEFP' });
        }
      }
    });
  }

  onEquipementSelectionChange(event: any): void {
    const selectedIds = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedEquipements = this.equipements.filter(eq => selectedIds.includes(eq.id));
  }

  onItemSelectionChange(item: Item, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    if (checked) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    }
    this.prestationForm.patchValue({ itemsCouverts: this.selectedItems.map(i => i.id) });
  }

  isItemSelected(item: Item): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNext(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.prestationForm.get('nomPrestataire')?.valid &&
               this.prestationForm.get('contactPrestataire')?.valid &&
               this.prestationForm.get('structurePrestataire')?.valid &&
               this.prestationForm.get('servicePrestataire')?.valid &&
               this.prestationForm.get('rolePrestataire')?.valid &&
               this.prestationForm.get('qualificationPrestataire')?.valid);
      case 2:
        return !!(this.prestationForm.get('itemsCouverts')?.valid &&
               this.prestationForm.get('montantIntervention')?.valid &&
               this.prestationForm.get('trimestre')?.valid &&
               this.prestationForm.get('dateDebut')?.valid &&
               this.prestationForm.get('heureDebut')?.valid &&
               this.prestationForm.get('dateFin')?.valid &&
               this.prestationForm.get('heureFin')?.valid &&
               this.prestationForm.get('statutIntervention')?.valid);
      case 3:
        return !!(this.prestationForm.get('nomClient')?.valid &&
               this.prestationForm.get('contactClient')?.valid &&
               this.prestationForm.get('adresseClient')?.valid &&
               this.prestationForm.get('fonctionClient')?.valid);
      default:
        return true;
    }
  }

  getSelectedItemsNames(): string {
    return this.selectedItems.map(i => i.nomItem).join(', ');
  }

  getFormValue(fieldName: string): any {
    return this.prestationForm.get(fieldName)?.value;
  }

  getTrimestreLabel(): string {
    const trimestreValue = this.getFormValue('trimestre');
    const trimestre = this.trimestreOptions.find(t => t.value === trimestreValue);
    return trimestre ? trimestre.label : '';
  }

  getStatutLabel(): string {
    const statutValue = this.getFormValue('statutIntervention');
    const statut = this.statutOptions.find(s => s.value === statutValue);
    return statut ? statut.label : '';
  }

  setupItemSelectionListener(): void {
    // Prestataire selection listener
    this.prestationForm.get('prestataireSelection')?.valueChanges.subscribe(value => {
      if (value && value !== 'new') {
        this.selectedPrestataire = this.prestataires.find(p => p.id === value) || null;
        this.isNewPrestataire = false;
        if (this.selectedPrestataire) {
          this.prestationForm.patchValue({
            nomPrestataire: this.selectedPrestataire.nom,
            contactPrestataire: this.selectedPrestataire.contact || '',
            structurePrestataire: this.selectedPrestataire.structure || '',
            servicePrestataire: '', // This might need to be added to User model
            rolePrestataire: this.selectedPrestataire.role,
            qualificationPrestataire: this.selectedPrestataire.qualification || ''
          });
        }
      } else if (value === 'new') {
        this.selectedPrestataire = null;
        this.isNewPrestataire = true;
        // Clear all prestataire fields for manual entry
        this.prestationForm.patchValue({
          nomPrestataire: '',
          contactPrestataire: '',
          structurePrestataire: '',
          servicePrestataire: '',
          rolePrestataire: '',
          qualificationPrestataire: ''
        });
      }
    });

    // Client selection listener
    this.prestationForm.get('clientSelection')?.valueChanges.subscribe(value => {
      if (value && value !== 'new') {
        this.selectedClient = this.structuresMefp.find(s => s.id === value) || null;
        this.isNewClient = false;
        if (this.selectedClient) {
          this.prestationForm.patchValue({
            nomClient: this.selectedClient.nom,
            contactClient: this.selectedClient.contact || '',
            adresseClient: this.selectedClient.ville || '',
            fonctionClient: '', // This might need to be added to StructureMefp model
            observationsClient: this.selectedClient.description || ''
          });
        }
      } else if (value === 'new') {
        this.selectedClient = null;
        this.isNewClient = true;
        // Clear all client fields for manual entry
        this.prestationForm.patchValue({
          nomClient: '',
          contactClient: '',
          adresseClient: '',
          fonctionClient: '',
          observationsClient: ''
        });
      }
    });
  }

  updateMaxQuantity(): void {
    if (this.selectedItem) {
      this.maxQuantityForTrimestre = this.selectedItem.quantiteMaxTrimestre || 0;
    } else {
      this.maxQuantityForTrimestre = 0;
    }
  }

  updateExistingPrestationsCount(): void {
    if (this.selectedItem) {
      const nomItem = this.selectedItem.nomItem;
      console.log(`🔍 Mise à jour compteur pour: ${nomItem}`);
      
      this.prestationService.getCountByItem(nomItem).subscribe({
        next: (count) => {
          this.existingPrestationsCount = count;
          this.maxQuantityForTrimestre = this.selectedItem?.quantiteMaxTrimestre || 0;
          console.log(`✅ Compteur mis à jour: ${count}/${this.maxQuantityForTrimestre}`);
        },
        error: (error) => {
          console.error('❌ Erreur compteur:', error);
          // Mettre à jour avec des valeurs par défaut
          this.existingPrestationsCount = 0;
          this.maxQuantityForTrimestre = this.selectedItem?.quantiteMaxTrimestre || 0;
        }
      });
    } else {
      this.existingPrestationsCount = 0;
      this.maxQuantityForTrimestre = 0;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.prestationForm.valid) {
      console.log('🔄 Soumission du formulaire...');

      // Vérification frontend de la limite pour chaque item sélectionné
      for (const item of this.selectedItems) {
        try {
          const count = await this.prestationService.getCountByItem(item.nomItem).toPromise();
          const maxQuantity = item.quantiteMaxTrimestre || 0;

          if (count !== undefined && count >= maxQuantity) {
            const message = `Limite atteinte pour "${item.nomItem}": ${count}/${maxQuantity} prestations`;
            console.warn('🚫 ' + message);
            this.toastService.show({
              type: 'error',
              title: 'Limite atteinte',
              message
            });
            return;
          }
        } catch (error) {
          console.warn(`Erreur lors de la vérification de la limite pour ${item.nomItem}:`, error);
          // En cas d'erreur, permettre la création si maxQuantity est 0 (pas de limite)
          if (item.quantiteMaxTrimestre === 0) {
            console.log(`Aucune limite définie pour ${item.nomItem}, création autorisée`);
          } else {
            // Si erreur et limite définie, bloquer
            this.toastService.show({
              type: 'error',
              title: 'Erreur de vérification',
              message: `Impossible de vérifier la limite pour "${item.nomItem}"`
            });
            return;
          }
        }
      }

      try {
        const result = await this.prestationService.createPrestation(
          this.preparePrestationData()
        ).toPromise();

        console.log('✅ Succès:', result);
        this.toastService.show({
          type: 'success',
          title: 'Prestation créée',
          message: 'La prestation a été créée avec succès'
        });
        this.dialogRef.close(true);

      } catch (error: any) {
        console.error('❌ Erreur soumission:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: error.message || 'Erreur lors de la création'
        });
      }
    }
  }

  private preparePrestationData(): any {
    const formValue = this.prestationForm.value;

    const formatDate = (date: any) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    const formatDateTime = (date: any, time: any) => {
      if (!date || !time) return null;
      return `${formatDate(date)}T${time}:00`;
    };

    return {
      prestataireId: this.selectedPrestataire?.id || null,
      nomPrestataire: formValue.nomPrestataire,
      nomPrestation: this.getSelectedItemsNames(), // Use selected items as nomPrestation
      contactPrestataire: formValue.contactPrestataire,
      structurePrestataire: formValue.structurePrestataire,
      servicePrestataire: formValue.servicePrestataire,
      rolePrestataire: formValue.rolePrestataire,
      qualificationPrestataire: formValue.qualificationPrestataire,
      itemIds: formValue.itemsCouverts, // Correct field name for backend
      montantIntervention: formValue.montantIntervention,
      equipementsUtilises: this.selectedEquipements.map(eq => eq.id).join(', '), // Convert to string
      trimestre: formValue.trimestre,
      dateHeureDebut: formatDateTime(formValue.dateDebut, formValue.heureDebut),
      dateHeureFin: formatDateTime(formValue.dateFin, formValue.heureFin),
      observationsPrestataire: formValue.observationsPrestataire,
      statutIntervention: formValue.statutIntervention,
      nomClient: formValue.nomClient,
      contactClient: formValue.contactClient,
      adresseClient: formValue.adresseClient,
      fonctionClient: formValue.fonctionClient,
      observationsClient: formValue.observationsClient
    };
  }

  onCancel(): void {
    this.showForm = false;
    this.dialogRef.close();
  }
}

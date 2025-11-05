import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmationComponent } from '../confirmation/confirmation.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SidebarComponent, ToastComponent, ConfirmationComponent],
  templateUrl: './layout.component.html',
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      background: #f8fafc;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 270px;
      transition: margin-left 0.3s ease;
    }

    .navbar {
      background: #0f172a;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #e2e8f0;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .sidebar-toggle:hover {
      background: rgba(255,255,255,0.1);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 6px;
      background: white;
      object-fit: contain;
    }

    .nav-text h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .nav-user {
      display: flex;
      align-items: center;
    }

    .profile-section {
      position: relative;
    }

    .profile-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .profile-item:hover {
      background: rgba(255,255,255,0.1);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f97316;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e2e8f0;
      margin: 0;
    }

    .user-role {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }

    .dropdown-icon {
      color: #94a3b8;
      transition: transform 0.2s;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .profile-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 280px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      margin-top: 0.5rem;
    }

    .profile-header {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      gap: 0.75rem;
    }

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #f97316;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .user-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .user-details p {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .role-badge.admin {
      background: #fef3c7;
      color: #d97706;
    }

    .role-badge.prestataire {
      background: #dbeafe;
      color: #2563eb;
    }

    .role-badge.agent {
      background: #dcfce7;
      color: #16a34a;
    }

    .profile-menu {
      padding: 0.5rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      color: #374151;
      transition: background 0.2s;
    }

    .menu-item:hover {
      background: #f9fafb;
    }

    .menu-item.logout {
      color: #dc2626;
    }

    .menu-item.logout:hover {
      background: #fef2f2;
    }

    .menu-icon {
      width: 16px;
      height: 16px;
    }

    .menu-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.5rem 0;
    }

    .content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: #f1f5f9;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .profile-avatar-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .profile-avatar-large {
      margin: 0 auto 1rem auto;
    }

    .profile-avatar-section h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .profile-avatar-section p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-primary {
      background: #f97316;
      color: white;
    }

    .btn-primary:hover {
      background: #ea580c;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class LayoutComponent {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  @ViewChild('toast') toast!: ToastComponent;
  @ViewChild('confirmation') confirmation!: ConfirmationComponent;

  currentUser: any;
  profileMenuOpen = false;
  showProfileModal = false;
  showSettingsModal = false;
  profileLoading = false;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private confirmationService: ConfirmationService) {
    this.currentUser = this.authService.getCurrentUser();
    this.profileForm = this.fb.group({
      nom: [this.currentUser?.nom || ''],
      email: [this.currentUser?.email || ''],
      contact: [''],
      adresse: ['']
    });

    // Initialize confirmation service
    setTimeout(() => {
      if (this.confirmation) {
        this.confirmationService.setComponent(this.confirmation);
      }
    });
  }

  toggleSidebar() {
    if (this.sidebar) {
      this.sidebar.toggleSidebar();
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.nom) return '';
    return this.currentUser.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  openProfileModal() {
    this.showProfileModal = true;
    this.closeProfileMenu();
  }

  openSettingsModal() {
    this.showSettingsModal = true;
    this.closeProfileMenu();
  }

  logout() {
    console.log('LayoutComponent: Bouton de déconnexion cliqué');
    this.authService.logout();
  }

  getRoleLabel(role?: string): string {
    const r = role || this.currentUser?.role;
    switch (r) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'PRESTATAIRE': return 'Prestataire';
      case 'AGENT_DGSI': return 'Agent DGSI';
      default: return r || '';
    }
  }

  getRoleClass(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case 'ADMINISTRATEUR': return 'admin';
      case 'PRESTATAIRE': return 'prestataire';
      case 'AGENT_DGSI': return 'agent';
      default: return '';
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.profileLoading = true;
      // TODO: Implement profile update service call
      setTimeout(() => {
        this.profileLoading = false;
        this.closeProfileModal();
        if (this.toast) {
          // this.toast.show('Profil mis à jour avec succès', 'success');
        }
      }, 1000);
    }
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }
}

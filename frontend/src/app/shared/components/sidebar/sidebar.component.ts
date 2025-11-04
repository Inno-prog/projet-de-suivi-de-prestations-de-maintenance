import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.open]="isOpen">
      <!-- Toggle Button -->
      <button class="sidebar-toggle" (click)="toggleSidebar()">
        <i class="arrow" *ngIf="isOpen">◀</i>
        <div class="hamburger" *ngIf="!isOpen">
          <span></span><span></span><span></span>
        </div>
      </button>

      <!-- Header -->
      <div class="sidebar-header">
        <div class="logo">
          <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-img" />
          <div class="logo-text">
            <h3 style="padding-top: 6px; margin-left: -9px;">MainTrack Pro</h3>
            <small>{{ getRoleLabel() }}</small>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Tableau de bord</span>
        </a>

        <!-- Prestataire Section -->
        <div *ngIf="authService.isPrestataire()" class="nav-section">
          <div class="section-header" (click)="toggleSection('prestataire')">
            <span>Mes Services</span>
            <i [class.expanded]="sections['prestataire']">▸</i>
          </div>
          <div class="sub-nav" [class.expanded]="sections['prestataire']">
            <a routerLink="/fiches-prestation" routerLinkActive="active" class="nav-item">📋 Fiches de prestation</a>
            <a routerLink="/prestations" routerLinkActive="active" class="nav-item">📝 Mes prestations</a>
            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 Ordres de commande</a>
          </div>
        </div>

        <!-- Administration Section -->
        <div *ngIf="authService.isAdmin()" class="nav-section">
          <div class="section-header" (click)="toggleSection('admin')">
            <span>Administration</span>
            <i [class.expanded]="sections['admin']">▸</i>
          </div>
          <div class="sub-nav" [class.expanded]="sections['admin']">
            <a routerLink="/users" routerLinkActive="active" class="nav-item">👥 Utilisateurs</a>
            <a routerLink="/prestations" routerLinkActive="active" class="nav-item">🧾 Gestion des prestations</a>
            <a routerLink="/contrats" routerLinkActive="active" class="nav-item">📄 Contrats</a>
            <a routerLink="/items" routerLinkActive="active" class="nav-item">🧰 Items</a>
            <a routerLink="/evaluations" routerLinkActive="active" class="nav-item">⭐ Évaluations</a>
            <a routerLink="/équipements" routerLinkActive="active" class="nav-item">🔧 Tableau des équipements</a>
            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 Ordres de commande</a>
          </div>
        </div>

        <!-- Rapports Section -->
        <div *ngIf="authService.isAdminOrPrestataire()" class="nav-section">
          <div class="section-header" (click)="toggleSection('rapports')">
            <span>Rapports</span>
            <i [class.expanded]="sections['rapports']">▸</i>
          </div>
          <div class="sub-nav" [class.expanded]="sections['rapports']">
            <a routerLink="/rapports-suivi" routerLinkActive="active" class="nav-item">📊 Rapports de suivi</a>
            <a routerLink="/rapports-trimestriels" routerLinkActive="active" class="nav-item">📈 Rapports trimestriels</a>
            <a routerLink="/statistiques" routerLinkActive="active" class="nav-item">📉 Statistiques</a>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">🚪 Déconnexion</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --bg: #0f172a;
      --bg-hover: #1e293b;
      --accent: #f97316;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --border: rgba(255,255,255,0.08);
    }

    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 270px;
      height: 100vh;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      box-shadow: 4px 0 12px rgba(0,0,0,0.3);
      overflow-y: auto;
    }

    .sidebar-toggle {
      position: absolute;
      top: 1rem;
      right: -42px;
      width: 42px;
      height: 42px;
      background: var(--bg);
      border: none;
      border-radius: 0 8px 8px 0;
      color: var(--text);
      cursor: pointer;
      box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    }

    .sidebar-toggle:hover { background: var(--bg-hover); }
    .hamburger span {
      display: block;
      width: 20px;
      height: 2px;
      margin: 3px auto;
      background: var(--text);
      border-radius: 1px;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-img {
      width: 3rem;
      height: 3rem;
      border-radius: 6px;
      background: white;
      object-fit: contain;
    }

    .logo-text h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text);
    }
    .logo-text small {
      color: var(--muted);
      font-size: 0.8rem;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.8rem 1.5rem;
      text-decoration: none;
      color: var(--text);
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: var(--bg-hover);
      border-left-color: var(--accent);
      color: var(--accent);
    }

    .nav-item.active {
      background: rgba(249, 115, 22, 0.1);
      border-left-color: var(--accent);
      color: var(--accent);
    }

    .nav-section {
      margin-bottom: 1rem;
    }

    .section-header {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: color 0.2s;
    }

    .section-header:hover { color: var(--accent); }

    .section-header i {
      font-size: 0.8rem;
      transition: transform 0.3s;
    }
    .section-header i.expanded { transform: rotate(90deg); }

    .sub-nav {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .sub-nav.expanded { max-height: 600px; }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
    }

    .logout-btn {
      width: 100%;
      padding: 0.75rem;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.4);
      color: #f87171;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(239,68,68,0.2);
      color: #ef4444;
    }
  `]
})
export class SidebarComponent implements OnChanges {
  @Input() open = true;
  @Output() toggleChange = new EventEmitter<boolean>();
  isOpen = true;

  sections: { [key: string]: boolean } = {
    admin: true,
    rapports: false,
    prestataire: true
  };

  constructor(public authService: AuthService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) this.isOpen = this.open;
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.toggleChange.emit(this.isOpen);
  }

  toggleSection(section: string) {
    this.sections[section] = !this.sections[section];
  }

  getRoleLabel(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    switch (user.role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'PRESTATAIRE': return 'Prestataire';
      case 'AGENT_DGSI': return 'Agent DGSI';
      default: return user.role;
    }
  }

  logout() { this.authService.logout(); }
}

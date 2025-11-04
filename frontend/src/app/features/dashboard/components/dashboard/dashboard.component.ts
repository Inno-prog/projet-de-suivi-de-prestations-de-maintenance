import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { UserService } from '../../../../core/services/user.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { PdfService } from '../../../../core/services/pdf.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-container *ngIf="!authService.isAuthenticated()">
      <ng-container *ngTemplateOutlet="publicView"></ng-container>
    </ng-container>

    <div class="container" *ngIf="authService.isAuthenticated()">
        <div class="dashboard-header">
          <div class="welcome-section">
            <h1>Bienvenue sur <span class="text-primary">DGSI Maintenance</span></h1>
            <p *ngIf="authService.isAuthenticated()">
              Bonjour <strong>{{ authService.getCurrentUser()?.nom }}</strong> -
              <span class="user-role" [class]="getRoleClass()">
                {{ getRoleDisplayName() }}
              </span>
            </p>
            <p *ngIf="!authService.isAuthenticated()">Plateforme de suivi rigoureux des prestations de maintenance informatique</p>
            <p class="subtitle">Développé par Direction Générale des Systèmes d'Information</p>
          </div>

            <div class="cta-section">
            <a href="https://www.it.finances.gov.bf" target="_blank" class="btn btn-primary" *ngIf="!authService.isAuthenticated()">
              En savoir plus
              <span>→</span>
            </a>
            <button class="btn btn-primary" *ngIf="authService.isAuthenticated()" (click)="goToUserDashboard()">
              Mon Dashboard
              
            </button>
          </div>
        </div>




        <div class="stats-section" *ngIf="authService.isAdmin()">
          <div class="stats-header">
            <h2>Statistiques du système</h2>
            <button class="refresh-btn" (click)="refreshStats()" title="Actualiser les statistiques">
              <span>🔄</span> Actualiser
            </button>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">Utilisateurs</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalOrdres }}</div>
              <div class="stat-label">Ordres de Commande</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalEvaluations }}</div>
              <div class="stat-label">Évaluations</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalPrestations }}</div>
              <div class="stat-label">Prestations</div>
            </div>
          </div>
        </div>

        <!-- Role-specific quick actions -->
        <div class="quick-actions" *ngIf="authService.isAuthenticated()">
          <h2>Actions rapides</h2>
          <div class="actions-grid">
            <!-- Admin actions -->
            <ng-container *ngIf="authService.isAdmin()">
              <a routerLink="/users" class="action-card">
                <div class="action-icon">👥</div>
                <h3>Gérer les Utilisateurs</h3>
                <p>Administrer les comptes utilisateur</p>
              </a>
              <a routerLink="/contrats" class="action-card">
                <div class="action-icon">📄</div>
                <h3>Gérer les Contrats</h3>
                <p>Visualiser et gérer tous les contrats</p>
              </a>
              <a routerLink="/équipements" class="action-card">
                <div class="action-icon">🛠️</div>
                <h3>Équipements</h3>
                <p>Gestion complète des équipements informatiques</p>
              </a>
            </ng-container>

            <!-- Prestataire actions -->
            <ng-container *ngIf="authService.isPrestataire()">
              <a routerLink="/contrats" class="action-card">
                <div class="action-icon">📄</div>
                <h3>Contrats & Évaluations</h3>
                <p>Gérer mes contrats et consulter mes évaluations trimestrielles</p>
              </a>
              <a routerLink="/ordres-commande" class="action-card">
                <div class="action-icon">📋</div>
                <h3>Ordres de Commande</h3>
                <p>Approuver ou rejeter les ordres reçus</p>
              </a>
              <a routerLink="/" class="action-card">
                <div class="action-icon">🔧</div>
                <h3>Mes fiches de prestations</h3>
                <p>Créer et gérer mes fiches de prestations</p>
              </a>
            </ng-container>

            <!-- Agent DGSI actions -->
            <ng-container *ngIf="authService.isAgentDGSI()">
              <!-- Gestion des équipements et items -->
              <a routerLink="/items" class="action-card">
                <div class="action-icon">🛠️</div>
                <h3>Gérer les Équipements</h3>
                <p>Gestion complète des équipements informatiques</p>
              </a>

              <a routerLink="/type-items" class="action-card">
                <div class="action-icon">📦</div>
                <h3>Gérer les Items</h3>
                <p>Administration des types d'items et catégories</p>
              </a>

              <!-- Gestion des lots -->
              <a routerLink="/lots" class="action-card">
                <div class="action-icon">🏷️</div>
                <h3>Gérer les Lots</h3>
                <p>Organisation et gestion des lots de maintenance</p>
              </a>

              <!-- Validation et évaluation -->
              <a routerLink="/fiches-prestation" class="action-card">
                <div class="action-icon">📄</div>
                <h3>Fiches de Prestation</h3>
                <p>Valider les fiches de prestations des prestataires</p>
              </a>

              <a routerLink="/evaluations" class="action-card">
                <div class="action-icon">⭐</div>
                <h3>Évaluations</h3>
                <p>Créer et consulter les évaluations des prestataires</p>
              </a>

              <!-- Gestion des contrats -->
              <a routerLink="/contrats" class="action-card">
                <div class="action-icon">📋</div>
                <h3>Reconduire un Contrat</h3>
                <p>Renouveler et gérer les contrats de maintenance</p>
              </a>

              <!-- Gestion des rapports de suivi -->
              <a routerLink="/rapports-suivi" class="action-card">
                <div class="action-icon">📋</div>
                <h3>Rapports de Suivi</h3>
                <p>Gérer et consulter les rapports de suivi des prestations</p>
              </a>

              <!-- Génération de rapports -->
              <button class="action-card" (click)="genererRapportTrimestriel()">
                <div class="action-icon">📊</div>
                <h3>Rapport Trimestriel</h3>
                <p>Générer le rapport de suivi trimestriel</p>
              </button>

              <button class="action-card" (click)="genererRapportAnnuel()">
                <div class="action-icon">📈</div>
                <h3>Rapport Annuel</h3>
                <p>Générer le rapport annuel de maintenance</p>
              </button>

              <!-- Gestion des équipements -->
              <a routerLink="/équipements" class="action-card">
                <div class="action-icon">🛠️</div>
                <h3>Équipements</h3>
                <p>Gestion complète des équipements informatiques</p>
              </a>

              <!-- Statistiques -->
              <a routerLink="/statistiques" class="action-card">
                <div class="action-icon">📊</div>
                <h3>Consulter Statistiques</h3>
                <p>Tableaux de bord et statistiques détaillées</p>
              </a>

              <!-- Clôture de trimestre -->
              <button class="action-card" (click)="cloturerTrimestre()">
                <div class="action-icon">🔒</div>
                <h3>Clôturer Trimestre</h3>
                <p>Finaliser et clôturer le trimestre en cours</p>
              </button>
            </ng-container>
          </div>
        </div>

    </div>

    <ng-template #publicView>
     <div class="public-layout">
       <nav class="navbar">
         <div class="container">
           <div class="nav-brand">
             <div class="logo">
               <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-image">
             </div>
           </div>

           <div class="nav-menu">
             <div class="nav-item dropdown">
               <button class="nav-link">La DGSI <span class="dropdown-arrow">▼</span></button>
               <div class="dropdown-menu">
                 <a href="https://www.finances.gov.bf/accueil" target="_blank" class="dropdown-item">Notre site web</a>
                 <a routerLink="/about" class="dropdown-item">Qui sommes-nous</a>
               </div>
             </div>

             <div class="nav-item dropdown">
               <button class="nav-link">Contacts <span class="dropdown-arrow">▼</span></button>
               <div class="dropdown-menu">
                 <a href="mailto:contact@dgsi.bf" class="dropdown-item">Nous envoyer un mail</a>
                 <a routerLink="/contact" class="dropdown-item">Nous contacter</a>
               </div>
             </div>



             <div class="nav-item">
               <a routerLink="/about" class="nav-link">À propos</a>
             </div>
             <div class="nav-item">
               <a href="https://www.finances.gov.bf" target="_blank" class="nav-link">Ministère</a>
             </div>
           </div>

           <div class="nav-actions">
             <ng-container *ngIf="!authService.isAuthenticated()">
               <a routerLink="/login" class="btn btn-outline">Connexion</a>
               <button class="btn btn-primary" (click)="redirectToKeycloakRegistration()">S'inscrire</button>
             </ng-container>
           </div>
         </div>
       </nav>

       <main class="main-content">
         <div class="floating-shapes">
           <div class="shape shape-1">⚡</div>
           <div class="shape shape-2">🔧</div>
           <div class="shape shape-3">📊</div>
           <div class="shape shape-4">🚀</div>
           <div class="shape shape-5">💡</div>
           <div class="shape shape-6">🔒</div>
         </div>
         <div class="container">
           <div class="dashboard-header" style="max-width: 65%; margin: 0 auto; margin-top: 50px; margin-bottom: 30px; padding: 3rem 2rem; background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%); border-top: 1px solid #1e293b;">
             <div class="welcome-section">
               <h1 class="animated-title">
                 <span class="title-text">Bienvenue sur </span><span class="title-text-3d" style="margin-left: 10px;"> MainTrack Pro </span>
               </h1>
               <p class="animated-subtitle">
                 <span class="word" style="animation-delay: 0.8s">Notre</span>
                 <span class="word" style="animation-delay: 1s">plateforme</span>
                 <span class="word" style="animation-delay: 1.2s">de</span>
                 <span class="word" style="animation-delay: 1.4s">suivi</span>
                 <span class="word" style="animation-delay: 1.6s">professionnel</span>
                 <span class="word" style="animation-delay: 1.8s">des</span>
                 <span class="word" style="animation-delay: 2s">prestations</span>
                 <span class="word" style="animation-delay: 2.2s">de</span>
                 <span class="word" style="animation-delay: 2.4s">maintenance</span>
                 <span class="word" style="animation-delay: 2.6s">informatique</span>
               </p>
               <p class="subtitle animated-subtitle">
                 <span class="word" style="animation-delay: 2.8s">Développé</span>
                 <span class="word" style="animation-delay: 3s">par</span>
                 <span class="word" style="animation-delay: 3.2s">Direction</span>
                 <span class="word" style="animation-delay: 3.4s">Générale</span>
                 <span class="word" style="animation-delay: 3.6s">des</span>
                 <span class="word" style="animation-delay: 3.8s">Systèmes</span>
                 <span class="word" style="animation-delay: 4s">d'Information</span>
               </p>
             </div>

             <div class="cta-section">
               <a href="https://it.finances.bf/" target="_blank" class="btn btn-primary animated-cta" style="animation-delay: 1.2s">
                 <span class="btn-text">En savoir plus</span>
                 <span class="btn-arrow"></span>
               </a>
             </div>
           </div>

           <div class="features-section" style="margin-top: 80px; margin-bottom: 75px;">
             <div class="feature-card animate" routerLink="/login" style="animation-delay: 0.2s">
               <div class="feature-icon">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M20 8H17V6C17 4.9 16.1 4 15 4H9C7.9 4 7 4.9 7 6V8H4C2.9 8 2 8.9 2 10V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V10C22 8.9 21.1 8 20 8ZM9 6H15V8H9V6ZM20 19H4V10H8V12H16V10H20V19Z" fill="#F97316"/>
                 </svg>
               </div>
               <h3>Gestion Prestations</h3>
               <p>Création et gestion complète des prestataires avec leurs items associés</p>
               <div class="card-glow"></div>
             </div>

             <div class="feature-card animate" routerLink="/login" style="animation-delay: 0.4s">
               <div class="feature-icon">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#F97316"/>
                 </svg>
               </div>
               <h3>Suivi Sécurisé</h3>
               <p>Suivi rigoureux de l'exécution des prestations de maintenance</p>
               <div class="card-glow"></div>
             </div>

             <div class="feature-card animate" routerLink="/login" style="animation-delay: 0.6s">
               <div class="feature-icon">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H5V3H13V7C13 8.1 13.9 9 15 9H21ZM7 10C5.9 10 5 10.9 5 12V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V12C19 10.9 18.1 10 17 10H7ZM12 18.5C10.29 18.5 8.93 17.14 8.93 15.43C8.93 13.72 10.29 12.36 12 12.36C13.71 12.36 15.07 13.72 15.07 15.43C15.07 17.14 13.71 18.5 12 18.5Z" fill="#F97316"/>
                 </svg>
               </div>
               <h3>Rapports et Évaluations</h3>
               <p>Évaluation continue des prestataires selon des critères standardisés</p>
               <div class="card-glow"></div>
             </div>
           </div>

         </div>
       </main>

       <footer class="professional-footer" style="margin-top: -50px;">
         <div class="footer-container" style="margin-top: -20px;">
           <!-- Colonne Contact -->
           <div class="footer-column">
             <h4>Contact</h4>
             <div class="contact-info">
               <div class="contact-item">
                 <span class="icon">📧</span>
                 <a href="mailto:contact@dgsi.bf">contact&#64;dgsi.bf</a>
               </div>
               <div class="contact-item">
                 <span class="icon">📞</span>
                 <a href="tel:+22625307000">+226 25 30 70 00</a>
               </div>
               <div class="contact-item">
                 <span class="icon">📍</span>
                 <span>Direction Générale des Systèmes d'Information<br>Ouagadougou, Burkina Faso</span>
               </div>
             </div>
           </div>

           <!-- Colonne Liens rapides -->
           <div class="footer-column">
             <h4>Liens rapides</h4>
             <ul class="footer-links">
               <li><a routerLink="/about">À propos de la DGSI</a></li>
               <li><a routerLink="/services/maintenance">Suivi de maintenance</a></li>
               <li><a routerLink="/services/reports">Rapports & Évaluations</a></li>
               <li><a href="https://www.finances.gov.bf" target="_blank">Ministère des Finances</a></li>
             </ul>
           </div>

           <!-- Colonne Services -->
           <div class="footer-column">
             <h4>Nos services</h4>
             <ul class="footer-links">
               <li><a routerLink="/services/maintenance">Maintenance informatique</a></li>
               <li><a routerLink="/services/reports">Évaluation prestataires</a></li>
               <li><a routerLink="/fiches-prestation">Gestion des prestations</a></li>
               <li><a routerLink="/contrats">Gestion des contrats</a></li>
               <li><a routerLink="/statistiques">Tableaux de bord</a></li>
             </ul>
           </div>
         </div>

         <!-- Barre du bas -->
         <div class="footer-bottom">
           <div class="footer-bottom-container">
             <div class="copyright">
               &copy; 2025 Direction Générale des Systèmes d'Information. Tous droits réservés.
             </div>
             <div class="social-links">
               <a href="https://www.facebook.com/It-Finances-Burkina-1921685034559116/" target="_blank" class="social-link" title="Facebook">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                 </svg>
               </a>
               <a href="https://x.com/FinancesBf" target="_blank" class="social-link" title="Twitter">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                 </svg>
               </a>
               <a href="https://mailer.gov.bf/" target="_blank" class="social-link" title="Webmail">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                 </svg>
               </a>
             </div>
           </div>
         </div>
       </footer>
     </div>
</ng-template>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      border-bottom: 1px solid #1e293b;
      color: #e2e8f0;
      padding: 1rem 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 10;
    }

    .navbar .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      width: 3rem;
      height: 3rem;
      background: var(--primary);
      color: white;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .logo-image {
      width: 4rem;
      height: 4rem;
      border-radius: var(--radius);
      object-fit: contain;
    }


    .nav-menu {
      display: flex;
      gap: 5rem;
      align-items: center;
      margin-left: 4rem;
    }

    .nav-item {
      position: relative;
      z-index: 1000;
    }

    .nav-link {
      background: none;
      border: none;
      color: #cbd5e1;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .nav-link:hover::before {
      left: 100%;
    }

    .nav-link:hover {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
    }

    .dropdown-arrow {
      font-size: 0.8rem;
      transition: transform 0.3s ease;
    }

    .nav-item:hover .dropdown-arrow {
      transform: rotate(180deg);
    }

    .nav-item .dropdown-menu {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      color: #0f172a;
      border-radius: 0;
      box-shadow: 0 20px 40px rgba(2,6,23,0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
      min-width: 420px;
      width: max-content;
      padding: 1rem 0;
      list-style: none;
      margin: 0;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: visible;
    }

    .nav-item:hover .dropdown-menu,
    .nav-item:focus-within .dropdown-menu {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }

    .nav-item .dropdown-item {
      display: block;
      padding: 0.75rem 1.5rem;
      color: #374151 !important;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
      border-radius: 8px;
      margin: 0 0.5rem;
      white-space: nowrap;
    }

    .nav-item .dropdown-item:hover {
      color: white !important;
      background: linear-gradient(90deg, var(--primary), #ea580c);
    }

    .nav-item .dropdown-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 100%;
      background: linear-gradient(90deg, var(--primary), #ea580c);
      border-radius: 8px;
      transition: width 0.3s ease;
      z-index: -1;
    }

    .nav-item .dropdown-item:hover::before {
      width: 100%;
    }

    .nav-item .dropdown-item:hover {
      color: white;
      transform: translateX(4px);
    }

    .nav-item .dropdown-item:first-child {
      margin-top: 0.5rem;
    }

    .nav-item .dropdown-item:last-child {
      margin-bottom: 0.5rem;
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    .nav-info {
      display: inline-flex;
      align-items: center;
      position: relative;
      margin-left: 1rem;
    }

    .info-toggle {
      background: rgba(255, 255, 255, 0.06);
      color: white;
      border: none;
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.16s ease, transform 0.12s ease;
    }

    .info-toggle:focus,
    .info-toggle:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
      outline: none;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      color: #0f172a;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(2,6,23,0.12);
      min-width: 200px;
      padding: 0.5rem 0;
      list-style: none;
      margin: 0;
      opacity: 0;
      transform: translateY(-6px);
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
      z-index: 50;
    }

    .info-dropdown:focus-within .dropdown-menu,
    .info-dropdown:hover .dropdown-menu {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .dropdown-item {
      display: block;
      padding: 0.6rem 1rem;
      color: #0f172a;
      text-decoration: none;
      font-weight: 500;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
    }

    .nav-actions .btn {
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
    }

    .nav-actions .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .nav-actions .btn:hover::before {
      left: 100%;
    }

    .nav-actions .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
    }

    .nav-actions .btn-outline {
      background-color: transparent;
      border: 1px solid rgba(249, 115, 22, 0.6);
      color: var(--primary);
    }

    .nav-actions .btn-outline:hover {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .nav-actions .btn-primary {
      background-color: var(--primary);
      border: 1px solid var(--primary);
      color: white;
    }

    .nav-actions .btn-primary:hover {
      background-color: #ea580c;
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.6);
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
      background: #f8fafc;
      position: relative;
      overflow: hidden;
    }

    .main-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      z-index: -1;
    }


    .floating-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .shape {
      position: absolute;
      font-size: 2rem;
      opacity: 0.1;
      animation: floatShape 15s ease-in-out infinite;
    }

    .shape-1 { top: 10%; left: 10%; animation-delay: 0s; }
    .shape-2 { top: 20%; right: 15%; animation-delay: 2s; }
    .shape-3 { bottom: 30%; left: 20%; animation-delay: 4s; }
    .shape-4 { bottom: 20%; right: 10%; animation-delay: 6s; }
    .shape-5 { top: 50%; left: 50%; animation-delay: 8s; }
    .shape-6 { top: 70%; right: 20%; animation-delay: 10s; }

    @keyframes floatShape {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .dashboard-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-top: 1px solid #475569;
      color: #e2e8f0;
      padding: 3rem 2rem;
      border-radius: 16px;
      margin: 0 auto;
      margin-top: 50px;
      margin-bottom: 30px;
      max-width: 95%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .welcome-section h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #f8fafc;
    }

    .text-primary {
      color: var(--primary);
    }

    .welcome-section p {
      font-size: 1.25rem;
      color: #cbd5e1;
      margin-bottom: 0.5rem;
    }

    .user-role {
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .role-admin {
      background-color: #dc2626;
      color: white;
    }

    .role-prestataire {
      background-color: #059669;
      color: white;
    }

    .role-ci {
      background-color: #7c3aed;
      color: white;
    }

    .subtitle {
      font-size: 1rem !important;
      color: #94a3b8 !important;
    }

    .cta-section .btn {
      font-size: 1.125rem;
      padding: 1rem 2rem;
      background-color: var(--primary);
      border: none;
    }

    .cta-section .btn span {
      margin-left: 0.5rem;
      transition: transform 0.2s ease-in-out;
    }

    .cta-section .btn:hover span {
      transform: translateX(4px);
    }

    .cta-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-bell {
      position: relative;
      cursor: pointer;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .notification-bell:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .bell-icon {
      font-size: 1.5rem;
      display: block;
    }

    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
      }
    }

    .features-section {
      display: grid;
      /* auto-fit ensures cards flow and create whitespace when wide */
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: clamp(1rem, 3vw, 2.5rem); /* adaptive gap */
      margin: 4rem auto;
      max-width: 1280px;
      padding: 0 1.5rem;
      justify-items: center; /* center cards to create visual breathing room */
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      padding: 2.25rem 1.75rem;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(2, 6, 23, 0.12), 0 0 0 1px rgba(249, 115, 22, 0.1);
      text-align: center;
      transition: transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms cubic-bezier(.2,.8,.2,1);
      border: 1px solid rgba(249, 115, 22, 0.2);
      width: 100%;
      max-width: 420px; /* limit width so space appears between cards on large screens */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      position: relative;
      overflow: hidden;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.5s;
    }

    .feature-card:hover::before {
      left: 100%;
    }

    .feature-card:nth-child(1) { animation-delay: 0.1s; }
    .feature-card:nth-child(2) { animation-delay: 0.2s; }
    .feature-card:nth-child(3) { animation-delay: 0.3s; }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animated-title {
      display: inline-block;
    }

    .title-text {
      display: inline-block;
      animation: fadeInUp 1s ease-out;
    }

    .title-text-3d {
      display: inline-block;
      background: linear-gradient(135deg, #F97316 0%, #ea580c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: fadeInUp 1s ease-out 0.3s both;
      text-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
    }

    .animated-subtitle {
      animation: fadeInUp 1s ease-out both;
      opacity: 0;
    }

    .word {
      display: inline-block;
      opacity: 0;
      animation: fadeInWord 0.8s ease-out forwards, slideWord 3s ease-in-out infinite;
      margin-right: 0.3em;
    }

    @keyframes fadeInWord {
      to {
        opacity: 1;
      }
    }

    @keyframes slideWord {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .animated-cta {
      animation: fadeInUp 1s ease-out both;
      opacity: 0;
    }

    .btn-text {
      display: inline-block;
      transition: transform 0.2s ease;
    }

    .btn-arrow {
      display: inline-block;
      margin-left: 0.5rem;
      transition: transform 0.2s ease;
    }

    .animated-cta:hover .btn-text {
      transform: translateX(-4px);
    }

    .animated-cta:hover .btn-arrow {
      transform: translateX(4px);
    }

    .feature-card:hover {
      transform: translateY(-8px) scale(1.01);
      box-shadow: 0 22px 60px rgba(249, 115, 22, 0.25), 0 0 0 1px rgba(249, 115, 22, 0.3);
      border-color: #F97316;
      background: linear-gradient(135deg, #fefefe 0%, #f1f5f9 100%);
    }

    .feature-card.animate {
      animation: slideUp 0.8s ease-out forwards;
      opacity: 0;
    }

    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 50%, transparent 100%);
      border-radius: 14px;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    .feature-card:hover .card-glow {
      opacity: 1;
    }

    .feature-icon {
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .feature-icon svg {
      width: 64px;
      height: 64px;
    }

    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: #6b7280;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .stats-section {
      margin-bottom: 3rem;
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .stats-section h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .refresh-btn:hover {
      background: #ea580c;
      transform: translateY(-1px);
    }

    .refresh-btn span {
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .quick-actions h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-decoration: none;
      transition: all 0.2s ease-in-out;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .action-card p {
      color: var(--text-secondary);
      margin: 0;
    }

    .notifications-section {
      margin-top: 3rem;
    }

    .notifications-section h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      border-left: 4px solid #e5e7eb;
    }

    .notification-card.unread {
      border-left-color: var(--primary);
      background: #fef3c7;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .notification-type {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .type-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .type-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .type-success {
      background: #dcfce7;
      color: #166534;
    }

    .type-error {
      background: #fecaca;
      color: #991b1b;
    }

    .notification-date {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .notification-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .notification-card p {
      margin: 0 0 1rem 0;
      color: #4b5563;
    }

    .professional-footer {
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      color: #e2e8f0;
      border-top: 1px solid #1e293b;
      margin-top: auto;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.6s ease forwards;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .footer-container {
      max-width: 80%;
      margin: 0 auto;
      padding: 50px 20px 30px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }

    .footer-column {
      transition: transform 0.3s ease;
    }

    .footer-column:hover {
      transform: translateY(-5px);
    }

    .footer-column h4 {
      color: #f8fafc;
      font-size: 1.1rem;
      margin-bottom: 20px;
      font-weight: 600;
      position: relative;
    }

    .footer-column h4::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 30px;
      height: 2px;
      background: #f97316;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      line-height: 1.4;
    }

    .contact-item .icon {
      color: #f97316;
      font-size: 1.1rem;
      min-width: 20px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 10px;
    }

    .footer-links a {
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .footer-links a:hover {
      color: #f97316;
      padding-left: 5px;
    }

    .social-links {
      display: flex;
      gap: 15px;
      margin-top: 15px;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.3s ease;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .social-link:hover {
      color: #f97316;
      background: rgba(249, 115, 22, 0.1);
      border-color: #f97316;
      transform: translateY(-2px);
    }

    .social-link svg {
      width: 20px;
      height: 20px;
    }

    .newsletter {
      margin-top: 1.5rem;
    }

    .newsletter p {
      margin-bottom: 1rem;
      font-size: 0.95rem;
      color: #e2e8f0;
    }

    .newsletter-form {
      display: flex;
      gap: 0.5rem;
    }

    .newsletter-form input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.9rem;
    }

    .newsletter-form input::placeholder {
      color: #94a3b8;
    }

    .newsletter-form button {
      padding: 0.5rem 1rem;
      background: #F97316;
      border: none;
      border-radius: 4px;
      color: white;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .newsletter-form button:hover {
      background: #ea580c;
    }

    .footer-bottom {
      border-top: 1px solid #1e293b;
      background: rgba(15, 23, 42, 0.8);
    }

    .footer-bottom-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .copyright {
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .legal-links {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .legal-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.3s ease;
    }

    .legal-links a:hover {
      color: #f97316;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
      }

      .welcome-section h1 {
        font-size: 2rem;
      }

      .features-section {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 0 1rem;
        margin: 3rem auto;
      }

      .feature-card {
        padding: 2rem 1.5rem;
      }

      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .shape {
        font-size: 1.5rem;
      }

      .footer-container {
        grid-template-columns: 1fr;
        gap: 30px;
        padding: 40px 20px 20px;
      }

      .footer-bottom-container {
        flex-direction: column;
        text-align: center;
      }

      .legal-links {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .footer-container {
        padding: 30px 15px 15px;
      }

      .legal-links {
        gap: 10px;
      }

      .legal-links a {
        font-size: 0.8rem;
      }

      .footer-bottom-container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
        padding: 0 1rem;
      }

      .legal-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
      }

      .social-links {
        justify-content: center;
      }

      .newsletter-form {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = {
    totalUsers: 0,
    totalContrats: 0,
    totalOrdres: 0,
    totalEvaluations: 0,
    totalDemandes: 0,
    demandesEnAttente: 0,
    totalPrestations: 0
  };

  private refreshInterval: any;
  private userSub?: Subscription;


  constructor(
    public authService: AuthService,
    private contratService: ContratService,
    private ordreCommandeService: OrdreCommandeService,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private router: Router,
    private prestationService: FichePrestationService,
    private pdfService: PdfService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  redirectToKeycloakRegistration(): void {
    const isProduction = window.location.protocol === 'https:';
    const issuer = isProduction
      ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI'
      : 'http://localhost:8080/realms/Maintenance-DGSI';
    const clientId = 'maintenance-app';
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const registrationUrl = `${issuer}/protocol/openid-connect/registrations?client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = registrationUrl;
  }

  ngOnInit(): void {
    // Si l'utilisateur est déjà présent et est administrateur, charger les statistiques immédiatement
    if (this.authService.isAdmin()) {
      this.loadStats();
      this.startAutoRefresh();
    }

    // S'abonner également à l'état d'authentification — lorsqu'un utilisateur se connecte et devient
    // disponible (après le rappel OAuth), déclencher le chargement des statistiques. Cela gère
    // les cas de synchronisation où le tableau de bord s'initialise avant la fin du flux d'authentification.
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user && this.authService.isAdmin()) {
        this.loadStats();
        this.startAutoRefresh();
      }
    });
  }

  private loadStats(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: `Impossible de charger les statistiques des utilisateurs : ${errMsg}`
          });
        }
      }
    });

    this.contratService.getAllContrats().subscribe({
      next: (contrats) => {
        this.stats.totalContrats = contrats.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des contrats:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({ type: 'error', title: 'Erreur', message: `Impossible de charger les statistiques des contrats : ${errMsg}` });
        }
      }
    });

    this.ordreCommandeService.getAllOrdresCommande().subscribe({
      next: (ordres) => {
        this.stats.totalOrdres = ordres.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des ordres:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({ type: 'error', title: 'Erreur', message: `Impossible de charger les statistiques des ordres : ${errMsg}` });
        }
      }
    });

    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        this.stats.totalEvaluations = evaluations.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des évaluations:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({ type: 'error', title: 'Erreur', message: `Impossible de charger les statistiques des évaluations : ${errMsg}` });
        }
      }
    });

    this.prestationService.getAllFiches().subscribe({
      next: (prestations) => {
        this.stats.totalPrestations = prestations.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des prestations:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({ type: 'error', title: 'Erreur', message: `Impossible de charger les statistiques des prestations : ${errMsg}` });
        }
      }
    });
  }


  getRoleDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';

    switch (user.role) {
      case 'ADMINISTRATEUR':
        return 'Administrateur';
      case 'PRESTATAIRE':
        return 'Prestataire';
      case 'AGENT_DGSI':
        return 'Agent DGSI';
      default:
        return user.role;
    }
  }

  getRoleClass(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';

    switch (user.role) {
      case 'ADMINISTRATEUR':
        return 'role-admin';
      case 'PRESTATAIRE':
        return 'role-prestataire';
      case 'AGENT_DGSI':
        return 'role-ci';
      default:
        return '';
    }
  }


  goToUserDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'ADMINISTRATEUR':
          this.router.navigate(['/dashboard/admin']);
          break;
        case 'PRESTATAIRE':
          this.router.navigate(['/dashboard/prestataire']);
          break;
        case 'AGENT_DGSI':
          this.router.navigate(['/dashboard/ci']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    }
  }

  genererOrdreCommande(): void {
    this.pdfService.genererOrdreCommande().subscribe({
      next: (blob) => {
        const trimestre = this.getCurrentTrimestre();
        const filename = `ordre-commande-${trimestre}.txt`;
        this.pdfService.downloadFile(blob, filename);
      },
      error: (error) => {
        console.error('Error generating ordre commande:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la génération de l\'ordre de commande' });
      }
    });
  }

  private getCurrentTrimestre(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const trimestre = Math.ceil(month / 3);
    return `T${trimestre}-${year}`;
  }

  genererRapportTrimestriel(): void {
    this.pdfService.genererRapportTrimestriel().subscribe({
      next: (blob) => {
        const trimestre = this.getCurrentTrimestre();
        const filename = `rapport-trimestriel-${trimestre}.pdf`;
        this.pdfService.downloadFile(blob, filename);
      },
      error: (error) => {
        console.error('Error generating rapport trimestriel:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la génération du rapport trimestriel' });
      }
    });
  }

  genererRapportAnnuel(): void {
    const year = new Date().getFullYear();
    this.pdfService.genererRapportAnnuel().subscribe({
      next: (blob) => {
        const filename = `rapport-annuel-${year}.pdf`;
        this.pdfService.downloadFile(blob, filename);
      },
      error: (error) => {
        console.error('Error generating rapport annuel:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la génération du rapport annuel' });
      }
    });
  }

  startAutoRefresh(): void {
    // Actualiser les statistiques toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.refreshStats();
    }, 30000);
  }

  refreshStats(): void {
    if (this.authService.isAdmin()) {
      this.loadStats();
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  async cloturerTrimestre(): Promise<void> {
    const trimestre = this.getCurrentTrimestre();
    const confirmed = await this.confirmationService.show({
      title: 'Clôturer le trimestre',
      message: `Êtes-vous sûr de vouloir clôturer le trimestre ${trimestre} ? Cette action est irréversible.`,
      confirmText: 'Clôturer',
      cancelText: 'Annuler',
      type: 'warning'
    });

    if (confirmed) {
      // TODO: Implement trimestre closure logic
    }
  }
}
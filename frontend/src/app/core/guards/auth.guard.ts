import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // Check role-based access for protected routes
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const user = this.authService.getCurrentUser();
      console.log('AuthGuard: Checking role access', { requiredRole, userRole: user?.role });
      if (!user || user.role !== requiredRole) {
        console.log('AuthGuard: Role access denied, redirecting to user dashboard');
        // Redirect to user's own dashboard
        this.redirectToUserDashboard(user?.role);
        return false;
      }
    }

    console.log('AuthGuard: Access granted');
    return true;
  }

  private redirectToUserDashboard(userRole?: string): void {
    switch (userRole) {
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
        this.router.navigate(['/login']);
    }
  }
}
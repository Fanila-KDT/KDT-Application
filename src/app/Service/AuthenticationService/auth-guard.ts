import { HostListener, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth';
import { UserAccessService } from './user-access';
import { AlertService } from '../../shared/alert/alert.service';
import { App } from '../../app';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if(localStorage.getItem('LoginUser')  === 'IN'){
      this.authService.login('success')
    }
    const token = localStorage.getItem('authToken');
    if (token) {
      return true;
    } else {
      this.router.navigate(['/login-page']);
      return false;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private accessService: UserAccessService, private router: Router,private alertService:AlertService,private userAccessService:UserAccessService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const permission = route.data['permission'];
    const requiredLevel = route.data['level'];

    if (permission && requiredLevel !== undefined) {
      const userLevel = this.accessService.getLevel(permission); // returns numeric level_of_rights
      if (userLevel >= requiredLevel) {
        return true; // allow if user has equal or higher rights
      } else {
        this.router.navigate(['/dashboard']);
        this.alertService.triggerAlert('You do not have permission to access this page.', 2000, 'error');
        return false;
      }
    }
    return true;
  }
}






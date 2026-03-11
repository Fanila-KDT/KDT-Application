import { Component, HostListener, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoginModelLog } from './Model/LoginPage/login-page.model';
import { LoginService } from './Service/LoginService/login-page-service';
import { AlertService } from './shared/alert/alert.service';
import { AuthService } from './Service/AuthenticationService/auth';
import { UserAccessService } from './Service/AuthenticationService/user-access';
import { AuthGuard } from './Service/AuthenticationService/auth-guard';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  subscription: Subscription[];
  public naviagationVisible = new BehaviorSubject<boolean>(false);
  protected readonly title = signal('ERPMasterForms');
  isLoginPage: boolean = localStorage.getItem('LoginUser') == 'IN' ?true:false;
  showHeader = false;
  showPadding = true;

  constructor(private router: Router,public loginModelLog: LoginModelLog,public authguard :AuthGuard,public loginService:LoginService,private alertService:AlertService,private userAccessService: UserAccessService,private authService: AuthService) {
    this.subscription = new Array<Subscription>();

     this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Hide header/nav and remove padding on login page
        const isLogin = event.urlAfterRedirects.includes('login-page');
        this.showHeader = !isLogin;
        this.showPadding = !isLogin;
      }
    });

    this.userAccessService.logout.subscribe(logoutStatus => {
      if (logoutStatus) {
        this.commonlogout(); 
      } 
    });

    this.userAccessService.ngOnInit();
    
    let user_id = sessionStorage.getItem('user_id')||'';
    this.userAccessService.username.next(user_id);
    localStorage.setItem('user_id',user_id);
  }

  logout() {
    this.loginModelLog.user_id = localStorage.getItem('user_id') || '';
    this.loginModelLog.status = 'OUT';
    localStorage.setItem('LoginUser','OUT');
    this.loginService.SaveLoginCredinals(this.loginModelLog).then((res: any) => {
      localStorage.setItem('LoginUser','OUT');
      this.router.navigate(['/login-page']);
    }).catch(error => {
      console.error('SaveAccountMaster error:', error);
      this.alertService.triggerAlert('Login credinal didn\'t saved... Please try again.', 4000, 'error');
    });
  }

  ngOnInit() {
   
    window.addEventListener('beforeunload', () => {
      if (localStorage.getItem('LoginUser') == 'IN'){
        localStorage.setItem('authToken','success')
        this.userAccessService.ngOnInit();
        this.userAccessService.HeaderName.next(sessionStorage.getItem('HeaderName')||'dashboard');
        this.isLoginPage = false;
      }
    });

    window.addEventListener('unload', () => {
      if (localStorage.getItem('LoginUser') === 'IN'){
          this.commonlogout();
      }
    });

    this.router.events.subscribe(event => { 
      if (event instanceof NavigationStart) { 
        console.log('Navigation detected:', event.url); 
        // Example: if user navigates away from dashboard 
        if (event.url === '/login-page' && localStorage.getItem('authToken') != null ) 
        { 
          this.commonlogout();
        }
      } 
    });
  }
  
  commonlogout() {
    if(localStorage.getItem('user_id') === null){
      return;
    }
    this.logout();
    localStorage.clear();
    localStorage.setItem('activeHeader','dashboard');
    this.userAccessService.setHeader('dashboard');
    localStorage.setItem('Log','dashboard');
  }

}

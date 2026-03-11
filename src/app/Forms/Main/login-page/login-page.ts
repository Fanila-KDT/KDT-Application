import { Component } from '@angular/core';
import { App } from '../../../app';
import { LoginModel, LoginModelLog } from '../../../Model/LoginPage/login-page.model';
import { LoginService } from '../../../Service/LoginService/login-page-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { AuthService } from '../../../Service/AuthenticationService/auth';
import { Router } from '@angular/router';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  logoPath: string = 'assets/img/kdt_logo.jpg';
  errorMessage: string='';
  loginModel:LoginModel= new LoginModel();
  loginModelLog:LoginModelLog= new LoginModelLog();

  constructor(public app:App, public loginService:LoginService,private alertService:AlertService,private authService: AuthService,private router: Router,public userAccessService:UserAccessService) { }
  login() {
    this.loginService.login(this.loginModel).subscribe({
      next: (response) => {
        localStorage.setItem('jwtToken', response.token);
        this.loginModelLog.user_id=this.loginModel.user_id;
        this.loginModelLog.status ='IN';

         this.loginService.SaveLoginCredinals(this.loginModelLog).then((res: any) => {
          }).catch(error => {
            console.error('SaveAccountMaster error:', error);
            this.alertService.triggerAlert('Login credinal didn\'t saved... Please try again.', 4000, 'error');
          });

        localStorage.setItem('LoginUser','IN');
        localStorage.setItem('user_id', this.loginModel.user_id);
        sessionStorage.setItem('user_id', this.loginModel.user_id);
        this.userAccessService.username.next(this.loginModel.user_id);
        this.authService.login('success'); // save token
        this.router.navigate(['/dashboard']);   // redirect
        this.userAccessService.ngOnInit();
        this.app.naviagationVisible.next(true);
      return;
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please check your credentials';
      }
    });
  }
}

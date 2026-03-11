import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import { LoginEndpointService } from './login-page.end-point.service';
import { LoginModelLog } from '../../Model/LoginPage/login-page.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  username: string = '';
  constructor(private httpClient:HttpClient, public endpointService: LoginEndpointService,private alertService:AlertService) { }

  login(credentials: { user_id: string; password: string }): Observable<any> {
    return this.httpClient.post<any>(this.endpointService.CheckLoginCredinals, credentials);
  }

  async SaveLoginCredinals(LoginModelLog: LoginModelLog): Promise<any> {  
    try {
      const res = await firstValueFrom(
        this.httpClient.post<any>(this.endpointService.SaveLoginCredinals, LoginModelLog)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('SaveAccountMaster : ', error);
      const message = 'Something went wrong while Saving Account. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return null; // Return null on error
    }   
  }
}

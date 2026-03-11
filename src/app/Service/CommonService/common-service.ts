import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { CommonEndpointService } from './common-end-point.service';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  username: string = '';
  public isSystemAdmin = new BehaviorSubject<boolean>(false);
  constructor(private httpClient:HttpClient, public endpointService: CommonEndpointService,private alertService:AlertService) { }

  async GetGuid(): Promise<any> {
    try{
      const itemNo = await this.httpClient.get<any>(this.endpointService.GetGuid).toPromise();
      return itemNo; 
    }catch (error) {
      console.error('GetGuid : ', error);
      let message='Something went wrong while Get ItemNo. Please try again';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

    async getYears(): Promise<any[]>{
      let message='Something went wrong while Getting Years List. Please try again.';
      try{
          return await lastValueFrom(
          this.httpClient.get<any[]>(this.endpointService.GetYears)
        );
      }catch (error) {
        console.error('GetYears : ', error);
        this.alertService.triggerAlert(message,4000, 'error');
        throw error;
      }
    }

  
}

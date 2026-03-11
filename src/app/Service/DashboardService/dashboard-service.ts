import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { DashboardEndpointService } from './dashboard.end-point.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  RecieptEntry:number = 0;
  ExpenseEntry:number = 0;

  public clickedRecieptEntry = new BehaviorSubject<any>(null);
  public clickedExpenseEntry = new BehaviorSubject<any>(null);
  constructor(private httpClient:HttpClient, private endpointService: DashboardEndpointService,private alertService:AlertService) {}
  
}

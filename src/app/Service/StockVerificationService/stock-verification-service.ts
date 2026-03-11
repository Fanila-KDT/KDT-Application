import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { StockVerificationEndpointService } from './stock-verification-end-point.service';
import { StockDetailsModel, StockVerificationModel, StockVerificationMSearch } from '../../Model/StockVerification/stock-verification.model';

@Injectable({
  providedIn: 'root'
})
export class StockVerificationService {
  FormName = 'STOCK_VERIFICATION';

  public mainList:StockVerificationModel[]=[];  
  public loadListStockVerification = new BehaviorSubject<StockVerificationModel[]>([]);  
  public assignStockDetails = new BehaviorSubject<StockDetailsModel>(new StockDetailsModel()) ;
  //public addRowAfterSave = new BehaviorSubject<RecieptEntryModel>(new RecieptEntryModel()) ;
  public addRowAfterModify = new BehaviorSubject<any>(new StockVerificationModel()) ;
  public clickedStock = new BehaviorSubject<StockVerificationModel>(new StockVerificationModel()) ;
  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);

  constructor(private httpClient:HttpClient, public endpointService: StockVerificationEndpointService,private alertService:AlertService) { }

  async getStockVerificationList(year:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<StockVerificationModel[]>(this.endpointService.GetStockVerificationList + '/' + year)
      );
      this.mainList = res;
      this.loadListStockVerification.next(res);
      this.clickedStock.next(res[0]);
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getStockVerificationList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getStockVerificationDetails(voucher_id:any){
    try{
      if(voucher_id == null || voucher_id == undefined){
        return;
      }
      await this.httpClient.get<any>(this.endpointService.GetStockVerificationDetails +'/'+voucher_id).subscribe({
      next: res => {
        this.assignStockDetails.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('getStockVerificationDetails : ', error);
      let message='Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  saveVaricationItems(Finalrows: any[],status:number) {
    return this.httpClient.post<any>(this.endpointService.SaveVaricationItems+'/'+status, Finalrows);
  }

  async SearchList(searchList: StockVerificationMSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.approval_status != null) {
      params = params.set('approval_status', searchList.approval_status);
    }
    if (searchList.document_number != null) {
      params = params.set('document_number', searchList.document_number);
    }
    if (searchList.po_no != null) {
      params = params.set('po_no', searchList.po_no);
    }
    params = params.set('year', sessionStorage.getItem('year')|| 0)
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    );
    this.mainList = res;
    this.loadListStockVerification.next(res);
    this.clickedStock.next(res[0]);
  }
}

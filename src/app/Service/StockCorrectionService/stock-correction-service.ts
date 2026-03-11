import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { StockCorrectionEndpointService } from './stock-correction-end-point.service';
import {  StockCorrectionDetailModel, StockCorrectionModel, StockCorrectionSearch } from '../../Model/StockCorrection/stock-correction.model';
import { FinancialDataHeader } from '../../Model/CommonModel';

@Injectable({
  providedIn: 'root'
})
export class StockCorrectionService {
  FormName = 'STOCK_CORRECTION';
  public mainList:StockCorrectionModel[]=[];  
  public disableGrid = new BehaviorSubject<boolean>(false);  
  public selected = new BehaviorSubject<any[]>([]);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public newDisable = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public clickedStockCorr = new BehaviorSubject<StockCorrectionModel>(new StockCorrectionModel()) ;
  public loadListStockCorrection = new BehaviorSubject<StockCorrectionModel[]>([]); 
  public ItemList : any[] = [];  
  public assignStockCorrDetails = new BehaviorSubject<StockCorrectionDetailModel>(new StockCorrectionDetailModel()) ;
  
    
  constructor(private httpClient:HttpClient, public endpointService: StockCorrectionEndpointService,private alertService:AlertService) { }

  async getStockCorrectionList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<StockCorrectionModel[]>(this.endpointService.GetStockCorrectionList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadListStockCorrection.next(res);
        this.clickedStockCorr.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getExpenseEntryList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getAccountList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetAccountList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetAccountList : ', error);
      const message = 'Something went wrong while Fetching Account List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

    async getStockCorrectionDetails(voucher_id:any){
    try{
      if(voucher_id == null || voucher_id == undefined){
        return;
      }
      await this.httpClient.get<any>(this.endpointService.GetStockCorrectionDetails +'/'+voucher_id).subscribe({
      next: res => {
        this.assignStockCorrDetails.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('getStockCorrectionDetails : ', error);
      let message='Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  saveStockCorrection(headerModel: FinancialDataHeader, gridModel: any[],) {
    const payload = {
      headerModel: headerModel,
      gridModel: gridModel,
    };
    return this.httpClient.post<any>(this.endpointService.saveStockCorrection, payload)
  }

  deleteStockCorrection(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteStockCorrection + '/' + voucher_id + '/' + sessionStorage.getItem('year')
    );
  }

  async SearchList(searchList: StockCorrectionSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.approval_status != null) {
      params = params.set('approval_status', searchList.approval_status);
    }
    if (searchList.document_number != null) {
      params = params.set('document_number', searchList.document_number);
    }
    params = params.set('year', sessionStorage.getItem('year')|| 0)
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    );
    this.mainList = res;
    this.loadListStockCorrection.next(res);
    this.clickedStockCorr.next(res[0]);
  }

}

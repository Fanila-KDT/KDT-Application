import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { StockTakingEndpointService } from './stock-taking-end-point.service';
import { StockTakingDetail, StockTakingHeader, StockTakingModel, StockTakingSearch } from '../../Model/StockTaking/stock-taking.model';
import { DateModelInventory } from '../../Model/CommonModel';

@Injectable({
  providedIn: 'root'
})
export class StockTakingService {
  FormName = 'STOCK_TAKING';
  public mainList:StockTakingModel[]=[];  
  public disableGrid = new BehaviorSubject<boolean>(false);  
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public clickedStockTras = new BehaviorSubject<StockTakingModel>(new StockTakingModel()) ;
  public loadListStockTaking = new BehaviorSubject<StockTakingModel[]>([]); 
    
  constructor(private httpClient:HttpClient, public endpointService: StockTakingEndpointService,private alertService:AlertService) { }
 
  async getStockTakingList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<StockTakingModel[]>(this.endpointService.GetStockTakingList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadListStockTaking.next(res);
        this.clickedStockTras.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getExpenseEntryList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getStockTakingDetails(stock_taking_id: any): Promise<any[]> {
    try {
      if (!stock_taking_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetStockTakingDetails +'/'+stock_taking_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetStockTakingDetails : ', error);
      const message = 'Something went wrong while Fetching Stock Taking Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  async getStockTakingDetailLoad(stock_taking_id: any,year:any): Promise<any[]> {
    try {
      if (!stock_taking_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetStockTakingDetailLoad +'/'+stock_taking_id+'/'+year)
      );
      return res;
    } catch (error: any) {
      console.error('getStockTakingDetailLoad : ', error);
      const message = 'Something went wrong while Fetching Stock Taking Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  saveStockTaking(stockTakingHeader: StockTakingHeader, stockTakingDetail: any[],dateModel:DateModelInventory) {
    const payload = {
      stockTakingHeader: stockTakingHeader,
      stockTakingDetail: stockTakingDetail,
      dateModel : dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveStockTaking, payload)
  }

  async checkWarehouse(godown_code:any): Promise<any> {
    try{
      const ranNo = await this.httpClient.get<any>(this.endpointService.CheckWarehouse+'/'+ godown_code).toPromise();
      return ranNo;
    }catch (error) {
      console.error('checkWarehouse : ', error);
      let message='Warehouse Detail is already Entered. Please try to Modify.';
      this.alertService.triggerAlert(message,6000, 'error');
      return true;
    }
  }

  deleteStockTaking(stock_taking_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteStockTaking + '/' + stock_taking_id + '/' + sessionStorage.getItem('year')
    );
  }

  async SearchList(searchList: StockTakingSearch): Promise<void> {
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
    this.loadListStockTaking.next(res);
    this.clickedStockTras.next(res[0]);
  }
}

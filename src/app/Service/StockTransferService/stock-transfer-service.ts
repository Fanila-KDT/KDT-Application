import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { StockTransferEndpointService } from './stock-transfer-end-point.service';
import { StockTransferDetailModel, StockTransferModel, StockTransferSearch } from '../../Model/StockTransfer/stock-transfer.model';
import { DateModelInventory, FinancialDataHeader } from '../../Model/CommonModel';

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {
  FormName = 'STOCK_TRANSFER';
  public mainList:StockTransferModel[]=[];  
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
  public clickedStockTras = new BehaviorSubject<StockTransferModel>(new StockTransferModel()) ;
  public loadListStockTransfer = new BehaviorSubject<StockTransferModel[]>([]); 
  public ItemList : any[] = [];
  item:any;
    
  constructor(private httpClient:HttpClient, public endpointService: StockTransferEndpointService,private alertService:AlertService) { }

  async getStockTransferList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<StockTransferModel[]>(this.endpointService.GetStockTransferList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadListStockTransfer.next(res);
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

  async getGodownList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetGodownList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetGodownList : ', error);
      const message = 'Something went wrong while Fetching Vendor List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getStockTransferDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetStockTransferDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetStockTransferDetails : ', error);
      const message = 'Something went wrong while Fetching Stock Transfer Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  saveStockTransfer(stockTransferModel: FinancialDataHeader, stockTransGridModel: any[],transfer_godown_code:any,dateModel:DateModelInventory){
    const payload = {
      stockTransferModel: stockTransferModel,
      stockTransGridModel: stockTransGridModel,
      transfer_godown_code: transfer_godown_code,
      dateModel: dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveStockTransfer, payload)
  }

  deleteStockTransfer(voucher_id: string,gridModel:any ): Observable<any[]> {
    const payload = {
      voucher_id : voucher_id,
      year : sessionStorage.getItem('year'),
      gridModel: gridModel
    };
    
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteStockTransfer, { body: payload } 
    );
  }

  async SearchList(searchList: StockTransferSearch): Promise<void> {
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
    this.loadListStockTransfer.next(res);
    this.clickedStockTras.next(res[0]);
  }
}

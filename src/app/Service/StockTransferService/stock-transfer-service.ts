import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { StockTransferEndpointService } from './stock-transfer-end-point.service';
import { StockTransferDetailModel, StockTransferModel, StockTransferSearch } from '../../Model/StockTransfer/stock-transfer.model';
import { FinancialDataHeader } from '../../Model/CommonModel';

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
  public newDisable = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public clickedStockTras = new BehaviorSubject<StockTransferModel>(new StockTransferModel()) ;
  public loadListStockTransfer = new BehaviorSubject<StockTransferModel[]>([]); 
  public assignStockTransDetails = new BehaviorSubject<StockTransferDetailModel>(new StockTransferDetailModel()) ;
  public ItemList : any[] = [];
    
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

  async getStockTransferDetails(voucher_id:any){
    try{
      if(voucher_id == null || voucher_id == undefined){
        return;
      }
      await this.httpClient.get<any>(this.endpointService.GetStockTransferDetails +'/'+voucher_id).subscribe({
      next: res => {
        this.assignStockTransDetails.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('getStockTransferDetails : ', error);
      let message='Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  saveStockTransfer(stockTransferModel: FinancialDataHeader, stockTransGridModel: any[],transfer_godown_code:any) {
    const payload = {
      stockTransferModel: stockTransferModel,
      stockTransGridModel: stockTransGridModel,
      transfer_godown_code: transfer_godown_code
    };
    return this.httpClient.post<any>(this.endpointService.SaveStockTransfer, payload)
  }

  deleteStockTransfer(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteStockTransfer + '/' + voucher_id + '/' + sessionStorage.getItem('year')
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

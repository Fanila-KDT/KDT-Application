import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { DateModelInventory, FinancialDataHeader } from '../../Model/CommonModel';
import { ItemReorderDetails, ItemReorderRequest, ItemReorderRequestModel, ItemReorderRequestSearch } from '../../Model/ItemReorderRequest/item-reorder-request.model';
import { ItemReorderRequestEndpointService } from './item-reorder-request-end-point.service';

@Injectable({
  providedIn: 'root'
})
export class ItemReorderRequestService {
  FormName = 'ITEM_REORDER';
  public mainList:ItemReorderRequestModel[]=[];  
  public disableGrid = new BehaviorSubject<boolean>(false);  
  public selected = new BehaviorSubject<any[]>([]);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public clickedReorderItem = new BehaviorSubject<ItemReorderRequestModel>(new ItemReorderRequestModel()) ;
  public loadListItemReorderRequest = new BehaviorSubject<ItemReorderRequestModel[]>([]); 
  public assignReorderItemDetails = new BehaviorSubject<ItemReorderDetails>(new ItemReorderDetails()) ;
  
  //public assignReorderItemDetails = new BehaviorSubject<ItemReorderRequestDetailModel>(new ItemReorderRequestDetailModel()) ;
  
    
  constructor(private httpClient:HttpClient, public endpointService: ItemReorderRequestEndpointService,private alertService:AlertService) { }

  async getItemReorderRequestList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<ItemReorderRequestModel[]>(this.endpointService.GetItemReorderRequestList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadListItemReorderRequest.next(res);
        this.clickedReorderItem.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getExpenseEntryList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetBrandList(): Promise<any[]> {
    let message='Something went wrong while Getting Brand List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetBrandList)
      );
    }catch (error) {
      console.error('GetBrandList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async getLoadItemDetails(data:any){
    try{
      if(data.VoucherID == null || data.VoucherID == undefined){
        return;
      }
      let params = new HttpParams();
      params = params.set('VoucherID', data.VoucherID);
      params = params.set('ProductDept', data.ProductDept);
      params = params.set('ProductType', data.ProductType);
      params = params.set('DateTo', new Date(data.DateTo).toISOString());
      params = params.set('BrandID', data.BrandID);

      await this.httpClient.get<any>(this.endpointService.GetLoadItemDetails,{params}).subscribe({
      next: res => {
        this.assignReorderItemDetails.next(res);
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

  async getItemReorderDetails(voucher_id:any){
    try{
      if(voucher_id == null || voucher_id == undefined){
        return;
      }
      await this.httpClient.get<any>(this.endpointService.GetItemReorderDetails +'/'+voucher_id).subscribe({
      next: res => {
        this.assignReorderItemDetails.next(res);
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

  checkRequestStatus(data:any):Promise<any>{
    try{
      let params = new HttpParams();
      params = params.set('VoucherID', data.VoucherID);
      params = params.set('ProductDept', data.ProductDept);
      params = params.set('ProductType', data.ProductType);
      params = params.set('DateTo', new Date(data.DateTo).toISOString());
      params = params.set('BrandID', data.BrandID);
      return firstValueFrom(this.httpClient.get<any>(this.endpointService.CheckRequestStatus,{params}));
    }catch (error) {
      console.error('checkRequestStatus : ', error);
      let message='Something went wrong while Checking Request Status. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  
  saveItemReorderReqModel(headerModel: ItemReorderRequest, gridModel: any[],dateModel: DateModelInventory) {
    const payload = {
      headerModel: headerModel,
      gridModel: gridModel,
      dateModel: dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveItemReorderRequest, payload)
  }

  deleteItemReorderRequest(voucher_id: string): Observable<any[]> {
    try{
      return this.httpClient.delete<any[]>(
        this.endpointService.DeleteItemReorderRequest + '/' + voucher_id + '/' + sessionStorage.getItem('year')
      );
    } catch (error) {
        console.error('deleteItemReorderRequest : ', error);
        const message = 'Something went wrong while Deleting Item Reorder Request. Please try again.';  
        this.alertService.triggerAlert(message, 4000, 'error');
        throw error; // Return empty observable on error
    }
  }

  async SearchList(searchList: ItemReorderRequestSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.status != null) {
      params = params.set('approval_status', searchList.status);
    }
    if (searchList.document_number != null) {
      params = params.set('document_number', searchList.document_number);
    }
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    );
    this.mainList = res;
    this.loadListItemReorderRequest.next(res);
    this.clickedReorderItem.next(res[0]);
  }
}

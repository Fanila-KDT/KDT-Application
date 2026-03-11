import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import { PurchaseOrderEndpointService } from './purchase-order.end-point.service';
import { ItemDetailsModel, PurchaseOrderModalSearch, PurchaseOrderModel } from '../../Model/PurchaseOrder/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  public mainList:PurchaseOrderModel[]=[];  
  public loadList = new BehaviorSubject<PurchaseOrderModel[]>([]);

  public clickedPO = new BehaviorSubject<PurchaseOrderModel>(new PurchaseOrderModel()) ;  
  public addRowAfterSave = new BehaviorSubject<PurchaseOrderModel>(new PurchaseOrderModel()) ;
  public addRowAfterModify = new BehaviorSubject<PurchaseOrderModel>(new PurchaseOrderModel()) ;
  public assignItemDetails = new BehaviorSubject<ItemDetailsModel>(new ItemDetailsModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public registerList = new BehaviorSubject<any>(null);
  public vendorList = new BehaviorSubject<any>(null);

  FormName = 'PURCHASE_ORDER';
  selectedDocNo :any;

  constructor(private httpClient:HttpClient, public endpointService: PurchaseOrderEndpointService,private alertService:AlertService) { }

  async getPurchaseOrderList(year:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<PurchaseOrderModel[]>(this.endpointService.getList +'/'+ year)
      );
      this.mainList = res;
      this.loadList.next(res);
      this.clickedPO.next(res[0]);

      return res; // ✅ Return the response
    } catch (error) {
      console.error('getPurchaseOrderList : ', error);
      const message = 'Something went wrong while fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getRegisterList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetRegisterList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetRegisterList : ', error);
      const message = 'Something went wrong while Fetching List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getVendorList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetVendorList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetVendorList : ', error);
      const message = 'Something went wrong while Fetching List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getPaymentList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetPaymentList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetPaymentList : ', error);
      const message = 'Something went wrong while Fetching List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getItemList(): Promise<any[]>{
    let message='Something went wrong while Getting Item List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetItemList)
      );
    }catch (error) {
      console.error('GetItemList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }
  
  async getItemDetails(voucher_id: any) {
    if (!voucher_id) {
      return;
    }

    try {
      const res = await firstValueFrom(
        this.httpClient.get<any>(`${this.endpointService.GetItemDetails}/${voucher_id}`)
      );
      this.assignItemDetails.next(res);
    } catch (err: any) {
      console.error('GetItemDetails : ', err);
      const message = err?.error?.text || 'Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
    }
  }


  async itemCodeEnter(item_no: any): Promise<any[]> {
    try {
      return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.ItemCodeEnter + '/' + item_no)
      );
    } catch (error) {
      console.error('ItemCodeEnter : ', error);
      this.alertService.triggerAlert('Something went wrong. Please try again.', 4000, 'error');
      return []; // return empty array on error
    }
  }

  async modelNameChange(item_details: any): Promise<any[]> {
    try {
      return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.ModelNameChange + '/' + item_details)
      );
    } catch (error) {
      console.error('ModelNameChange : ', error);
      return []; // return empty array on error
    }
  }

  savePurchaseOrder(purchaseOrderModel: PurchaseOrderModel, ItemList: any[],temp:any) {
    const payload = {
      POSave: purchaseOrderModel,
      ItemList: ItemList,
      PO : temp
    };
    return this.httpClient.post<any>(this.endpointService.SavePurchaseOrder, payload)
  }
      
  deletePurchaseOrder(voucher_id: string, items: any,itemList:any): Observable<any[]> {
    const payload = {
      Items: items,
      ItemList: itemList
    }; 
    
    return this.httpClient.delete<PurchaseOrderModel[]>(
      this.endpointService.DeletePurchaseOrder + '/' + voucher_id,
      { body: payload }   // ✅ wrap items inside body
    );
  }

  async SearchList(searchList: PurchaseOrderModalSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.register_code != null) {
      params = params.set('register_code', searchList.register_code.toString());
    }
    if (searchList.account_code) {
      params = params.set('account_code', searchList.account_code);
    }
    if (searchList.document_number?.trim()) {
      params = params.set('document_number', searchList.document_number.trim());
    }
    if (searchList.approval_status?.trim()) {
      params = params.set('approval_status', searchList.approval_status.trim());
    }

    const res = await firstValueFrom(
      this.httpClient.get<PurchaseOrderModel[]>(this.endpointService.GetSearchList, { params })
    );
    this.mainList = res;
    this.loadList.next(res);
    this.clickedPO.next(res[0]);
  }

}

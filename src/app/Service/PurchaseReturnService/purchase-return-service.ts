import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { PurchaseReturnEndpointService } from './purchase-return-end-point.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { GRNHeaderModel,  GRNDetailsModel, ItemDetailsModel, PurchaseReturnModel,GRNModelModalSearch } from '../../Model/PurchaseReturn/purchase-return.model';
import { DateModelInventory } from '../../Model/CommonModel';

@Injectable({
  providedIn: 'root'
})
export class PurchaseReturnService {
  FormName = 'PURCHASE_RETURNS';
  item:any;
  selectedGRN:any;
  public mainList:PurchaseReturnModel[]=[];  
  public loadListGRN = new BehaviorSubject<PurchaseReturnModel[]>([]);
  public assignItemDetails = new BehaviorSubject<ItemDetailsModel>(new ItemDetailsModel()) ;
  public addRowAfterSave = new BehaviorSubject<PurchaseReturnModel>(new PurchaseReturnModel()) ;
  public addRowAfterModify = new BehaviorSubject<PurchaseReturnModel>(new PurchaseReturnModel()) ;
  public grnNoList = new BehaviorSubject<any[]>([]) ;
  public clickedGRN = new BehaviorSubject<PurchaseReturnModel>(new PurchaseReturnModel()) ;
  
  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public SVDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public approvalStatus = new BehaviorSubject<any>(null);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public registerList = new BehaviorSubject<any>(null);
  public ItemList : any[] = [];

  constructor(private httpClient:HttpClient, public endpointService: PurchaseReturnEndpointService,private alertService:AlertService) { }

  async getPurchaseReturnList(year: any) {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<PurchaseReturnModel[]>(this.endpointService.GetPurchaseReturnList + '/' + year)
      );
      this.mainList = res;
      this.loadListGRN.next(res);
      if (res && res.length > 0) {
        this.approvalStatus.next(res[0].approval_status)

      } else {
        // Handle empty case
        this.approvalStatus.next(null);  // or default value

      }
      this.clickedGRN.next(res[0]);
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getRegisterList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetRegisterList + '/' + companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetRegisterList : ', error);
      const message = 'Something went wrong while Fetching Register List. Please try again.';
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
      const message = 'Something went wrong while Fetching Vendor List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getWarehouseList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetWarehouseList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetWarehouseList : ', error);
      const message = 'Something went wrong while Fetching Warehouse List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getFullWarehouseList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetFullWarehouseList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetFullWarehouseList : ', error);
      const message = 'Something went wrong while Fetching Full Warehouse List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getItemDetails(voucher_id:any){
    try{
      if(voucher_id == null || voucher_id == undefined){
        return;
      }
      await this.httpClient.get<any>(this.endpointService.GetItemDetails +'/'+voucher_id).subscribe({
      next: res => {
        this.assignItemDetails.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('GetItemDetails : ', error);
      let message='Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async getGRNNoList(companycode: number, statusFalg :number,year:any): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetGRNNoList +'/'+ companycode + '/' + statusFalg )
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetPoNoList : ', error);
      const message = 'Something went wrong while Fetching Po No List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  savePurchaseReturn(grnheaderModel: GRNHeaderModel, grnGridModel: any[],grnDetailsModel:GRNDetailsModel,dateModel:DateModelInventory) {
    const payload = {
      grnheaderModel: grnheaderModel,
      grnGridModel: grnGridModel,
      grnDetailsModel : grnDetailsModel,
      dateModel : dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SavePurchaseReturn, payload)
  }

  deletePurchaseReturn(voucher_id: string,year:any, header: any,GRNGrid:any ): Observable<any[]> {
    const payload = {
      header: header,
      GRNGrid: GRNGrid
    };
    
    return this.httpClient.delete<any[]>(
      this.endpointService.DeletePurchaseReturn + '/' + voucher_id + '/' +year, { body: payload } 
    );
  }

  async SearchList(searchList: GRNModelModalSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.register_code != null) {
      params = params.set('register_code', searchList.register_code);
    }
    if (searchList.document_number != null) {
      params = params.set('document_number', searchList.document_number);
    }
    if (searchList.counter_vid != null) {
      params = params.set('ref_grn_id', searchList.counter_vid);
    }

    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    );
    this.mainList = res;
    this.loadListGRN.next(res);
    this.clickedGRN.next(res[0]);
  }

  // async sendForStockVerification(selectedGRN:any): Promise<void> {
  //   try {
  //     await firstValueFrom(
  //       this.httpClient.get<any>(this.endpointService.SendForStockVerification + '/' + selectedGRN)
  //     );
  //   } catch (error) {
  //     console.error('sendForStockVerification : ', error);
  //     const message = 'Something went wrong while Sending for Stock Verification. Please try again.';
  //     this.alertService.triggerAlert(message, 4000, 'error');
  //     throw error;
  //   }
  // }
}

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { RecieptEntryEndpointService } from './reciept-entry-end-point.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { GRNHeaderModel, GRNModel, GRNDetailsModel, ItemDetailsModel, RecieptEntryModel, GRNModelModalSearch } from '../../Model/RecieptEnry/reciept-enry.model';
import { DateModelInventory } from '../../Model/CommonModel';

@Injectable({
  providedIn: 'root'
})
export class RecieptEntryService {
  FormName = 'GOODS_RECEIPT_NOTE';
  selectedGRN:any;
  item:any;
  public mainList:GRNModel[]=[];  
  public loadListGRN = new BehaviorSubject<GRNModel[]>([]);
  public assignItemDetails = new BehaviorSubject<ItemDetailsModel>(new ItemDetailsModel()) ;
  public addRowAfterSave = new BehaviorSubject<RecieptEntryModel>(new RecieptEntryModel()) ;
  public addRowAfterModify = new BehaviorSubject<RecieptEntryModel>(new RecieptEntryModel()) ;
  public refNoList = new BehaviorSubject<any[]>([]) ;
  public clickedGRN = new BehaviorSubject<GRNModel>(new GRNModel()) ;
  
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

  constructor(private httpClient:HttpClient, public endpointService: RecieptEntryEndpointService,private alertService:AlertService) { }

  async getPendingPOList(register_code: any) {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<RecieptEntryModel[]>(this.endpointService.getList + '/' + register_code)
      );
      //this.clickedReciept.next(res[0]);
      return res;
    } catch (error) {
      console.error('getPendingPOList : ', error);
      this.alertService.triggerAlert(
        'Something went wrong while Fetching Main Grid Items. Please try again.',
        4000,
        'error'
      );
      return [];
    }
  }

  async getGoodsRecieptList(year:any,status:any){
    try {

      const res = await firstValueFrom(
        this.httpClient.get<GRNModel[]>(this.endpointService.GetGoodsRecieptList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadListGRN.next(res);
        this.approvalStatus.next(res[0].approval_status);
        this.clickedGRN.next(res[0]);
      }
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
        this.httpClient.get<any[]>(this.endpointService.GetRegisterList +'/'+ companycode)
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

  async getItemDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetItemDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetItemDetails : ', error);
      const message = 'Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  async getRefNoList(register_code:any,companycode:any,year:any): Promise<any[]>{
    let message='Something went wrong while Getting Ref No List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetRefNoList + '/' + companycode + '/' + year+ '/' + register_code )
      );
    }catch (error) {
      console.error('GetRefNoList : ', error);
      //this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }   
  }

  async getRefNoListFull(companycode:any,year:any): Promise<any[]>{
    //let message='Something went wrong while Getting Ref No List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetRefNoListFull + '/' + companycode + '/' + year)
      );
    }catch (error) {
      console.error('getRefNoListFull : ', error);
      //this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }   
  }

  async getPoNoList(companycode: number, statusFalg :number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetPoNoList +'/'+ companycode + '/' + statusFalg)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetPoNoList : ', error);
      const message = 'Something went wrong while Fetching Po No List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getPoNoDetails(po_no:any): Promise<any> {
    try {
      const res = await firstValueFrom( 
        this.httpClient.get<any>(this.endpointService.GetPoNoDetails +'/'+ po_no)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetPoNoDetails : ', error);
      const message = 'Something went wrong while Fetching Details. Please try again.';
      //this.alertService.triggerAlert(message, 4000, 'error');
      return null; // Return null on error
    } 
  }

  saveGoodsRecieptNote(grnheaderModel: GRNHeaderModel, grnGridModel: any[],grnDetailsModel:GRNDetailsModel,dateModel:DateModelInventory) {
    const payload = {
      grnheaderModel: grnheaderModel,
      grnGridModel: grnGridModel,
      grnDetailsModel : grnDetailsModel,
      dateModel : dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveGoodsRecieptNote, payload)
  }

  deleteGRN(voucher_id: string,year:any, header: any,GRNGrid:any ): Observable<any[]> {
    const payload = {
      header: header,
      GRNGrid: GRNGrid
    };
    
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteGRN + '/' + voucher_id + '/' +year, { body: payload } 
    );
  }

  async SearchList(searchList: GRNModelModalSearch): Promise<void> {
    let params = new HttpParams();
    
    params = params.set('year', sessionStorage.getItem('year')|| 0)

    if (searchList.register_code != null) {
      params = params.set('register_code', searchList.register_code);
    }
    if (searchList.document_number != null) {
      params = params.set('document_number', searchList.document_number);
    }
    if (searchList.ref_grn_id != null) {
      params = params.set('ref_grn_id', searchList.ref_grn_id);
    }

    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    );
    this.mainList = res;
    this.loadListGRN.next(res);
    this.clickedGRN.next(res[0]);
  }

  async sendForStockVerification(selectedGRN:any): Promise<void> {
    try {
      await firstValueFrom(
        this.httpClient.get<any>(this.endpointService.SendForStockVerification + '/' + selectedGRN)
      );
    } catch (error) {
      console.error('sendForStockVerification : ', error);
      const message = 'Something went wrong while Sending for Stock Verification. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      throw error;
    }
  }
}

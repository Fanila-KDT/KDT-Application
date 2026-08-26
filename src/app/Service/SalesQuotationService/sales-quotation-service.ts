import { Injectable } from "@angular/core";
import { SalesQuotationModel, SalesQuotationSave, SalesQuotationSearch } from "../../Model/SalesQuotation/sales-quotation.model";
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlertService } from "../../shared/alert/alert.service";
import { DateModelSales } from "../../Model/CommonModel";
import { SalesQuotationEndpointService } from "./sales-quotation.end-point.service";

@Injectable({
  providedIn: 'root'
})
export class SalesQuotationService {
  public mainList:SalesQuotationModel[]=[];  
  public loadList = new BehaviorSubject<SalesQuotationModel[]>([]);

  public clickedSalesQuotation = new BehaviorSubject<SalesQuotationModel>(new SalesQuotationModel()) ;  

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public changeStatus = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public Status = new BehaviorSubject<[string, string]>(['', '']);
  FormName='SALES_QUOTATION';
  PaymentTypeList: any[] =[];
  Approved:any;
  voucher_id:any;
  approval_status:any;
  
  constructor(private httpClient:HttpClient, private endpointService: SalesQuotationEndpointService,private alertService:AlertService) { }
  
  async getSalesQuotationList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<SalesQuotationModel[]>(this.endpointService.GetSalesQuotationList + '/' + year )
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedSalesQuotation.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getSalesQuotationList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetSalesQuotationDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetSalesQuotationDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetSalesQuotationDetails : ', error);
      const message = 'Something went wrong while Fetching Sales Quotation Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  SaveSalesQuotation(salesQuotation : SalesQuotationSave, salesQuotationDetail :any,dateModel :DateModelSales  ) {
      const payload = {
      salesQuotation: salesQuotation,
      salesQuotationDetail: salesQuotationDetail,
      dateModel:dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveSalesQuotation, payload)
  }

  DeleteSalesQuotation(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteSalesQuotation + '/' + voucher_id + '/' + localStorage.getItem('user_id')
    );
  }

  async SearchList(searchList: SalesQuotationSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.payterm_id != null) {
      params = params.set('payterm_id', searchList.payterm_id);
    }
    if (searchList.new != null) {
      params = params.set('newsale', searchList.new);
    }
    if (searchList.warranty != null) {
      params = params.set('warranty', searchList.warranty);
    }
    if (searchList.delivery != null) {
      params = params.set('delivery', searchList.delivery);
    }

    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList + '/' + sessionStorage.getItem('year'), { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedSalesQuotation.next(res[0]);
  }

  async GetPaymentTypeList(status : any): Promise<any[]> {
    let message='Something went wrong while Getting Customer List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetPaymentTypeList + '/' + status)
      );
    }catch (error) {
      console.error('GetPaymentTypeList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async SendForStatusChange(voucher_id:any,reason:any,status:any): Promise<void> {
    try {
      await firstValueFrom(
        this.httpClient.get<any>(this.endpointService.SendForStatusChange + '/' + voucher_id + '/' + reason + '/' + status)
      );
    } catch (error) {
      console.error('SendForStatusChange : ', error);
      const message = 'Something went wrong while Sending for SChange Status. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      throw error;
    }
  }

}

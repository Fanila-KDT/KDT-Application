import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlertService } from "../../shared/alert/alert.service";
import { SalesInvoiceModel, SalesInvoiceSave } from "../../Model/SalesInvoice/sales-invoice.model";
import { SalesInvoiceEndpointService } from "./sales-invoice.end-point.service";

@Injectable({
  providedIn: 'root'
})
export class SalesInvoiceService {
  public mainList:SalesInvoiceModel[]=[];  
  public loadList = new BehaviorSubject<SalesInvoiceModel[]>([]);

  public clickedSalesInvoice = new BehaviorSubject<SalesInvoiceModel>(new SalesInvoiceModel()) ;  

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
  FormName='SALES_LEAD';
  PaymentTypeList: any[] =[];
  Approved:any;
  voucher_id:any;
  approval_status:any;
  
  constructor(private httpClient:HttpClient, private endpointService: SalesInvoiceEndpointService,private alertService:AlertService) { }
  
  async getSalesInvoiceList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<SalesInvoiceModel[]>(this.endpointService.GetSalesInvoiceList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedSalesInvoice.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getSalesInvoiceList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetSalesInvoiceDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetSalesInvoiceDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetSalesQuotationDetails : ', error);
      const message = 'Something went wrong while Fetching Sales Invoice Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  async GetDriverList(status:number): Promise<any[]> {
    let message='Something went wrong while Getting Driver List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetDriverList + '/' + status)
      );
    }catch (error) {
      console.error('GetDriverList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  SaveSalesInvoice(salesInvoiceModel: SalesInvoiceSave ) {
    return this.httpClient.post<any>(this.endpointService.SaveSalesInvoice, salesInvoiceModel)
  }

  DeleteSalesInvoice(id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteSalesInvoice + '/' + id
    );
  }
}

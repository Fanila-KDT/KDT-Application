import { Injectable } from "@angular/core";
import { SalesOrderModel, SalesOrderSave, SalesOrderSearch } from "../../Model/SalesOrder/sales-order.model";
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlertService } from "../../shared/alert/alert.service";
import { DateModelSales } from "../../Model/CommonModel";
import { SalesOrderEndpointService } from "./sales-order.end-point.service";

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  public mainList:SalesOrderModel[]=[];  
  public loadList = new BehaviorSubject<SalesOrderModel[]>([]);

  public clickedSalesOrder = new BehaviorSubject<SalesOrderModel>(new SalesOrderModel()) ;  

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  FormName='SALES_ORDER';
  PaymentTypeList: any[] =[];
  Approved:any;
  voucher_id:any;
  approval_status:any;
  
  constructor(private httpClient:HttpClient, private endpointService: SalesOrderEndpointService,private alertService:AlertService) { }
  
  async getSalesOrderList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<SalesOrderModel[]>(this.endpointService.GetSalesOrderList + '/' + year )
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedSalesOrder.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getSalesOrderList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetSalesOrderDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetSalesOrderDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetSalesOrderDetails : ', error);
      const message = 'Something went wrong while Fetching Sales Order Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  async GetAccFromItemCodes(item_no: any): Promise<any[]> {
    try {
      if (!item_no) {
        return []; // Return empty array if item_no is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetAccFromItemCodes +'/'+ item_no )
      );
      return res;
    } catch (error: any) {
      console.error('GetAccFromItemCodes : ', error);
      const message = 'Something went wrong while Fetching Accessory Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  SaveSalesOrder(salesOrder : any, salesOrderDetail :any,salesOrderAccessories:any,salesOrderPayTerm:any,salesOrderTradeModel:any,dateModel :DateModelSales  ) {
      const payload = {
      salesOrder: salesOrder,
      salesOrderDetail: salesOrderDetail,
      salesOrderAccessories: salesOrderAccessories,
      salesOrderPayTerm: salesOrderPayTerm,
      salesOrderTradeModel: salesOrderTradeModel,
      dateModel:dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveSalesOrder, payload)
  }

  DeleteSalesOrder(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteSalesOrder + '/' + voucher_id 
    );
  }

  async SearchList(searchList: SalesOrderSearch): Promise<void> {
    let params = new HttpParams();

    // if (searchList.payterm_id != null) {
    //   params = params.set('payterm_id', searchList.payterm_id);
    // }
    // if (searchList.new != null) {
    //   params = params.set('newsale', searchList.new);
    // }
    // if (searchList.warranty != null) {
    //   params = params.set('warranty', searchList.warranty);
    // }
    // if (searchList.delivery != null) {
    //   params = params.set('delivery', searchList.delivery);
    // }

    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList + '/' + sessionStorage.getItem('year'), { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedSalesOrder.next(res[0]);
  }

  
  async GetOrderTypeList(): Promise<any[]> {
    let message='Something went wrong while Getting Order Type List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetOrderTypeList)
      );
    }catch (error) {
      console.error('GetOrderTypeList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

}

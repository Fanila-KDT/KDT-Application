import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { CustomerMasterEndpointService } from './customer-master.end-point.service';
import { CustomerMasterModel, CustomerMasterSave, CustomerMasterSearch } from '../../Model/CustomerMaster/customer-master.model';
import { Attachment } from '../../Model/ReportModel/report-model.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerMasterService {
  public mainList:CustomerMasterModel[]=[];  
  public loadList = new BehaviorSubject<CustomerMasterModel[]>([]);

  public clickedCustomer = new BehaviorSubject<CustomerMasterModel>(new CustomerMasterModel()) ;  

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
  MarketList:any[]=[];
  CollectorList:any[]=[];
  FormName='CUSTOMER_MASTER';
  
  constructor(private httpClient:HttpClient, private endpointService: CustomerMasterEndpointService,private alertService:AlertService) { }
  
  async getCustomerMasterList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<CustomerMasterModel[]>(this.endpointService.GetCustomerMasterList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedCustomer.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getExpenseEntryList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

    async getMarketList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetMarketList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetMarketList : ', error);
      const message = 'Something went wrong while Fetching Market List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getAreaList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetAreaList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetAreaList : ', error);
      const message = 'Something went wrong while Fetching Area List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async GetCollectorList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetCollectorList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetCollectorList : ', error);
      const message = 'Something went wrong while Fetching Collector List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async SaveCustomerMaster(customerMasterSave: CustomerMasterSave): Promise<any> {  
    try {
      const res = await firstValueFrom(
        this.httpClient.post<any>(this.endpointService.SaveCustomerMaster, customerMasterSave)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('SaveCustomerMaster : ', error);
      const message = 'Something went wrong while Saving Customer Master. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return null; // Return null on error
    }   
  }

  deleteCustomerMaster(creditcustomerid: string, accountcode: any): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteCustomerMaster + '/' + creditcustomerid + '/' + accountcode + '/' + localStorage.getItem('user_id')
    );
  }

  async SearchList(searchList: CustomerMasterSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.cardno != null) {
      params = params.set('cardno', searchList.cardno);
    }
    if (searchList.name != null) {
      params = params.set('name', searchList.name);
    }
    if (searchList.market_channel_name != null) {
      params = params.set('market_channel_name', searchList.market_channel_name);
    }
    if (searchList.blacklist != null) {
      params = params.set('blacklist', String(searchList.blacklist));
    }
    if (searchList.major_customer != null) {
      params = params.set('major_customer', String(searchList.major_customer));
    }
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedCustomer.next(res[0]);
  }
}

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { SalesmanMasterModel, SalesmanMasterSave, SalesmanMasterSearch, SalesmanTarget } from '../../Model/SalesmanMaster/salesman-master.model';
import { SalesmanMasterEndpointService } from './salesman-master.end-point.service';

@Injectable({
  providedIn: 'root'
})
export class SalesmanMasterService {
  public mainList:SalesmanMasterModel[]=[];  
  public loadList = new BehaviorSubject<SalesmanMasterModel[]>([]);

  public clickedSalesman = new BehaviorSubject<SalesmanMasterModel>(new SalesmanMasterModel()) ;
  public addRowAfterSave = new BehaviorSubject<SalesmanMasterModel>(new SalesmanMasterModel()) ;
  public addRowAfterModify = new BehaviorSubject<SalesmanMasterModel>(new SalesmanMasterModel()) ;

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
  FormName='SALESMAN_MASTER';
  selectedCurNo: number = 0;
  AreaGropList:any[] = [];

  constructor(private httpClient:HttpClient, private endpointService: SalesmanMasterEndpointService,private alertService:AlertService) { }

    async getSalesmanMasterList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<SalesmanMasterModel[]>(this.endpointService.GetSalesmanMasterList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedSalesman.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getExpenseEntryList : ', error);
      const message = 'Something went wrong while Fetching Salesman Master List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getSalesmanAreaDetails(salesman_id: any): Promise<any[]> {
    try {
      if (!salesman_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetSalesmanAreaDetails +'/'+salesman_id)
      );
      return res;
    } catch (error: any) {
      console.error('getSalesmanAreaDetails : ', error);
      const message = 'Something went wrong while Fetching Salesman Area Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  async getSalesmanCustomerDetails(salesman_id: any): Promise<any[]> {
    try {
      if (!salesman_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetSalesmanCustomerDetails +'/'+salesman_id)
      );
      return res;
    } catch (error: any) {
      console.error('getSalesmanAreaDetails : ', error);
      const message = 'Something went wrong while Fetching Salesman Customer Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  async getEngineerList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetEngineerList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetEngineerList : ', error);
      const message = 'Something went wrong while Fetching Engineer List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async GetAreaGroupList(salesman_id: any): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any>(`${this.endpointService.GetAreaGroupList}/${salesman_id}`)
      );
      return res;
    } catch (error) {
      console.error('GetAreaGroupList error:', error);
      throw error;
    }
  }

  async GetCustomerList(): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any>(`${this.endpointService.GetCustomerList}`)
      );
      return res;
    } catch (error) {
      console.error('GetCustomerList error:', error);
      throw error;
    }
  }

  SaveSalesmanMaster(salesmanMasterSave: SalesmanMasterSave, areaGroupRows: any[],salesmanTarget: SalesmanTarget) {
    const payload = {
      salesmanMasterSave: salesmanMasterSave,
      areaGroupRows: areaGroupRows,
      salesmanTarget:salesmanTarget
    };
    return this.httpClient.post<any>(this.endpointService.SaveSalesmanMaster, payload)
  }

  deleteMajorCutomer(creditcustomerid: string, salesman_id: any): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteMajorCutomer + '/' + creditcustomerid + '/' + salesman_id
    );
  }

  SaveMajorCustomer(majorCustomers: any[],salesCustomers: any[]) {
    const request = {
      majorCustomers: majorCustomers,
      salesCustomers: salesCustomers
    };
    return this.httpClient.post<any>(this.endpointService.SaveMajorCustomer, request)
  }
  
  DeleteSalesman(salesman_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteSalesman + '/' + salesman_id 
    );
  }

  async SearchList(searchList: SalesmanMasterSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.group_id != null) {
      params = params.set('group_id', searchList.group_id);
    }
    if (searchList.area_code != null) {
      params = params.set('area_code', searchList.area_code);
    }
    if (searchList.active != null) {
      params = params.set('active', String(searchList.active));
    }
    if (searchList.cash_invoice != null) {
      params = params.set('cash_invoice', String(searchList.cash_invoice));
    }
    if (searchList.sales_dept != null) {
      params = params.set('sales_dept', String(searchList.sales_dept));
    }
    if (searchList.callcenter_agent != null) {
      params = params.set('callcenter_agent', String(searchList.callcenter_agent));
    }
    if (searchList.manager != null) {
      params = params.set('manager', String(searchList.manager));
    }
    if (searchList.service_dept != null) {
      params = params.set('service_dept', String(searchList.service_dept));
    }
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedSalesman.next(res[0]);
  }
}

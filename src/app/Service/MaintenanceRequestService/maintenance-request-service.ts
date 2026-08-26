import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { DateModelAccounts } from '../../Model/CommonModel';
import { MaintenanceRequestDetail, MaintenanceRequestModel, MaintenanceRequestSave } from '../../Model/MaintenanceRequest/maintenance-request.model';
import { MaintenanceRequestEndpointService } from './maintenance-request.end-point.service';
@Injectable({
  providedIn: 'root'
})
export class MaintenanceRequestService {
  public mainList:MaintenanceRequestModel[]=[];  
  public loadList = new BehaviorSubject<MaintenanceRequestModel[]>([]);

  public clickedRequest = new BehaviorSubject<MaintenanceRequestModel>(new MaintenanceRequestModel()) ;
  public addRowAfterSave = new BehaviorSubject<MaintenanceRequestModel>(new MaintenanceRequestModel()) ;
  public addRowAfterModify = new BehaviorSubject<MaintenanceRequestModel>(new MaintenanceRequestModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');

  selectedVoucherId:string="";
  FormName='MAINTENANCE_REQUISITION';

  constructor(private httpClient:HttpClient, private endpointService: MaintenanceRequestEndpointService,private alertService:AlertService) { }

  async GetMaintenanceRequestList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<MaintenanceRequestModel[]>(this.endpointService.GetMaintenanceRequestList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedRequest.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetMaintenanceRequestDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetMaintenanceRequestDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetSalesQuotationDetails : ', error);
      const message = 'Something went wrong while Fetching Maintenance Request Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  SaveMaintenanceRequest(maintenanceRequest: MaintenanceRequestSave,maintenanceRequestDeatail:any,dateModel: DateModelAccounts){
    const payload = {
      maintenanceRequest: maintenanceRequest,
      maintenanceRequestDeatail:maintenanceRequestDeatail,
      dateModel: dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveMaintenanceRequest, payload)
  }

  DeleteMaintenanceRequest(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteMaintenanceRequest + '/' + voucher_id
    );
  }

  async GetTagItems(status:number): Promise<any[]> {
    let message='Something went wrong while Getting Tag List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetTagItems + '/' + status)
      );
    }catch (error) {
      console.error('GetTagItems : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  
  async CheckTagStatus(tag_id:any): Promise<any> {
    try{
      const ranNo = await this.httpClient.get<any>(this.endpointService.CheckTagStatus+'/'+ tag_id).toPromise();
      return ranNo;
    }catch (error) {
      console.error('CheckTagStatus : ', error);
      let message='Tag Status is Pending...';
      this.alertService.triggerAlert(message,6000, 'error');
      return true;
    }
  }
}

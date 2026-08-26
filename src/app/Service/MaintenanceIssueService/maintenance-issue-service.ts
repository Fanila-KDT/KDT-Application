import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { DateModelAccounts, FinancialDataHeader } from '../../Model/CommonModel';
import { MaintenanceDetail, MaintenanceIssueDetail, MaintenanceIssueModel } from '../../Model/MaintenanceIssue/maintenance-issue.model';
import { MaintenanceIssueEndpointService } from './maintenance-issue.end-point.service';
@Injectable({
  providedIn: 'root'
})
export class MaintenanceIssueService {
  public mainList:MaintenanceIssueModel[]=[];  
  public loadList = new BehaviorSubject<MaintenanceIssueModel[]>([]);

  public clickedIssue = new BehaviorSubject<MaintenanceIssueModel>(new MaintenanceIssueModel()) ;
  public addRowAfterSave = new BehaviorSubject<MaintenanceIssueModel>(new MaintenanceIssueModel()) ;
  public addRowAfterModify = new BehaviorSubject<MaintenanceIssueModel>(new MaintenanceIssueModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public yearDisable = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public OpenIssueItem = new BehaviorSubject<[any, any]>([null, []]);

  selectedVoucherId:string="";
  FormName='ASSET_MAINTENANCE';

  constructor(private httpClient:HttpClient, private endpointService: MaintenanceIssueEndpointService,private alertService:AlertService) { }

  async GetMaintenanceIssueList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<MaintenanceIssueModel[]>(this.endpointService.GetMaintenanceIssueList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedIssue.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetMaintenanceIssueDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetMaintenanceIssueDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetSalesQuotationDetails : ', error);
      const message = 'Something went wrong while Fetching Maintenance Issue Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  SaveMaintenanceIssue(maintenanceIssue: FinancialDataHeader,maintenanceIssueDeatail:any,maintenanceDetails :MaintenanceDetail,dateModel: DateModelAccounts){
    const payload = {
      maintenanceIssue : maintenanceIssue,
      maintenanceIssueDeatail : maintenanceIssueDeatail,
      maintenanceDetails  : maintenanceDetails ,
      dateModel : dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveMaintenanceIssue, payload)
  }

  DeleteMaintenanceIssue(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteMaintenanceIssue + '/' + voucher_id
    );
  }

  ReqNochanges(voucher_id: string): Observable<any[]> {
    const res = this.httpClient.get<any>(this.endpointService.ReqNochanges + '/' + voucher_id);
    return res;
  }

  async GetRequestNos(): Promise<any[]> {
    let message='Something went wrong while Getting Request No List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetRequestNos )
      );
    }catch (error) {
      console.error('GetRequestNos : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }
}

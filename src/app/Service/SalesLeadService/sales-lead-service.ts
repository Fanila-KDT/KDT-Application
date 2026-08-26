import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlertService } from "../../shared/alert/alert.service";
import { DateModelSales } from "../../Model/CommonModel";
import { SalesLeadEndpointService } from "./sales-lead.end-point.service";
import { SalesLeadModel, SalesLeadSave } from "../../Model/SalesLead/sales-lead.model";

@Injectable({
  providedIn: 'root'
})
export class SalesLeadService {
  public mainList:SalesLeadModel[]=[];  
  public loadList = new BehaviorSubject<SalesLeadModel[]>([]);

  public clickedSalesLead = new BehaviorSubject<SalesLeadModel>(new SalesLeadModel()) ;  

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
  
  constructor(private httpClient:HttpClient, private endpointService: SalesLeadEndpointService,private alertService:AlertService) { }
  
  async getSalesLeadList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<SalesLeadModel[]>(this.endpointService.GetSalesLeadList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedSalesLead.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getSalesLeadList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  SaveSalesLead(salesLeadModel: SalesLeadSave ) {
    return this.httpClient.post<any>(this.endpointService.SaveSalesLead, salesLeadModel)
  }

  DeleteSalesLead(id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteSalesLead + '/' + id
    );
  }
}

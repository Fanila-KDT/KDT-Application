import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { EngineerMasterEndpointService } from './engineer-master.end-point.service';
import { EngineerMasterModel, EngineerMasterSave, EngineerMasterSearch } from '../../Model/EngineerMaster/engineer-master.model';
import { Attachment } from '../../Model/ReportModel/report-model.model';
import { SalesmanMasterSave } from '../../Model/SalesmanMaster/salesman-master.model';

@Injectable({
  providedIn: 'root'
})
export class EngineerMasterService {
  public mainList:EngineerMasterModel[]=[];  
  public loadList = new BehaviorSubject<EngineerMasterModel[]>([]);

  public clickedEngineer = new BehaviorSubject<EngineerMasterModel>(new EngineerMasterModel()) ;  

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
  FormName='ENGINEER_MASTER';
  
  constructor(private httpClient:HttpClient, private endpointService: EngineerMasterEndpointService,private alertService:AlertService) { }
  
  async getEngineerMasterList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<EngineerMasterModel[]>(this.endpointService.GetEngineerMasterList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedEngineer.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getEngineerMasterList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  SaveEngineerMaster(engineerMasterSave: EngineerMasterSave,salesmanMasterSave: SalesmanMasterSave ) {
    const payload = {
      engineerMasterSave: engineerMasterSave,
      salesmanMasterSave: salesmanMasterSave
    };
    return this.httpClient.post<any>(this.endpointService.SaveEngineerMaster, payload)
  }

  DeleteEngineer(engineer_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteEngineer + '/' + engineer_id 
    );
  }

  async SearchList(searchList: EngineerMasterSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.inactive != null) {
      params = params.set('inactive', searchList.inactive);
    }
    if (searchList.docuware_active != null) {
      params = params.set('docuware_active', searchList.docuware_active);
    }
    if (searchList.active != null) {
      params = params.set('active', searchList.active);
    }
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedEngineer.next(res[0]);
  }
}

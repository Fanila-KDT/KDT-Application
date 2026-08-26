import { Injectable } from "@angular/core";
import { AreaMasterModel, AreaMasterSearch } from "../../Model/AreaMaster/area-master.model";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlertService } from "../../shared/alert/alert.service";
import { AreaMasterEndpointService } from "./area-master.end-point.service";

@Injectable({
  providedIn: 'root'
})
export class AreaMasterService {
  public mainList:AreaMasterModel[]=[];  
  public loadList = new BehaviorSubject<AreaMasterModel[]>([]);

  public clickedArea = new BehaviorSubject<AreaMasterModel>(new AreaMasterModel()) ;  

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
  FormName='AREA_MASTER';
  AreaList: any[] =[];
  
  constructor(private httpClient:HttpClient, private endpointService: AreaMasterEndpointService,private alertService:AlertService) { }
  
  async getAreaMasterList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<AreaMasterModel[]>(this.endpointService.GetAreaMasterList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedArea.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getAreaMasterList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetAreaGroupList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetAreaGroupList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetAreaList : ', error);
      const message = 'Something went wrong while Fetching Area List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  SaveAreaMaster(areaMasterModel: AreaMasterModel ) {
    return this.httpClient.post<any>(this.endpointService.SaveAreaMaster, areaMasterModel)
  }

  DeleteAreaMaster(payterm_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteAreaMaster + '/' + payterm_id 
    );
  }

  async SearchList(searchList: AreaMasterSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.group_id != null) {
      params = params.set('group_id', searchList.group_id);
    }
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedArea.next(res[0]);
  }
}

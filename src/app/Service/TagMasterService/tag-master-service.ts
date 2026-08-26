import { Injectable } from "@angular/core";
import { TagMasterDetailsSave, TagMasterModel, TagMasterSave, TagMasterSearch } from "../../Model/TagMaster/tag-master.model";
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlertService } from "../../shared/alert/alert.service";
import { TagMasterEndpointService } from "./tag-master.end-point.service";
import { DateModelSales } from "../../Model/CommonModel";

@Injectable({
  providedIn: 'root'
})
export class TagMasterService {
  public mainList:TagMasterModel[]=[];  
  public loadList = new BehaviorSubject<TagMasterModel[]>([]);

  public clickedTag = new BehaviorSubject<TagMasterModel>(new TagMasterModel()) ;  

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
  FormName='TAG_MASTER';
  AreaList: any[] =[];
  
  constructor(private httpClient:HttpClient, private endpointService: TagMasterEndpointService,private alertService:AlertService) { }
  
  async getTagMasterList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<TagMasterModel[]>(this.endpointService.GetTagMasterList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedTag.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getTagMasterList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  SaveTagMaster(tagMasterSave : TagMasterSave, tagMasterDetailsSave :TagMasterDetailsSave,dateModel :DateModelSales  ) {
      const payload = {
      tagMasterSave: tagMasterSave,
      tagMasterDetailsSave: tagMasterDetailsSave,
      dateModel:dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SaveTagMaster, payload)
  }

  DeleteTagMaster(tag_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteTagMaster + '/' + tag_id + '/' + localStorage.getItem('user_id')
    );
  }

  async SearchList(searchList: TagMasterSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.area_id != null) {
      params = params.set('area_id', searchList.area_id);
    }

    if (searchList.inactive != null) {
      params = params.set('inactive', searchList.inactive);
    }
    if (searchList.dead != null) {
      params = params.set('dead', searchList.dead);
    }
    if (searchList.verified != null) {
      params = params.set('verified', searchList.verified);
    }

    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedTag.next(res[0]);
  }

  async GetAreaList(): Promise<any[]> {
    let message='Something went wrong while Getting Area List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetAreaList)
      );
    }catch (error) {
      console.error('GetAreaList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async GetSalesManList(status:number): Promise<any[]> {
    let message='Something went wrong while Getting Salesman List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetSalesManList + '/' + status)
      );
    }catch (error) {
      console.error('GetSalesManList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async GetEngineerList(status:number): Promise<any[]> {
    let message='Something went wrong while Getting Engineer List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetEngineerList + '/' + status)
      );
    }catch (error) {
      console.error('GetEngineerList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async GetBrandAndPT(item_no: any): Promise<any[]> {
    let message='Something went wrong . Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetBrandAndPT + '/' + item_no)
      );
    }catch (error) {
      console.error('GetBrandAndPT : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async GetCustomerList(status : any): Promise<any[]> {
    let message='Something went wrong while Getting Customer List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetCustomerList + '/' + status)
      );
    }catch (error) {
      console.error('GetCustomerList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }
}

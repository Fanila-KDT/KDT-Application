import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { AccountList, PayCodeList, WarehouseDeatailsModel, WarehouseMasterModalSearch, WarehouseMasterModel, WarehouseMasterModelSave } from '../../Model/WarehouseMaster/warehouse-master.model';
import { WarehouseMasterEndpointService } from './warehouse-master.end-point.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseMasterService {
  public mainList:WarehouseMasterModel[]=[];  
  public loadList = new BehaviorSubject<WarehouseMasterModel[]>([]);

  public clickedWarehouse = new BehaviorSubject<WarehouseMasterModel>(new WarehouseMasterModel()) ;  
  public assignAccLinkingList = new BehaviorSubject<WarehouseDeatailsModel>(new WarehouseDeatailsModel()) ;
  public addRowAfterSave = new BehaviorSubject<WarehouseMasterModel>(new WarehouseMasterModel()) ;
  public addRowAfterModify = new BehaviorSubject<WarehouseMasterModel>(new WarehouseMasterModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  
  FormName='WAREHOUSE_MASTER';
  selectedWerNo: number = 0;
  selectedWerName:string = "";

  constructor(private httpClient:HttpClient, private endpointService: WarehouseMasterEndpointService,private alertService:AlertService) { }

  async getWarehouseMasterList(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<WarehouseMasterModel[]>(this.endpointService.getList)
      );
      this.mainList = res;
      this.loadList.next(res);
      this.clickedWarehouse.next(res[0]);

      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetProfitList(): Promise<WarehouseMasterModel[]> { 
    try {
      const res = await firstValueFrom(
        this.httpClient.get<WarehouseMasterModel[]>(this.endpointService.getProfitList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetProfitList : ', error);
      const message = 'Something went wrong while fetching Profit Center items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetAccountList(accType:string): Promise<any[]> { 
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetAccountList + '/' + accType)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetAccountList : ', error);
      const message = 'Something went wrong while fetching DropDown items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }


  SavewarehouseMaster(warehouseMasterSave: WarehouseMasterModelSave, accountLinking: any[]) {
    const payload = {
      warehouseMasterSave: warehouseMasterSave,
      warehouseMaster : warehouseMasterSave,
      accountLinking:accountLinking
    };
    return this.httpClient.post(`${this.endpointService.SaveWarehouseMaster}`, payload);
  }
  
  deleteWarehouseMaster(godown_code: string): Observable<WarehouseMasterModel[]> {
    return this.httpClient.delete<WarehouseMasterModel[]>(this.endpointService.DeleteWarehouseMaster + '/' + godown_code);
  }

  async SearchList(searchList: WarehouseMasterModalSearch): Promise<void> {
    const params = new HttpParams({ fromObject: { ...searchList } });

    try {
      const res = await firstValueFrom(
        this.httpClient.get<WarehouseMasterModel[]>(await this.endpointService.getSearchList, { params })
      );

      if (Array.isArray(res)) {
        this.mainList = res;
        this.loadList.next(res);
        this.clickedWarehouse.next(res[0]);
      } else {
        console.warn('Unexpected response format:', res);
        this.mainList = [];
      }
    } catch (error) {
      console.error('SearchList error:', error);
      this.alertService.triggerAlert('Something went wrong while fetching search items.', 4000, 'error');
    }
  }

  async wHNameCheck(godown_name:any): Promise<any> {
    try{
      const ranNo = await this.httpClient.get<any>(this.endpointService.wHNameCheck+'/'+ godown_name).toPromise();
      return ranNo;
    }catch (error) {
      console.error('wHNameCheck : ', error);
      let message='Warehouse Name is already present. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

    async getAccLinkingList(cur_no:any){
    try{
      if(cur_no == null || cur_no == undefined){
        return;
      }
      this.httpClient.get<WarehouseDeatailsModel>(this.endpointService.getAccLinkingList +'/'+cur_no).subscribe({
      next: res => {
        this.assignAccLinkingList.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('getAccLinkingList : ', error);
      let message='Something went wrong while Fetching Account Linking List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }
 
}

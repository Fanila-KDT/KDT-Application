import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { SupplierMasterEndpointService } from './supplier-master.end-point.service';
import { SupplierAddressModel, SupplierMasterModalSearch, SupplierMasterModel, SupplierMasterModelSave } from '../../Model/SupplierMaster/supplier-master.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierMasterService {
  public mainList:SupplierMasterModel[]=[];  
  public loadList = new BehaviorSubject<SupplierMasterModel[]>([]);

  public clickedSupplier = new BehaviorSubject<SupplierMasterModel>(new SupplierMasterModel()) ;
  public addRowAfterSave = new BehaviorSubject<SupplierMasterModel>(new SupplierMasterModel()) ;
  public addRowAfterModify = new BehaviorSubject<SupplierMasterModel>(new SupplierMasterModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  
  selectedSupNo:string="";
  FormName='SUPPLIER_MASTER';
  selectedSupName:string="";

  constructor(private httpClient:HttpClient, private endpointService: SupplierMasterEndpointService,private alertService:AlertService) { }

  async getSupplierMasterList(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<SupplierMasterModel[]>(this.endpointService.getList)
      );
      this.mainList = res;
      this.loadList.next(res);
      this.clickedSupplier.next(res[0]);

      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }
  
  async GetSubListByMainCode(main_group_code: string): Promise<SupplierMasterModel[]> {
    try {
      const params = new HttpParams().set('main_group_code', main_group_code);  
      const res = await firstValueFrom(
        this.httpClient.get<SupplierMasterModel[]>(this.endpointService.getSubListByMainCode, { params })
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetSubListByMainCode : ', error);
      const message = 'Something went wrong while Fetching Sub Group List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async GetForeignCurrency(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<SupplierMasterModel[]>(this.endpointService.GetForeignCurrency)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetForeignCurrency : ', error);
      const message = 'Something went wrong while Fetching Foreign Currency List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async SaveSupplierMaster(supplierMasterModelSave: SupplierMasterModelSave,supplierAddressModel:SupplierAddressModel): Promise<any> {  
    try {
      const payload = {
        Master: supplierMasterModelSave,
        Address: supplierAddressModel
      };
      const res = await firstValueFrom(
        this.httpClient.post<any>(this.endpointService.SaveSupplierMaster, payload)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('SaveSupplierMaster : ', error);
      const message = 'Something went wrong while Saving Supplier. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return null; // Return null on error
    }   
  }

  deleteSupplierMaster(supplier_code: string): Observable<SupplierMasterModel[]> {
    return this.httpClient.delete<SupplierMasterModel[]>(this.endpointService.DeleteSupplierMaster + '/' + supplier_code);
  }

  async SearchList(searchList: SupplierMasterModalSearch): Promise<void> {
    const params = new HttpParams({ fromObject: { ...searchList } });

    try {
      const res = await firstValueFrom(
        this.httpClient.get<SupplierMasterModel[]>(await this.endpointService.getSearchList, { params })
      );

      if (Array.isArray(res)) {
        this.mainList = res;
        this.loadList.next(res);
        this.clickedSupplier.next(res[0]);
      } else {
        console.warn('Unexpected response format:', res);
        this.mainList = [];
      }
    } catch (error) {
      console.error('SearchList error:', error);
      this.alertService.triggerAlert('Something went wrong while fetching search items.', 4000, 'error');
    }
  }

}

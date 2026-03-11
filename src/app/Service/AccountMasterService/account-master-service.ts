import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { AccountMasterEndpointService } from './account-master.end-point.service';
import { AccountMasterModalSearch, AccountMasterModel, AccountMasterModelSave } from '../../Model/AccountMaster/account-master.model';

@Injectable({
  providedIn: 'root'
})
export class AccountMasterService {
  public mainList:AccountMasterModel[]=[];  
  public loadList = new BehaviorSubject<AccountMasterModel[]>([]);

  public clickedAccount = new BehaviorSubject<AccountMasterModel>(new AccountMasterModel()) ;
  public addRowAfterSave = new BehaviorSubject<AccountMasterModel>(new AccountMasterModel()) ;
  public addRowAfterModify = new BehaviorSubject<AccountMasterModel>(new AccountMasterModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');

  selectedAccNo:string="";
  selectedAccName:string="";
  FormName='ACCOUNT_MASTER';

  constructor(private httpClient:HttpClient, private endpointService: AccountMasterEndpointService,private alertService:AlertService) { }

  async getAccountMasterList(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<AccountMasterModel[]>(this.endpointService.getList)
      );
      this.mainList = res;
      this.loadList.next(res);
      this.clickedAccount.next(res[0]);

      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }
  
  async GetAccountMainList(): Promise<AccountMasterModel[]> { 
    try {
      const res = await firstValueFrom(
        this.httpClient.get<AccountMasterModel[]>(this.endpointService.getMainGroupList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetAccountMainList : ', error);
      const message = 'Something went wrong while Fetching Main Group List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetAccountSubList(): Promise<AccountMasterModel[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<AccountMasterModel[]>(this.endpointService.getSubGroupList)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetAccountSubList : ', error);
      const message = 'Something went wrong while Fetching Sub Group List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }
  
  async GetSubListByMainCode(main_group_code: string): Promise<AccountMasterModel[]> {
    try {
      const params = new HttpParams().set('main_group_code', main_group_code);  
      const res = await firstValueFrom(
        this.httpClient.get<AccountMasterModel[]>(this.endpointService.getSubListByMainCode, { params })
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetSubListByMainCode : ', error);
      const message = 'Something went wrong while Fetching Sub Group List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async SaveAccountMaster(accountMasterModelSave: AccountMasterModelSave): Promise<any> {  
    try {
      const res = await firstValueFrom(
        this.httpClient.post<any>(this.endpointService.SaveAccountMaster, accountMasterModelSave)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('SaveAccountMaster : ', error);
      const message = 'Something went wrong while Saving Account. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return null; // Return null on error
    }   
  }

  deleteAccountMaster(account_code: string): Observable<AccountMasterModel[]> {
    return this.httpClient.delete<AccountMasterModel[]>(this.endpointService.DeleteAccountMaster + '/' + account_code);
  }

  async SearchList(searchList: AccountMasterModalSearch): Promise<void> {
    const params = new HttpParams({ fromObject: { ...searchList } });

    try {
      const res = await firstValueFrom(
        this.httpClient.get<AccountMasterModel[]>(await this.endpointService.getSearchList, { params })
      );

      if (Array.isArray(res)) {
        this.mainList = res;
        this.loadList.next(res);
        this.clickedAccount.next(res[0]);
      } else {
        console.warn('Unexpected response format:', res);
        this.mainList = [];
      }
    } catch (error) {
      console.error('SearchList error:', error);
      this.alertService.triggerAlert('Something went wrong while fetching search items.', 4000, 'error');
    }
  }

  async accNameCheck(account_name:any): Promise<any> {
    try{
      const ranNo = await this.httpClient.get<any>(this.endpointService.accNameCheck+'/'+ account_name).toPromise();
      return ranNo;
    }catch (error) {
      console.error('accNameCheck : ', error);
      let message='Account Name is already present. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }
}

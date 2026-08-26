import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { AccountSetupModel } from '../../Model/AccountSetup/account-setup.model';
import { AccountSetupEndpointService } from './account-setup.end-point.service';

@Injectable({
  providedIn: 'root'
})
export class AccountSetupService {
  public mainList:AccountSetupModel[]=[];  
  public loadList = new BehaviorSubject<AccountSetupModel[]>([]);

  public clickedAccount = new BehaviorSubject<AccountSetupModel>(new AccountSetupModel()) ;
  public addRowAfterSave = new BehaviorSubject<AccountSetupModel>(new AccountSetupModel()) ;
  public addRowAfterModify = new BehaviorSubject<AccountSetupModel>(new AccountSetupModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(true);
  public isLoading = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');

  selectedAccNo:string="";
  selectedAccName:string="";
  FormName='ACCOUNT_SETUP';

  constructor(private httpClient:HttpClient, private endpointService: AccountSetupEndpointService,private alertService:AlertService) { }

  async GetAccountSetupList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<AccountSetupModel[]>(this.endpointService.GetAccountSetupList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedAccount.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  SaveAccountSetup(accountSetupModel: AccountSetupModel ) {
    return this.httpClient.post<any>(this.endpointService.SaveAccountSetup, accountSetupModel)
  }

  DeleteAccountSetup(companY_CODE: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeleteAccountSetup + '/' + companY_CODE
    );
  }
}

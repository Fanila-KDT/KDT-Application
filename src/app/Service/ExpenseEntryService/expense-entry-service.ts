import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { AlertService } from '../../shared/alert/alert.service';
import { ExpenseEntryServiceEndpointService } from './expense-entry-end-point.service';
import { ExpenseAccountModel, ExpenseDetailsModel, ExpenseEntryModel, ExpenseEntrySearch, ExpenseHeaderModel } from '../../Model/ExpenseEntry/expense-entry.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseEntryService {
  FormName = 'PURCHASE_EXPENSE';
  public mainList:ExpenseEntryModel[]=[];  
  public loadListExpenseEntry = new BehaviorSubject<ExpenseEntryModel[]>([]); 
  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public clickedEntry = new BehaviorSubject<ExpenseEntryModel>(new ExpenseEntryModel()) ;
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public assignExpenseDetails = new BehaviorSubject<ExpenseDetailsModel>(new ExpenseDetailsModel()) ;
  public assignAccountDetails = new BehaviorSubject<ExpenseAccountModel>(new ExpenseAccountModel()) ;
  

  constructor(private httpClient:HttpClient, public endpointService: ExpenseEntryServiceEndpointService,private alertService:AlertService) { }

  async getExpenseEntryList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<ExpenseEntryModel[]>(this.endpointService.GetExpenseEntryList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadListExpenseEntry.next(res);
        this.clickedEntry.next(res[0]);
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getExpenseEntryList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getExpenseEntryDetails(counter_vid:any){
    try{
      if(counter_vid == null || counter_vid == undefined){
        return;
      }
      await this.httpClient.get<any>(this.endpointService.GetExpenseEntryDetails +'/'+counter_vid).subscribe({
      next: res => {
        this.assignExpenseDetails.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('getExpenseEntryDetails : ', error);
      let message='Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async getExpenseAccountDetails(voucher_id:any){
    try{
      if(voucher_id == null || voucher_id == undefined){
        return;
      }
      await this.httpClient.get<any>(this.endpointService.GetExpenseAccountDetails +'/'+voucher_id).subscribe({
      next: res => {
        this.assignAccountDetails.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('getExpenseAccountDetails : ', error);
      let message='Something went wrong while Fetching Item List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async getAccountList(): Promise<any[]>{
    let message='Something went wrong while Getting Item List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetAccountList)
      );
    }catch (error) {
      console.error('GetAccountList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async getProfitCenter(godown_code:any): Promise<any[]>{
    let message='Something went wrong while Getting Profit Center List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetProfitCenter + '/' + godown_code)
      );
    }catch (error) {
      console.error('GetProfitCenter : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    } 
  }

  findInventoryAccounts(distinctGodownCodes: any[]) {
    const payload = {
      distinctGodownCodes: distinctGodownCodes,
    };
    return this.httpClient.post<any>(this.endpointService.FindInventoryAccounts, payload)
  }

  savePurchaseExpenseEntry(expenseHeaderModel: ExpenseHeaderModel, accountGridModel: any[]) {
    const payload = {
      expenceEntryModel: expenseHeaderModel,
      expenseGridModel: accountGridModel
    };
    return this.httpClient.post<any>(this.endpointService.SavePurchaseExpenseEntry , payload)
  }

  deletePurchaseExpense(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeletePurchaseExpense + '/' + voucher_id + '/' + sessionStorage.getItem('year')
    );
  }

  async SearchList(searchList: ExpenseEntrySearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.ref_grn != null) {
      params = params.set('ref_grn', searchList.ref_grn);
    }
    if (searchList.document_number != null) {
      params = params.set('document_number', searchList.document_number);
    }
    params = params.set('year', sessionStorage.getItem('year')|| 0)
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    );
    this.mainList = res;
    this.loadListExpenseEntry.next(res);
    this.clickedEntry.next(res[0]);
  }
}

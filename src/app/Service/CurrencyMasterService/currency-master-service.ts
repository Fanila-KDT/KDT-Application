import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { CurrencyMasterEndpointService } from './currency-master.end-point.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { CurrencyMasterModalSearch, CurrencyMasterModel, ExchageRateModel } from '../../Model/CurrencyMaster/currency-master.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyMasterService {
  public mainList:CurrencyMasterModel[]=[];  
  public loadList = new BehaviorSubject<CurrencyMasterModel[]>([]);

  public assignExchangeRate = new BehaviorSubject<ExchageRateModel>(new ExchageRateModel()) ;
  public clickedCurrency = new BehaviorSubject<CurrencyMasterModel>(new CurrencyMasterModel()) ;
  public addRowAfterSave = new BehaviorSubject<CurrencyMasterModel>(new CurrencyMasterModel()) ;
  public addRowAfterModify = new BehaviorSubject<CurrencyMasterModel>(new CurrencyMasterModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  
  FormName='CURRENCY_MASTER';
  selectedCurNo: number = 0;

  constructor(private httpClient:HttpClient, private endpointService: CurrencyMasterEndpointService,private alertService:AlertService) { }

  async getCurrencyMasterList(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<CurrencyMasterModel[]>(this.endpointService.getList)
      );
      this.mainList = res;
      this.loadList.next(res);
      this.clickedCurrency.next(res[0]);

      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async getExchangeRateList(cur_no:any){
    try{
      if(cur_no == null || cur_no == undefined){
        return;
      }
      this.httpClient.get<ExchageRateModel>(this.endpointService.getExchangeRateList +'/'+cur_no).subscribe({
      next: res => {
        this.assignExchangeRate.next(res);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('getExchangeRateList : ', error);
      let message='Something went wrong while Fetching Exchange Rate List. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async getItemNo(): Promise<any> {
    try{
      const itemNo = await this.httpClient.get<any>(this.endpointService.getItemNo).toPromise();
      return itemNo; 
    }catch (error) {
      console.error('getItemNo : ', error);
      let message='Something went wrong while Get ItemNo. Please try again';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  saveCurrencyMasterWithRates(currencyMaster: CurrencyMasterModel, exchangeRates: any[]) {
    const payload = {
      currencyMaster: currencyMaster,
      exchangeRates: exchangeRates
    };
    return this.httpClient.post(`${this.endpointService.SaveCurrencyMaster}`, payload);
  }

  updateCurrencyMasterWithRates(currencyMaster: CurrencyMasterModel, exchangeRates: any[]) {
    const payload = {
      currencyMaster,
      exchangeRates
    };
    return this.httpClient.put<any>(`${this.endpointService.UpdateCurrencyMaster}`, payload);
  }
  
  deleteCurrencyMaster(cur_no: string): Observable<CurrencyMasterModel[]> {
    return this.httpClient.delete<CurrencyMasterModel[]>(this.endpointService.DeleteCurrencyMaster + '/' + cur_no);
  }

  async SearchList(searchList: CurrencyMasterModalSearch): Promise<void> {
    const params = new HttpParams({ fromObject: { ...searchList } });

    try {
      const res = await firstValueFrom(
        this.httpClient.get<CurrencyMasterModel[]>(await this.endpointService.getSearchList, { params })
      );

      if (Array.isArray(res)) {
        this.mainList = res;
        this.loadList.next(res);
        this.clickedCurrency.next(res[0]);
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

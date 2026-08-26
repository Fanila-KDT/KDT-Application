import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { PaymentTermsMasterModel, PaymentTermsMasterSearch } from '../../Model/PaymentTerms/payment-terms.model';
import { PaymentTermsMasterEndpointService } from './payment-terms.end-point.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentTermsMasterService {
  public mainList:PaymentTermsMasterModel[]=[];  
  public loadList = new BehaviorSubject<PaymentTermsMasterModel[]>([]);

  public clickedPaymentTerms = new BehaviorSubject<PaymentTermsMasterModel>(new PaymentTermsMasterModel()) ;  

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
  FormName='PaymentTerms_MASTER';
  
  constructor(private httpClient:HttpClient, private endpointService: PaymentTermsMasterEndpointService,private alertService:AlertService) { }
  
  async getPaymentTermsMasterList(status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<PaymentTermsMasterModel[]>(this.endpointService.GetPaymentTermsMasterList)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedPaymentTerms.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getPaymentTermsMasterList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  SavePaymentTerms(paymentTermsModel: PaymentTermsMasterModel ) {
    return this.httpClient.post<any>(this.endpointService.SavePaymentTerms, paymentTermsModel)
  }

  DeletePaymentTerms(payterm_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeletePaymentTerms + '/' + payterm_id 
    );
  }

  async SearchList(searchList: PaymentTermsMasterSearch): Promise<void> {
    let params = new HttpParams();

    if (searchList.purchase != null) {
      params = params.set('purchase', searchList.purchase);
    }
    if (searchList.contract_invoice != null) {
      params = params.set('contract_invoice', searchList.contract_invoice);
    }
    if (searchList.sales_order != null) {
      params = params.set('sales_order', searchList.sales_order);
    }
    
    const res = await firstValueFrom(
      this.httpClient.get<any[]>(this.endpointService.GetSearchList, { params })
    ); 
    this.mainList = res;
    this.loadList.next(res);
    this.clickedPaymentTerms.next(res[0]);
  }
}

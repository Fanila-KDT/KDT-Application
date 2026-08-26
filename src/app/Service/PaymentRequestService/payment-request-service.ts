import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { PaymentRequestDetailModel, PaymentRequestModel, PaymentRequestSave } from '../../Model/PaymentRequest/payment-request.model';
import { PaymentRequestEndpointService } from './payment-request.end-point.service';
import { DateModelAccounts } from '../../Model/CommonModel';

@Injectable({
  providedIn: 'root'
})
export class PaymentRequestService {
  public mainList:PaymentRequestModel[]=[];  
  public loadList = new BehaviorSubject<PaymentRequestModel[]>([]);

  public clickedPayment = new BehaviorSubject<PaymentRequestModel>(new PaymentRequestModel()) ;
  public addRowAfterSave = new BehaviorSubject<PaymentRequestModel>(new PaymentRequestModel()) ;
  public addRowAfterModify = new BehaviorSubject<PaymentRequestModel>(new PaymentRequestModel()) ;

  public disableGrid = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');

  selectedVoucherId:string="";
  FormName='PAYMENT_REQUEST';

  constructor(private httpClient:HttpClient, private endpointService: PaymentRequestEndpointService,private alertService:AlertService) { }

  async GetPaymentRequestList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<PaymentRequestModel[]>(this.endpointService.GetPaymentRequestList + '/' + year)
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedPayment.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetPaymentRequestDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetPaymentRequestDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetPaymentRequestDetails : ', error);
      const message = 'Something went wrong while Fetching Payment Request Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  SavePaymentRequest(paymentRequestSave: PaymentRequestSave, paymentRequestDeatail: PaymentRequestDetailModel[],dateModel: DateModelAccounts){
    const payload = {
      paymentRequestSave: paymentRequestSave,
      paymentRequestDeatail: paymentRequestDeatail,
      dateModel: dateModel
    };
    return this.httpClient.post<any>(this.endpointService.SavePaymentRequest, payload)
  }

  DeletePaymentRequest(voucher_id: string): Observable<any[]> {
    return this.httpClient.delete<any[]>(
      this.endpointService.DeletePaymentRequest + '/' + voucher_id
    );
  }
}

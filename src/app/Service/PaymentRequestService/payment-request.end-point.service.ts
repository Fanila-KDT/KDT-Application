import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class PaymentRequestEndpointService {
  GetPaymentRequestList: string = "";
  SavePaymentRequest: string = "";
  DeletePaymentRequest: string = "";
  GetPaymentRequestDetails: string = "";
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/PaymentRequest";
    
    this.GetPaymentRequestList = apiHostingURL+ "/GetPaymentRequestList";
    this.SavePaymentRequest = apiHostingURL + "/SavePaymentRequest";
    this.DeletePaymentRequest = apiHostingURL + "/DeletePaymentRequest";
    this.GetPaymentRequestDetails = apiHostingURL + "/GetPaymentRequestDetails";
  }
}
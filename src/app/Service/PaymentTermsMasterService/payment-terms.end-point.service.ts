import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class PaymentTermsMasterEndpointService {
  GetPaymentTermsMasterList: string = "";
  SavePaymentTerms: string = "";
  DeletePaymentTerms: string = "";
  GetSearchList: string = "";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/PaymentTermsMaster";
    
    this.GetPaymentTermsMasterList = apiHostingURL+ "/GetPaymentTermsMasterList";
    this.SavePaymentTerms = apiHostingURL+ "/SavePaymentTerms";
    this.DeletePaymentTerms = apiHostingURL+ "/DeletePaymentTerms";
    this.GetSearchList = apiHostingURL+ "/GetSearchList";
  }
}
import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class SalesQuotationEndpointService {
  GetSalesQuotationList
  GetSalesQuotationDetails
  SaveSalesQuotation
  DeleteSalesQuotation
  GetSearchList
  GetPaymentTypeList
  SendForStatusChange

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/SalesQuotation";
    
    this.GetSalesQuotationList = apiHostingURL+ "/GetSalesQuotationList";
    this.SaveSalesQuotation = apiHostingURL+ "/SaveSalesQuotation";
    this.DeleteSalesQuotation = apiHostingURL+ "/DeleteSalesQuotation";
    this.GetSearchList = apiHostingURL+ "/GetSearchList";
    this.GetSalesQuotationDetails = apiHostingURL+ "/GetSalesQuotationDetails";
    this.GetPaymentTypeList = apiHostingURL+ "/GetPaymentTypeList";
    this.SendForStatusChange = apiHostingURL+ "/SendForStatusChange";
  }
}
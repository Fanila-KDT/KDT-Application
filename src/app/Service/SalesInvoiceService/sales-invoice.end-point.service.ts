import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class SalesInvoiceEndpointService {
  GetSalesInvoiceList
  GetSalesInvoiceDetails
  GetDriverList
  SaveSalesInvoice
  DeleteSalesInvoice

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/SalesInvoice";
    
    this.GetSalesInvoiceList = apiHostingURL+ "/GetSalesInvoiceList";
    this.GetSalesInvoiceDetails = apiHostingURL+ "/GetSalesInvoiceDetails";
    this.GetDriverList = apiHostingURL+ "/GetDriverList";
    this.SaveSalesInvoice = apiHostingURL+ "/SaveSalesInvoice";
    this.DeleteSalesInvoice = apiHostingURL+ "/DeleteSalesInvoice";
  }
}
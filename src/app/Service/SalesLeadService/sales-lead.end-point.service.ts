import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class SalesLeadEndpointService {
  GetSalesLeadList
  SaveSalesLead
  DeleteSalesLead

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/SalesLead";
    
    this.GetSalesLeadList = apiHostingURL+ "/GetSalesLeadList";
    this.SaveSalesLead = apiHostingURL+ "/SaveSalesLead";
    this.DeleteSalesLead = apiHostingURL+ "/DeleteSalesLead";
  }
}
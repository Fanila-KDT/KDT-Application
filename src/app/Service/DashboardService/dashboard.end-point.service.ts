import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class DashboardEndpointService {
  getDetails: string = "";
  submitCustomerRequest: string = "";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/Dashboard";
    
    this.getDetails = apiHostingURL + "/getDetails";
    this.submitCustomerRequest = apiHostingURL + "/submitCustomerRequest";
  }
}
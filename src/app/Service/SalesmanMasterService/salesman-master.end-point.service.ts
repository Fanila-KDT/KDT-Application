import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class SalesmanMasterEndpointService {
  GetSalesmanMasterList: string = "";
  GetSalesmanAreaDetails: string = "";
  GetSalesmanCustomerDetails: string ="";
  GetEngineerList: string ="";
  GetAreaGroupList: string ="";
  SaveSalesmanMaster: string ="";
  GetCustomerList: string ="";
  DeleteMajorCutomer: string ="";
  SaveMajorCustomer: string ="";
  DeleteSalesman: string ="";
  GetSearchList: string ="";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/SalesmanMaster";
    
    this.GetSalesmanMasterList = apiHostingURL+ "/GetSalesmanMasterList";
    this.GetSalesmanAreaDetails = apiHostingURL + "/GetSalesmanAreaDetails";
    this.GetSalesmanCustomerDetails = apiHostingURL + "/GetSalesmanCustomerDetails";
    this.GetEngineerList = apiHostingURL + "/GetEngineerList";
    this.GetAreaGroupList = apiHostingURL + "/GetAreaGroupList";
    this.SaveSalesmanMaster = apiHostingURL + "/SaveSalesmanMaster";
    this.GetCustomerList = apiHostingURL + "/GetCustomerList";
    this.DeleteMajorCutomer = apiHostingURL + "/DeleteMajorCutomer";
    this.SaveMajorCustomer = apiHostingURL + "/SaveMajorCustomer";
    this.DeleteSalesman = apiHostingURL + "/DeleteSalesman";
    this.GetSearchList = apiHostingURL + "/GetSearchList";
  }
}
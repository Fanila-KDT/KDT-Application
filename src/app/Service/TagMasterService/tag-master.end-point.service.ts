import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class TagMasterEndpointService {
  GetTagMasterList
  SaveTagMaster
  DeleteTagMaster
  GetSearchList
  GetAreaList
  GetBrandAndPT
  GetSalesManList
  GetCustomerList
  GetEngineerList

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/TagMaster";
    
    this.GetTagMasterList = apiHostingURL+ "/GetTagMasterList";
    this.SaveTagMaster = apiHostingURL+ "/SaveTagMaster";
    this.DeleteTagMaster = apiHostingURL+ "/DeleteTagMaster";
    this.GetSearchList = apiHostingURL+ "/GetSearchList";
    this.GetAreaList = apiHostingURL+ "/GetAreaList";
    this.GetBrandAndPT = apiHostingURL+ "/GetBrandAndPT";
    this.GetSalesManList= apiHostingURL+ "/GetSalesManList";
    this.GetCustomerList= apiHostingURL+ "/GetCustomerList";
    this.GetEngineerList= apiHostingURL+ "/GetEngineerList";
    
  }
}
import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class CustomerMasterEndpointService {
  GetCustomerMasterList: string = "";
  GetMarketList: string = "";
  GetAreaList: string = "";
  GetCollectorList: string = "";
  GetSearchList: string = "";
  DeleteCustomerMaster: string = "";
  SaveCustomerMaster: string = "";
  uploadFiles: string = "";
  getAttURL: string = "";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/CustomerMaster";
    
    this.GetCustomerMasterList = apiHostingURL+ "/GetCustomerMasterList";
    this.GetMarketList = apiHostingURL + "/GetMarketList";
    this.GetAreaList = apiHostingURL + "/GetAreaList";
    this.GetCollectorList = apiHostingURL + "/GetCollectorList";
    this.SaveCustomerMaster = apiHostingURL + "/SaveCustomerMaster";
    this.DeleteCustomerMaster = apiHostingURL + "/DeleteCustomerMaster";
    this.GetSearchList = apiHostingURL + "/GetSearchList";
    this.uploadFiles = apiHostingURL + "/UploadFiles";
    this.getAttURL = apiHostingURL + "/GetAttachmentList";
  }
}
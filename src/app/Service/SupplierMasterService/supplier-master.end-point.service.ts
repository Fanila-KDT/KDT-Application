import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class SupplierMasterEndpointService {
  getList: string = "";
  getMainGroupList: string = "";
  getSubGroupList: string = "";
  SaveSupplierMaster: string = "";
  UpdateSupplierMaster: string = "";
  DeleteSupplierMaster: string = "";
  getSearchList: string = "";
  getSubListByMainCode: string = "";
  GetForeignCurrency : string = "";
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/SupplierMaster";
    
    this.getList = apiHostingURL;
    this.SaveSupplierMaster = apiHostingURL + "/saveSupplierMaster";
    this.UpdateSupplierMaster = apiHostingURL + "/updateSupplierMaster";
    this.DeleteSupplierMaster = apiHostingURL + "/deleteSupplierMaster";
    this.getSearchList = apiHostingURL + "/getSearchList";
    this.getMainGroupList = apiHostingURL + "/getMainGroupList";
    this.getSubGroupList = apiHostingURL + "/getSubGroupList";
    this.getSubListByMainCode = apiHostingURL + "/GetSubListCode";
    this.GetForeignCurrency = apiHostingURL + "/GetForeignCurrency";
  }
}
import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class WarehouseMasterEndpointService {
  getList: string = "";
  getProfitList: string = "";
  SaveWarehouseMaster: string = "";
  DeleteWarehouseMaster: string = "";
  getSearchList: string = "";
  wHNameCheck: string = "";
  getAccLinkingList: string = "";
  GetAccountList: string = "";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/WarehouseMaster";
    
    this.getList = apiHostingURL;
    this.getProfitList = apiHostingURL + "/getProfitList";
    this.SaveWarehouseMaster = apiHostingURL + "/saveWarehouseMaster";
    this.DeleteWarehouseMaster = apiHostingURL + "/deleteWarehouseMaster";
    this.getSearchList = apiHostingURL + "/getSearchList";
    this.wHNameCheck = apiHostingURL + "/wHNameCheck";
    this.getAccLinkingList = apiHostingURL + "/getAccLinkingList";
    this.GetAccountList = apiHostingURL + "/getAccountList";
  }
}
import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class AccountMasterEndpointService {
  getList: string = "";
  getMainGroupList: string = "";
  getSubGroupList: string = "";
  SaveAccountMaster: string = "";
  UpdateAccountMaster: string = "";
  DeleteAccountMaster: string = "";
  getSearchList: string = "";
  getSubListByMainCode: string = "";
  accNameCheck: string = "";
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/AccountMaster";
    
    this.getList = apiHostingURL;
    this.SaveAccountMaster = apiHostingURL + "/saveAccountMaster";
    this.UpdateAccountMaster = apiHostingURL + "/updateAccountMaster";
    this.DeleteAccountMaster = apiHostingURL + "/deleteAccountMaster";
    this.getSearchList = apiHostingURL + "/getSearchList";
    this.getMainGroupList = apiHostingURL + "/getMainGroupList";
    this.getSubGroupList = apiHostingURL + "/getSubGroupList";
    this.getSubListByMainCode = apiHostingURL + "/getSubListByMainCode";
    this.accNameCheck = apiHostingURL + "/accNameCheck";
  }
}
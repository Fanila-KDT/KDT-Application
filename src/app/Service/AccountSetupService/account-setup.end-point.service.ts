import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class AccountSetupEndpointService {
  GetAccountSetupList: string = "";
  SaveAccountSetup: string = "";
  DeleteAccountSetup: string = "";
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/AccountSetup";
    
    this.GetAccountSetupList = apiHostingURL+ "/GetAccountSetupList";
    this.SaveAccountSetup = apiHostingURL + "/SaveAccountSetup";
    this.DeleteAccountSetup = apiHostingURL + "/DeleteAccountSetup";
  }
}
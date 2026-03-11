import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class CurrencyMasterEndpointService {
  getList: string = "";
  getExchangeRateList: string = "";
  SaveCurrencyMaster: string = "";
  UpdateCurrencyMaster: string = "";
  DeleteCurrencyMaster: string = "";
  getSearchList: string = "";
  getItemNo: string = "";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/CurrencyMaster";
    
    this.getList = apiHostingURL;
    this.getExchangeRateList = apiHostingURL + "/getExchangeRateList";
    this.SaveCurrencyMaster = apiHostingURL + "/saveCurrencyMaster";
    this.UpdateCurrencyMaster = apiHostingURL + "/updateCurrencyMaster";
    this.DeleteCurrencyMaster = apiHostingURL + "/deleteCurrencyMaster";
    this.getItemNo = apiHostingURL + "/getItemNo";
    this.getSearchList = apiHostingURL + "/getSearchList";
  }
}
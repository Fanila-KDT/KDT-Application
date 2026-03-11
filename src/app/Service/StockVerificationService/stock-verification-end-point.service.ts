import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class StockVerificationEndpointService {
  getList: string;
  GetStockVerificationList :string;
  GetStockVerificationDetails :string;
  SaveVaricationItems :string;
  GetSearchList :string;
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/StockVerification";
    
    this.getList = apiHostingURL;
    this.GetStockVerificationList = apiHostingURL + '/getStockVerificationList';
    this.GetStockVerificationDetails = apiHostingURL + '/getStockVerificationDetails';
    this.SaveVaricationItems = apiHostingURL + '/saveVaricationItems';
    this.GetSearchList = apiHostingURL + '/getSearchList';
  }
}

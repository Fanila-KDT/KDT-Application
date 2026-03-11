import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class StockCorrectionEndpointService {
  getList: string;
  GetStockCorrectionList :string;
  GetAccountList : string;
  GetStockCorrectionDetails : string;
  saveStockCorrection : string;
  DeleteStockCorrection : string;
  GetSearchList : string;
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/StockCorrection";
    
    this.getList = apiHostingURL;    
    this.GetStockCorrectionList = apiHostingURL + '/getStockCorrectionList';
    this.GetAccountList = apiHostingURL + '/getAccountList';
    this.GetStockCorrectionDetails = apiHostingURL + '/getStockCorrectionDetails';
    this.saveStockCorrection = apiHostingURL + '/saveStockCorrection';
    this.DeleteStockCorrection = apiHostingURL + '/deleteStockCorrection';
    this.GetSearchList = apiHostingURL + '/getSearchList';
  }
}

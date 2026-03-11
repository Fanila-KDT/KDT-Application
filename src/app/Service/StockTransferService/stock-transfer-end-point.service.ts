import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class StockTransferEndpointService {
  getList: string;
  GetStockTransferList :string;
  GetGodownList :string;
  GetStockTransferDetails :string;
  SaveStockTransfer :string;
  DeleteStockTransfer :string;
  GetSearchList :string;
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/StockTransfer";
    
    this.getList = apiHostingURL;    
    this.GetStockTransferList = apiHostingURL + '/getStockTransferList';
    this.GetGodownList = apiHostingURL + '/getGodownList';
    this.GetStockTransferDetails = apiHostingURL + '/getStockTransferDetails';
    this.SaveStockTransfer = apiHostingURL + '/saveStockTransfer';
    this.DeleteStockTransfer = apiHostingURL + '/deleteStockTransfer';
    this.GetSearchList = apiHostingURL + '/getSearchList';
  }
}

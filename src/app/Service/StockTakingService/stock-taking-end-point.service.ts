import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class StockTakingEndpointService {
  getList: string;
  GetStockTakingList :string;
  GetGodownList :string;
  GetStockTakingDetails :string;
  GetStockTakingDetailLoad :string;
  SaveStockTaking :string;
  DeleteStockTaking :string;
  GetSearchList :string;
  CheckWarehouse :string;
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/StockTaking";
    
    this.getList = apiHostingURL;    
    this.GetStockTakingList = apiHostingURL + '/getStockTakingList';
    this.GetGodownList = apiHostingURL + '/getGodownList';
    this.GetStockTakingDetails = apiHostingURL + '/getStockTakingDetails';
    this.SaveStockTaking = apiHostingURL + '/saveStockTaking';
    this.DeleteStockTaking = apiHostingURL + '/deleteStockTaking';
    this.GetSearchList = apiHostingURL + '/getSearchList';
    this.GetStockTakingDetailLoad = apiHostingURL + '/getStockTakingDetailLoad';
    this.CheckWarehouse = apiHostingURL + '/checkWarehouse';
  }
}

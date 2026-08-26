import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class PurchaseReturnEndpointService {
  getList: string;
  GetPurchaseReturnList: string;
  GetRegisterList: string;
  GetVendorList: string;
  GetWarehouseList: string;
  GetFullWarehouseList: string;
  GetItemDetails: string;
  GetGRNNoList = '';
  SavePurchaseReturn = '';
  DeletePurchaseReturn = '';
  GetSearchList ='';
  // SendForStockVerification='';

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/PurchaseReturn";
    
    this.getList = apiHostingURL;
    this.GetPurchaseReturnList = apiHostingURL + '/getPurchaseReturnList';
    this.GetRegisterList = apiHostingURL + '/getRegisterList';
    this.GetVendorList = apiHostingURL + '/getVendorList';
    this.GetWarehouseList = apiHostingURL + '/getWarehouseList';
    this.GetFullWarehouseList = apiHostingURL + '/getFullWarehouseList';
    this.GetItemDetails = apiHostingURL + '/getItemDetails';
    this.GetGRNNoList = apiHostingURL+ "/getGRNNoList";
    this.SavePurchaseReturn = apiHostingURL+ "/savePurchaseReturn";
    this.DeletePurchaseReturn = apiHostingURL+ "/deletePurchaseReturn";
    this.GetSearchList = apiHostingURL+ "/getSearchList";
    // this.SendForStockVerification= apiHostingURL+ "/sendForStockVerification";
  }
}

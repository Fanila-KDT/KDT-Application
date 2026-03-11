import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class RecieptEntryEndpointService {
  getList: string;
  GetGoodsRecieptList: string;
  GetRegisterList: string;
  GetVendorList: string;
  GetWarehouseList: string;
  GetFullWarehouseList: string;
  GetItemDetails: string;
  GetRefNoList = '';
  GetRefNoListFull = '';
  GetPoNoList = '';
  GetPoNoDetails = '';
  SaveGoodsRecieptNote = '';
  DeleteGRN = '';
  GetSearchList ='';
  SendForStockVerification='';

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/RecieptEntry";
    
    this.getList = apiHostingURL;
    this.GetGoodsRecieptList = apiHostingURL + '/getGoodsRecieptList';
    this.GetRegisterList = apiHostingURL + '/getRegisterList';
    this.GetVendorList = apiHostingURL + '/getVendorList';
    this.GetWarehouseList = apiHostingURL + '/getWarehouseList';
    this.GetFullWarehouseList = apiHostingURL + '/getFullWarehouseList';
    this.GetItemDetails = apiHostingURL + '/getItemDetails';
    this.GetRefNoList = apiHostingURL+ "/getRefNoList";
    this.GetRefNoListFull = apiHostingURL+ "/getRefNoListFull";
    this.GetPoNoList = apiHostingURL+ "/getPoNoList";
    this.GetPoNoDetails = apiHostingURL+ "/getPoNoDetails";
    this.SaveGoodsRecieptNote = apiHostingURL+ "/saveGoodsRecieptNote";
    this.DeleteGRN = apiHostingURL+ "/deleteGRN";
    this.GetSearchList = apiHostingURL+ "/getSearchList";
    this.SendForStockVerification= apiHostingURL+ "/sendForStockVerification";
  }
}

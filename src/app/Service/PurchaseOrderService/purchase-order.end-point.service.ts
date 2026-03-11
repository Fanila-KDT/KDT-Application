import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderEndpointService {
  getList = '';
  GetRegisterList ='';
  GetVendorList ='';
  GetPaymentList ='';
  GetItemDetails ='';
  GetItemList = '';
  ItemCodeEnter = '';
  ModelNameChange = '';
  SavePurchaseOrder = '';
  DeletePurchaseOrder = '';
  GetSearchList = '';
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/PurchaseOrder";
    this.getList = apiHostingURL +"/getList";
    this.GetRegisterList = apiHostingURL+ "/getRegisterList";
    this.GetVendorList = apiHostingURL+ "/getVendorList";
    this.GetPaymentList = apiHostingURL+ "/getPaymentList";
    this.GetItemDetails = apiHostingURL+ "/getItemDetails";
    this.GetItemList = apiHostingURL+ "/getItemList";
    this.ItemCodeEnter = apiHostingURL+ "/itemCodeEnter";
    this.ModelNameChange = apiHostingURL+ "/modelNameChange";
    this.SavePurchaseOrder = apiHostingURL+ "/savePurchaseOrder";
    this.DeletePurchaseOrder = apiHostingURL+ "/deletePurchaseOrder";
    this.GetSearchList = apiHostingURL+ "/getSearchList";
  }
}
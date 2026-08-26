import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class ItemReorderRequestEndpointService {
  getList: string;
  GetItemReorderRequestList :string;
  GetItemReorderDetails:string;
  GetLoadItemDetails:string;
  GetBrandList:string;
  CheckRequestStatus:string;
  SaveItemReorderRequest:string;
  DeleteItemReorderRequest :string;
  GetSearchList :string;

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/ItemReorderRequest";
    
    this.getList = apiHostingURL;    
    this.GetItemReorderRequestList = apiHostingURL + '/getItemReorderRequestList';
    this.GetBrandList = apiHostingURL + '/getBrandList';
    this.GetItemReorderDetails = apiHostingURL + '/getItemReorderDetails';
    this.GetLoadItemDetails = apiHostingURL + '/getLoadItemDetails';
    this.CheckRequestStatus = apiHostingURL + '/checkRequestStatus';
    this.SaveItemReorderRequest = apiHostingURL + '/saveItemReorderRequest';
    this.DeleteItemReorderRequest = apiHostingURL + '/deleteItemReorderRequest';
    this.GetSearchList = apiHostingURL + '/getSearchList';
  }
}

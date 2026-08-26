import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class AreaMasterEndpointService {
  GetAreaMasterList: string = "";
  SaveAreaMaster: string = "";
  DeleteAreaMaster: string = "";
  GetSearchList: string = "";
  GetAreaGroupList: string = "";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/AreaMaster";
    
    this.GetAreaMasterList = apiHostingURL+ "/GetAreaMasterList";
    this.SaveAreaMaster = apiHostingURL+ "/SaveAreaMaster";
    this.DeleteAreaMaster = apiHostingURL+ "/DeleteAreaMaster";
    this.GetSearchList = apiHostingURL+ "/GetSearchList";
    this.GetAreaGroupList = apiHostingURL+ "/GetAreaGroupList";
  }
}
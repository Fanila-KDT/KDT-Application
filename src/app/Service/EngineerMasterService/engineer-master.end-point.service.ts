import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class EngineerMasterEndpointService {
  GetEngineerMasterList: string = "";
  SaveEngineerMaster: string = "";
  DeleteEngineer: string = "";
  GetSearchList: string = "";

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/EngineerMaster";
    
    this.GetEngineerMasterList = apiHostingURL+ "/GetEngineerMasterList";
    this.SaveEngineerMaster = apiHostingURL+ "/SaveEngineerMaster";
    this.DeleteEngineer = apiHostingURL+ "/DeleteEngineer";
    this.GetSearchList = apiHostingURL+ "/GetSearchList";
  }
}
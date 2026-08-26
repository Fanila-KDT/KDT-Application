import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceRequestEndpointService {
  GetMaintenanceRequestList: string = "";
  SaveMaintenanceRequest: string = "";
  DeleteMaintenanceRequest: string = "";
  GetTagItems: string = "";
  GetMaintenanceRequestDetails: string = "";
  CheckTagStatus: string = "";
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/MaintenanceRequest";
    
    this.GetMaintenanceRequestList = apiHostingURL+ "/GetMaintenanceRequestList";
    this.GetMaintenanceRequestDetails = apiHostingURL+ "/GetMaintenanceRequestDetails";
    this.SaveMaintenanceRequest = apiHostingURL + "/SaveMaintenanceRequest";
    this.DeleteMaintenanceRequest = apiHostingURL + "/DeleteMaintenanceRequest";
    this.GetTagItems = apiHostingURL + "/GetTagItems";
    this.CheckTagStatus = apiHostingURL + "/CheckTagStatus";
  }
}

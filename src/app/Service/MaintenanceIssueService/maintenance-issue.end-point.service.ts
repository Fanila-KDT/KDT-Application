import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceIssueEndpointService {
  GetMaintenanceIssueList: string = "";
  SaveMaintenanceIssue: string = "";
  DeleteMaintenanceIssue: string = "";
  GetMaintenanceIssueDetails: string = "";
  ReqNochanges: string = "";
  GetRequestNos: string = "";
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/MaintenanceIssue";
    
    this.GetMaintenanceIssueList = apiHostingURL+ "/GetMaintenanceIssueList";
    this.GetMaintenanceIssueDetails = apiHostingURL+ "/GetMaintenanceIssueDetails";
    this.SaveMaintenanceIssue = apiHostingURL + "/SaveMaintenanceIssue";
    this.DeleteMaintenanceIssue = apiHostingURL + "/DeleteMaintenanceIssue";
    this.GetRequestNos = apiHostingURL + "/GetRequestNos";
    this.ReqNochanges = apiHostingURL + "/ReqNochanges";

  }
}

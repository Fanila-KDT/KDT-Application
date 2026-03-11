import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class CommonEndpointService {
  GetGuid: string;
  GetYears ='';

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/Common";
    
    this.GetGuid = apiHostingURL + "/getGuid";
    this.GetYears = apiHostingURL+ "/getYears";
  }
}
import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class LoginEndpointService {
  CheckLoginCredinals: string;
  SaveLoginCredinals: string;
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/Login";
    
    this.CheckLoginCredinals = apiHostingURL + "/checkLoginCredinals";
    this.SaveLoginCredinals = apiHostingURL + "/saveLoginCredinals";
  }
}
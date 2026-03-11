import { Injectable } from '@angular/core';
import URLconfig  from '../../assets/api/URLconfig.json';


import { HttpClient,HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
@Injectable({
    providedIn: 'root'
})
export class EndPointService {

  //url=URLconfig.endPointLive_ABM34;
  //url=URLconfig.endPointLive_ASG92;
  companycode=1;
  year = 22;
  GridHeight = 550;
  url=URLconfig.Local; 
 
  
  apiHostingURL=this.url.API_Url;
  apiHostingUIURL=this.url.UI_Url;
  baseURL = this.url.BaseURL;
  ReportURL=this.url.Report_Url;
  LogoUrl=this.url.Logo_Url;
  LoginUrl = this.apiHostingURL + "api/Auth/UserLogin"
  SetPageList=[50,100,250,500]
  
  constructor(private http:HttpClient) {}

}



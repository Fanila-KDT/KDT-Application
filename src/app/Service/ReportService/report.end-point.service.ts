import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class ReportEndpointService {
  getList;
  getMainCategoryList;
  getSubCategoryList;
  getCategoryList;
  getBrandList;
  getRegisterList;
  getVendorList;
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/Report";
    
    this.getList = apiHostingURL;
    this.getMainCategoryList = apiHostingURL + "/getMainCategoryList";
    this.getSubCategoryList = apiHostingURL + "/getSubCategoryList";
    this.getCategoryList =  apiHostingURL + "/getCategoryList";
    this.getBrandList =  apiHostingURL + "/getBrandList";
    this.getRegisterList =  apiHostingURL + "/getRegisterList";
    this.getVendorList =  apiHostingURL + "/getVendorList";
  }
}
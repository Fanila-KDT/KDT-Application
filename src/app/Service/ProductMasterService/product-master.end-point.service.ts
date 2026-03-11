import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class ProductMasterEndpointService {
  getList: string = "";
  getproductClassList:string = "";
  GetDepartmentList:string = "";
  AddProductClass:string = "";
  AddBrand:string = "";
  getproductColorList:string = "";
  getBrandList:string = "";
  getUnitList:string = "";
  getMachinefeatureList:string = "";
  getAssoceriesList:string = "";
  getPrevCodeList:string = "";
  prevCodeListSave:string = "";
  pendingAccessoryList:string = "";
  getSearchList:string = "";
  getItemNo:string = "";
  getItemCategory:string = "";
  SaveProductMaster = "";
  deleteCheck = "";
  itemCodeCheck = "";
  Delete = "";
  
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/ProductMaster";
    
    this.getList = apiHostingURL;
    this.getproductClassList = apiHostingURL + "/getproductClassList";
    this.GetDepartmentList = apiHostingURL + "/getDepartmentList";
    this.AddProductClass = apiHostingURL + "/addProductClass";
    this.AddBrand = apiHostingURL + "/addBrand";
    this.getproductColorList = apiHostingURL + "/getproductColorList";
    this.getBrandList = apiHostingURL + "/getBrandList";
    this.getUnitList = apiHostingURL + "/getUnitList";
    this.getMachinefeatureList = apiHostingURL + "/getMachineFeatureList";
    this.getAssoceriesList = apiHostingURL + "/getAssoceriesList";
    this.getPrevCodeList = apiHostingURL + "/getPrevCodeList";
    this.prevCodeListSave = apiHostingURL + "/prevCodeListSave";
    this.pendingAccessoryList = apiHostingURL + "/pendingAccessoryList";
    this.getSearchList = apiHostingURL + "/getSearchList";
    this.getItemNo = apiHostingURL + "/getItemNo";
    this.getItemCategory = apiHostingURL + "/getItemCategory";
    this.itemCodeCheck = apiHostingURL + "/itemCodeCheck";
    this.deleteCheck = apiHostingURL + "/deleteCheck";
    this.Delete = apiHostingURL + "/Delete";
    this.SaveProductMaster = apiHostingURL + "/SaveProductMaster";
  }
}
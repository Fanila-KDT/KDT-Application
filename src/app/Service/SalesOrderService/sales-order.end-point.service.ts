import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderEndpointService {
  GetSalesOrderList
  GetSalesOrderDetails
  SaveSalesOrder
  DeleteSalesOrder
  GetSearchList
  GetPaymentTypeList
  SendForStatusChange
  GetOrderTypeList
  GetAccFromItemCodes
  GetSOAccessoriesList

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/SalesOrder";
    
    this.GetSalesOrderList = apiHostingURL+ "/GetSalesOrderList";
    this.SaveSalesOrder = apiHostingURL+ "/SaveSalesOrder";
    this.DeleteSalesOrder = apiHostingURL+ "/DeleteSalesOrder";
    this.GetSearchList = apiHostingURL+ "/GetSearchList";
    this.GetSalesOrderDetails = apiHostingURL+ "/GetSalesOrderDetails";
    this.GetPaymentTypeList = apiHostingURL+ "/GetPaymentTypeList";
    this.SendForStatusChange = apiHostingURL+ "/SendForStatusChange";
    this.GetOrderTypeList = apiHostingURL+ "/GetOrderTypeList";
    this.GetAccFromItemCodes = apiHostingURL+ "/GetAccFromItemCodes";
    this.GetSOAccessoriesList = apiHostingURL+ "/GetSOAccessoriesList";
  }
}
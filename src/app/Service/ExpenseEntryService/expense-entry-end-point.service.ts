import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class ExpenseEntryServiceEndpointService {
  getList: string;
  GetExpenseEntryList :string;
  GetExpenseEntryDetails :string;
  GetExpenseAccountDetails :string;
  GetAccountList :string;
  GetProfitCenter :string;
  FindInventoryAccounts :string;
  SavePurchaseExpenseEntry :string;
  DeletePurchaseExpense :string;
  GetSearchList :string;
  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/ExpenseEntry";
    
    this.getList = apiHostingURL;
    this.GetExpenseEntryList = apiHostingURL + '/getExpenseEntryList';
    this.GetExpenseEntryDetails = apiHostingURL + '/getExpenseEntryDetails';
    this.GetExpenseAccountDetails = apiHostingURL + '/getExpenseAccountDetails';
    this.GetAccountList = apiHostingURL + '/getAccountList';
    this.GetProfitCenter = apiHostingURL + '/getProfitCenter';
    this.FindInventoryAccounts = apiHostingURL + '/findInventoryAccounts';
    this.SavePurchaseExpenseEntry = apiHostingURL + '/savePurchaseExpenseEntry';
    this.DeletePurchaseExpense  = apiHostingURL + '/deletePurchaseExpense';
    this.GetSearchList  = apiHostingURL + '/getSearchList';
  }
}

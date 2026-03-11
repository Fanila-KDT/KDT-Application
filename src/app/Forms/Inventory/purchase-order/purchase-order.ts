import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { App } from '../../../app';
import { AlertService } from '../../../shared/alert/alert.service';
import { PurchaseOrderService } from '../../../Service/PurchaseOrderService/purchase-order-service';
import { PurchaseOrderModalSearch } from '../../../Model/PurchaseOrder/purchase-order.model';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'purchase-order',
  standalone: false,
  templateUrl: './purchase-order.html',
  styleUrls: ['./purchase-order.css', '../../common.css'],
})
export class PurchaseOrder {
  yearDisable: boolean = false;
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  registerList: any[] = [];
  vendorList: any[] = [];
  purchaseOrderModalSearch:PurchaseOrderModalSearch = new PurchaseOrderModalSearch();
  subscription: Subscription[]= new Array<Subscription>();
  years: any[] = [];
  year: number = new Date().getFullYear(); 

  constructor(public app:App,public purchaseOrderService:PurchaseOrderService,private alertService:AlertService,public commonService:CommonService) {

    this.subscription.push(this.purchaseOrderService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
    }));

    this.subscription.push(this.purchaseOrderService.registerList.subscribe(data=>{
      if(data != null){
        this.registerList = data;
      }
    }));

    this.subscription.push(this.purchaseOrderService.vendorList.subscribe(data=>{
      if(data != null){
        this.vendorList = data;
      }
    }));

    const subs = [
      { obs: this.purchaseOrderService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.purchaseOrderService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.purchaseOrderService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
    
    this.getYear();
  }

  ngOnInit() {
   
  }

  buttonClick(type: 'N' | 'M' | 'D' | 'C') {
    if(type != 'D'){
      this.newDisable = true;
      this.modifyDisable = true;
      this.deleteDisable = true;
      this.searchDisable = true;
      this.yearDisable = true;
      this.purchaseOrderService.disableGrid.next(true);
    }
    this.purchaseOrderService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }
  modalCancel(){
    this.showModalSearch = false;
    this.purchaseOrderModalSearch.register_code = null; 
    this.purchaseOrderModalSearch.account_code = null;
    this.purchaseOrderModalSearch.document_number = null;
    this.purchaseOrderModalSearch.approval_status = null;
  }

  modalSearch(){
    const model = {
      register_code: this.purchaseOrderModalSearch.register_code,
      account_code: this.purchaseOrderModalSearch.account_code,
      document_number: this.purchaseOrderModalSearch.document_number?.trim() || '',
      approval_status: this.purchaseOrderModalSearch.approval_status?.trim() || '',
    };

    this.purchaseOrderService.isLoading.next(true);
    this.purchaseOrderService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.purchaseOrderModalSearch.register_code = null;
      this.purchaseOrderModalSearch.approval_status = null;
      this.purchaseOrderModalSearch.account_code = null;
      this.purchaseOrderModalSearch.document_number = null;
      this.purchaseOrderService.isLoading.next(false);
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }
  
  Refresh(){
    this.purchaseOrderService.ngOnInit.next(true);
    this.getYear();
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);

    const match = this.years.find(y => y.period_id == event);
      if (match) {
        this.year = match.period_id; 
        sessionStorage.setItem('year',this.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
      }
    if(this.purchaseOrderService.btnClick.value == ''){
      this.purchaseOrderService.getPurchaseOrderList(event);
    }
  }

  getYear(){
    this.commonService.getYears().then(async(res: any) => {
      this.years = res;
      const currentYear = new Date().getFullYear();
      const match = this.years.find(y => y.period_name === currentYear);
      if (match) {
        this.year = match.period_id; // set to the matching GUID
        sessionStorage.setItem('year',this.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
        sessionStorage.setItem('currentYear',this.year.toString());
      }
    });
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.purchaseOrderService.disableGrid.next(this.gridDisabled);
  }
}

import { Component } from '@angular/core';
import { PaymentTermsMasterSearch } from '../../../Model/PaymentTerms/payment-terms.model';
import { Subscription } from 'rxjs';
import { PaymentTermsMasterService } from '../../../Service/PaymentTermsMasterService/payment-terms-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'app-payment-terms-master',
  standalone: false,
  templateUrl: './payment-terms-master.html',
  styleUrls: ['./payment-terms-master.css','../../common.css']
})

export class PaymentTermsMaster {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  paymentTermsMasterSearch:PaymentTermsMasterSearch = new PaymentTermsMasterSearch();
  subscription: Subscription[]= new Array<Subscription>();

  constructor(public paymentTermsMasterService:PaymentTermsMasterService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.paymentTermsMasterService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.paymentTermsMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.paymentTermsMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.paymentTermsMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  buttonClick(type: 'M' |'D'|'N') {
    if(type != 'D'){
      this.modifyDisable = true;
      this.searchDisable = true;
      this.deleteDisable = true;
      this.newDisable = true;
      this.refreshDisable = true;
      this.paymentTermsMasterService.disableGrid.next(true);
    }
    this.paymentTermsMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalSearch(){
    const model = {
      purchase:this.paymentTermsMasterSearch.purchase, 
      contract_invoice:this.paymentTermsMasterSearch.contract_invoice,
      sales_order:this.paymentTermsMasterSearch.sales_order,
    };

    this.paymentTermsMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.paymentTermsMasterSearch.purchase = null;
      this.paymentTermsMasterSearch.contract_invoice = null;
      this.paymentTermsMasterSearch.sales_order = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  modalCancel(){
    this.showModalSearch = false;
    this.paymentTermsMasterSearch.purchase = null;
    this.paymentTermsMasterSearch.contract_invoice = null;
    this.paymentTermsMasterSearch.sales_order = null;
  }

  Refresh(){
    this.paymentTermsMasterService.ngOnInit.next(true);
    this.searchDisable =  false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.paymentTermsMasterService.disableGrid.next(this.gridDisabled);
  }
}


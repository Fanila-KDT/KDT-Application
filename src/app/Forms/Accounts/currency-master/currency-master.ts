import { Component } from '@angular/core';
import { AlertService } from '../../../shared/alert/alert.service';
import { CurrencyMasterService } from '../../../Service/CurrencyMasterService/currency-master-service';
import { Subscription } from 'rxjs';
import { CurrencyMasterModalSearch } from '../../../Model/CurrencyMaster/currency-master.model';
import { App } from '../../../app';

@Component({
  selector: 'currency-master',
  standalone: false,
  templateUrl: './currency-master.html',
  styleUrls: ['./currency-master.css','../../common.css']
})

export class CurrencyMaster {

  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  subscription: Subscription[];
  showModalSearch: boolean = false;
  currencyMasterModalSearch:CurrencyMasterModalSearch;

  constructor(public app:App,public currencyMasterService:CurrencyMasterService,private alertService:AlertService) {
    this.subscription = new Array<Subscription>();
    this.currencyMasterModalSearch =  new CurrencyMasterModalSearch();
    this.subscription.push(this.currencyMasterService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
    }));

    const subs = [
      { obs: this.currencyMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.currencyMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.currencyMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
  }

  ngOnInit(): void {
   
  }
  
  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  buttonClick(type: 'N' | 'M' | 'D') {
    if(type != 'D'){
      this.newDisable = true;
      this.modifyDisable = true;
      this.deleteDisable = true;
      this.searchDisable = true;
      this.currencyMasterService.disableGrid.next(true);
    }
    this.currencyMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.currencyMasterModalSearch.cur_name = null; 
    this.currencyMasterModalSearch.cur_desc = null; 
  }

  modalSearch() {
    const model = {
      cur_name: this.currencyMasterModalSearch.cur_name?.trim() || '',
      cur_desc: this.currencyMasterModalSearch.cur_desc?.trim() || ''
    };

    this.currencyMasterService.isLoading.next(true);
    this.currencyMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.currencyMasterModalSearch.cur_name = null;
      this.currencyMasterModalSearch.cur_desc = null;
      this.currencyMasterService.isLoading.next(false);
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.currencyMasterService.ngOnInit.next(true);
  }
}

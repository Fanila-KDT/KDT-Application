import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SupplierMasterModalSearch } from '../../../Model/SupplierMaster/supplier-master.model';
import { SupplierMasterService } from '../../../Service/SupplierMasterService/supplier-master-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { App } from '../../../app';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'supplier-master',
  standalone: false,
  templateUrl: './supplier-master.html',
  styleUrls: ['./supplier-master.css','../../common.css']
})
export class SupplierMaster {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  subscription: Subscription[];
  showModalSearch: boolean = false;
  supplierMasterModalSearch:SupplierMasterModalSearch;
  
  constructor(public app:App,public supplierMasterService:SupplierMasterService,private alertService:AlertService,private accessService: UserAccessService) {
    this.subscription = new Array<Subscription>();
    this.supplierMasterModalSearch =  new SupplierMasterModalSearch();
    this.subscription.push(this.supplierMasterService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
    }));

    const subs = [
      { obs: this.supplierMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.supplierMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.supplierMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.supplierMasterService.disableGrid.next(true);
    }
    this.supplierMasterService.btnClick.next(type);
  }

   Search(){
    this.showModalSearch = true;
  }

    modalCancel(){
    this.showModalSearch = false;
    this.supplierMasterModalSearch.account_name = null; 
    this.supplierMasterModalSearch.account_description = null; 
  }

  modalSearch() {
    const model = {
      ac_code: this.supplierMasterModalSearch.ac_code?.toString().trim() || '',
      account_description: this.supplierMasterModalSearch.account_description?.trim() || '',
      account_name: this.supplierMasterModalSearch.account_name?.trim() || ''
    };

    this.supplierMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.supplierMasterModalSearch.ac_code = null;
      this.supplierMasterModalSearch.account_description = null;
      this.supplierMasterModalSearch.account_name = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
      this.alertService.triggerAlert('Something went wrong while Searching...',4000, 'error');
    });
  }

    Refresh(){
      this.supplierMasterService.ngOnInit.next(true);
    }
}

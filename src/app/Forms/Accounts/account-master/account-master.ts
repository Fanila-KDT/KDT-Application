import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../shared/alert/alert.service';
import { AccountMasterModalSearch } from '../../../Model/AccountMaster/account-master.model';
import { AccountMasterService } from '../../../Service/AccountMasterService/account-master-service';
import { App } from '../../../app';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';
import { Router } from '@angular/router';

@Component({
  selector: 'account-master',
  standalone: false,
  templateUrl: './account-master.html',
  styleUrls: ['./account-master.css', '../../common.css']
})
export class AccountMaster {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  subscription: Subscription[];
  showModalSearch: boolean = false;
  accountMasterModalSearch:AccountMasterModalSearch;

  
  constructor(public app:App,public accountMasterService:AccountMasterService,private alertService:AlertService,private accessService: UserAccessService, private router: Router) {
    this.subscription = new Array<Subscription>();
    this.accountMasterModalSearch =  new AccountMasterModalSearch();

    this.subscription.push(this.accountMasterService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
    }));

    const subs = [
      { obs: this.accountMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.accountMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.accountMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.accountMasterService.disableGrid.next(true);
    }
    this.accountMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.accountMasterModalSearch.account_name = null; 
    this.accountMasterModalSearch.account_description = null; 
  }

  modalSearch() {
    const model = {
      ac_code: this.accountMasterModalSearch.ac_code?.toString().trim() || '',
      account_description: this.accountMasterModalSearch.account_description?.trim() || '',
      account_name: this.accountMasterModalSearch.account_name?.trim() || ''
    };
    this.accountMasterService.isLoading.next(true);
    this.accountMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.accountMasterModalSearch.ac_code = null;
      this.accountMasterModalSearch.account_description = null;
      this.accountMasterModalSearch.account_name = null;
      this.accountMasterService.isLoading.next(false);
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.accountMasterService.ngOnInit.next(true);
  }
}

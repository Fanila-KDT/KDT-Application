import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { App } from '../../../app';
import { AccountSetupService } from '../../../Service/AccountSetupService/account-setup-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-setup',
  standalone: false,
  templateUrl: './account-setup.html',
  styleUrls: ['./account-setup.css','../../common.css']
})
export class AccountSetup {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  refreshDisable: boolean = false;
  gridDisabled: boolean = true;
  subscription: Subscription[];
  
  constructor(public app:App,public accountSetupService:AccountSetupService,private alertService:AlertService,private accessService: UserAccessService, private router: Router) {
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.accountSetupService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
    }));

    const subs = [
      { obs: this.accountSetupService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.accountSetupService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.accountSetupService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.accountSetupService.disableGrid.next(true);
    }
    this.accountSetupService.btnClick.next(type);
  }

  Refresh(){
    this.accountSetupService.ngOnInit.next(true);
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.accountSetupService.disableGrid.next(this.gridDisabled);
  }
}

import { Component } from '@angular/core';
import { App } from '../../../app';
import { EngineerMasterService } from '../../../Service/EngineerMasterService/engineer-master-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';
import { EngineerMasterSearch } from '../../../Model/EngineerMaster/engineer-master.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-engineer-master',
  standalone: false,
  templateUrl: './engineer-master.html',
  styleUrls: ['./engineer-master.css','../../common.css']
})
export class EngineerMaster {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  engineerMasterSearch:EngineerMasterSearch = new EngineerMasterSearch();
  subscription: Subscription[]= new Array<Subscription>();

  constructor(public app:App,public engineerMasterService:EngineerMasterService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.engineerMasterService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.engineerMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.engineerMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.engineerMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.engineerMasterService.disableGrid.next(true);
    }
    this.engineerMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalSearch(){
    const model = {
      inactive:this.engineerMasterSearch.inactive, 
      docuware_active:this.engineerMasterSearch.docuware_active,
      active:this.engineerMasterSearch.active,
    };

    this.engineerMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.engineerMasterSearch.inactive = null;
      this.engineerMasterSearch.docuware_active = null;
      this.engineerMasterSearch.active = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  modalCancel(){
    this.showModalSearch = false;
    this.engineerMasterSearch.inactive = null;
    this.engineerMasterSearch.docuware_active = null;
    this.engineerMasterSearch.active = null;

  }

  Refresh(){
    this.engineerMasterService.ngOnInit.next(true);
    this.searchDisable =  false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.engineerMasterService.disableGrid.next(this.gridDisabled);
  }
}

import { Component } from '@angular/core';
import { SalesLeadSearch } from '../../../Model/SalesLead/sales-lead.model';
import { Subscription } from 'rxjs';
import { SalesLeadService } from '../../../Service/SalesLeadService/sales-lead-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'app-sales-lead',
  standalone: false,
  templateUrl: './sales-lead.html',
  styleUrls: ['./sales-lead.css','../../common.css']
})
export class SalesLead {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  salesLeadSearch:SalesLeadSearch = new SalesLeadSearch();
  subscription: Subscription[]= new Array<Subscription>();
  AreaList: any[] = [];

  constructor(public salesLeadService:SalesLeadService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.salesLeadService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.salesLeadService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.salesLeadService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.salesLeadService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.salesLeadService.disableGrid.next(true);
    }
    this.salesLeadService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
    // this.AreaList =  this.salesLeadService.AreaList;
  }

  modalSearch(){
  //   const model = {
  //     area_id:this.salesLeadSearch.area_id,
  //     inactive:this.salesLeadSearch.inactive,
  //     dead:this.salesLeadSearch.dead,
  //     verified:this.salesLeadSearch.verified
  //   };

  //   this.salesLeadService.SearchList(model)
  //   .then(() => {
  //    this.showModalSearch = false;
  //     this.salesLeadSearch.area_id = null;
  //     this.salesLeadSearch.inactive = null;
  //     this.salesLeadSearch.dead = null;
  //     this.salesLeadSearch.verified = null;
  //   })
  //   .catch(error => {
  //    console.error('Error while searching:', error);
  //  });
  }

  modalCancel(){
    // this.showModalSearch = false;
    // this.salesLeadSearch.area_id = null;
    // this.salesLeadSearch.inactive = null;
    // this.salesLeadSearch.dead = null;
    // this.salesLeadSearch.verified = null;
  }

  Refresh(){
    this.salesLeadService.ngOnInit.next(true);
    this.searchDisable =  false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.salesLeadService.disableGrid.next(this.gridDisabled);
  }
}

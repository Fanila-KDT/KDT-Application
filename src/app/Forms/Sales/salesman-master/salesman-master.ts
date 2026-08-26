import { Component } from '@angular/core';
import { SalesmanMasterSearch } from '../../../Model/SalesmanMaster/salesman-master.model';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../Service/CommonService/common-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { App } from '../../../app';
import { SalesmanMasterService } from '../../../Service/SalesmanMasterService/salesman-master-service';

@Component({
  selector: 'salesman-master',
  standalone: false,
  templateUrl: './salesman-master.html',
  styleUrls: ['./salesman-master.css','../../common.css']
})
export class SalesmanMaster {
 newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  salesmanMasterSearch:SalesmanMasterSearch = new SalesmanMasterSearch();
  subscription: Subscription[]= new Array<Subscription>();
  AreaGropList:any[] = [];
  CategoryList : string[] = [ 'OP', 'RGC'];

  constructor(public app:App,public salesmanMasterService:SalesmanMasterService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.salesmanMasterService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.salesmanMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.salesmanMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.salesmanMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.salesmanMasterService.disableGrid.next(true);
    }
    this.salesmanMasterService.btnClick.next(type);
  }
  
  Search(){
    this.showModalSearch = true;
    this.AreaGropList = this.salesmanMasterService.AreaGropList;
  }
  
  modalCancel(){
    this.showModalSearch = false;
    this.salesmanMasterSearch.group_id = null; 
    this.salesmanMasterSearch.area_code = null;
    this.salesmanMasterSearch.active = null;
    this.salesmanMasterSearch.cash_invoice = null;
    this.salesmanMasterSearch.sales_dept = null;
    this.salesmanMasterSearch.callcenter_agent = null;
    this.salesmanMasterSearch.manager = null;
    this.salesmanMasterSearch.service_dept = null;
  }

  modalSearch(){
     const model = {
      group_id:this.salesmanMasterSearch.group_id, 
      area_code:this.salesmanMasterSearch.area_code,
      active:this.salesmanMasterSearch.active,
      cash_invoice:this.salesmanMasterSearch.cash_invoice,
      sales_dept:this.salesmanMasterSearch.sales_dept,
      callcenter_agent:this.salesmanMasterSearch.callcenter_agent,
      manager:this.salesmanMasterSearch.manager,
      service_dept:this.salesmanMasterSearch.service_dept
    };

    this.salesmanMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.salesmanMasterSearch.group_id = null; 
      this.salesmanMasterSearch.area_code = null;
      this.salesmanMasterSearch.active = null;
      this.salesmanMasterSearch.cash_invoice = null;
      this.salesmanMasterSearch.sales_dept = null;
      this.salesmanMasterSearch.callcenter_agent = null;
      this.salesmanMasterSearch.service_dept = null;
      this.salesmanMasterSearch.manager = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.salesmanMasterService.ngOnInit.next(true);
    this.searchDisable =  false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.salesmanMasterService.disableGrid.next(this.gridDisabled);
  }
}

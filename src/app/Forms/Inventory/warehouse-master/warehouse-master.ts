import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { WarehouseMasterModalSearch } from '../../../Model/WarehouseMaster/warehouse-master.model';
import { WarehouseMasterService } from '../../../Service/WarehouseMasterService/warehouse-master-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { App } from '../../../app';

@Component({
  selector: 'warehouse-master',
  standalone: false,
  templateUrl: './warehouse-master.html',
  styleUrls: ['./warehouse-master.css','../../common.css']
})
export class WarehouseMaster {

  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  gridDisabled: boolean = false;
  gridDisable: boolean = false;
  subscription: Subscription[];
  showModalSearch: boolean = false;
  warehouseMasterModalSearch:WarehouseMasterModalSearch;

  constructor(public app:App,public warehouseMasterService:WarehouseMasterService,private alertService:AlertService) {
    this.subscription = new Array<Subscription>();
    this.warehouseMasterModalSearch =  new WarehouseMasterModalSearch();
    this.subscription.push(this.warehouseMasterService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
      this.gridDisable = data;
    }));

    const subs = [
      { obs: this.warehouseMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.warehouseMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.warehouseMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.gridDisable = true;
      this.warehouseMasterService.disableGrid.next(true);
    }
    this.warehouseMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.warehouseMasterModalSearch.godown_name = null; 
    this.warehouseMasterModalSearch.godown_name_abbr = null; 
  }

  modalSearch(){
    const model = {
      godown_name: this.warehouseMasterModalSearch.godown_name?.trim() || '',
      godown_name_abbr: this.warehouseMasterModalSearch.godown_name_abbr?.trim() || ''
    };

    this.warehouseMasterService.isLoading.next(true);
    this.warehouseMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.warehouseMasterModalSearch.godown_name = null;
      this.warehouseMasterModalSearch.godown_name_abbr = null;
      this.warehouseMasterService.isLoading.next(false);
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
   this.warehouseMasterService.ngOnInit.next(true);
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.warehouseMasterService.disableGrid.next(this.gridDisabled);
  }

}

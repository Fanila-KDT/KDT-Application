import { Component } from '@angular/core';
import { TagMasterSearch } from '../../../Model/TagMaster/tag-master.model';
import { Subscription } from 'rxjs';
import { TagMasterService } from '../../../Service/TagMasterService/tag-master-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'tag-master',
  standalone: false,
  templateUrl: './tag-master.html',
  styleUrls: ['./tag-master.css','../../common.css']
})
export class TagMaster {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  tagMasterSearch:TagMasterSearch = new TagMasterSearch();
  subscription: Subscription[]= new Array<Subscription>();
  AreaList: any[] = [];

  constructor(public tagMasterService:TagMasterService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.tagMasterService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.tagMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.tagMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.tagMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.tagMasterService.disableGrid.next(true);
    }
    this.tagMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
    this.AreaList =  this.tagMasterService.AreaList;
  }

  modalSearch(){
    const model = {
      area_id:this.tagMasterSearch.area_id,
      inactive:this.tagMasterSearch.inactive,
      dead:this.tagMasterSearch.dead,
      verified:this.tagMasterSearch.verified
    };

    this.tagMasterService.SearchList(model)
    .then(() => {
     this.showModalSearch = false;
      this.tagMasterSearch.area_id = null;
      this.tagMasterSearch.inactive = null;
      this.tagMasterSearch.dead = null;
      this.tagMasterSearch.verified = null;
    })
    .catch(error => {
     console.error('Error while searching:', error);
   });
  }

  modalCancel(){
    this.showModalSearch = false;
    this.tagMasterSearch.area_id = null;
    this.tagMasterSearch.inactive = null;
    this.tagMasterSearch.dead = null;
    this.tagMasterSearch.verified = null;
  }

  Refresh(){
    this.tagMasterService.ngOnInit.next(true);
    this.searchDisable =  false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.tagMasterService.disableGrid.next(this.gridDisabled);
  }
}

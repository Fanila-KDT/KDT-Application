import { Component } from '@angular/core';
import { AreaMasterSearch } from '../../../Model/AreaMaster/area-master.model';
import { Subscription } from 'rxjs';
import { AreaMasterService } from '../../../Service/AreaMasterService/area-master-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'app-area-master',
  standalone: false,
  templateUrl: './area-master.html',
  styleUrls: ['./area-master.css','../../common.css']
})
export class AreaMaster {
  newDisable: boolean = false;
   modifyDisable: boolean = false;
   deleteDisable: boolean = false;
   searchDisable: boolean = false;
   refreshDisable: boolean = false;
   showModalSearch: boolean = false;
   gridDisabled: boolean = false;
   areaMasterSearch:AreaMasterSearch = new AreaMasterSearch();
   subscription: Subscription[]= new Array<Subscription>();
   AreaList: any[] = [];
 
   constructor(public areaMasterService:AreaMasterService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.areaMasterService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.areaMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.areaMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.areaMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
       this.areaMasterService.disableGrid.next(true);
     }
     this.areaMasterService.btnClick.next(type);
   }
 
   Search(){
     this.showModalSearch = true;
     this.AreaList =  this.areaMasterService.AreaList;
   }
 
   modalSearch(){
     const model = {
       group_id:this.areaMasterSearch.group_id
     };
 
     this.areaMasterService.SearchList(model)
     .then(() => {
       this.showModalSearch = false;
       this.areaMasterSearch.group_id = null;
     })
     .catch(error => {
       console.error('Error while searching:', error);
     });
   }
 
   modalCancel(){
     this.showModalSearch = false;
     this.areaMasterSearch.group_id = null;
   }
 
   Refresh(){
     this.areaMasterService.ngOnInit.next(true);
     this.searchDisable =  false;
   }
 
   toggleValue(){
     this.gridDisabled = !this.gridDisabled; 
     this.areaMasterService.disableGrid.next(this.gridDisabled);
   }
}

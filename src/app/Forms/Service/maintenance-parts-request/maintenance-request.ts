import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';
import { App } from '../../../app';
import { MaintenanceRequestService } from '../../../Service/MaintenanceRequestService/maintenance-request-service';

@Component({
  selector: 'app-maintenance-request',
  standalone: false,
  templateUrl: './maintenance-request.html',
  styleUrls: ['./maintenance-request.css','../../common.css']
})
export class MaintenanceRequest {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  refreshDisable: boolean = false;
  gridDisabled: boolean = false;
  years: any[] = [];
  year: number = new Date().getFullYear(); 
  yearDisable: boolean = false;
  matchyear: any = null;
  subscription: Subscription[];
  
  constructor(public app:App,public maintenanceRequest:MaintenanceRequestService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.maintenanceRequest.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.yearDisable = data;
    }));

    const subs = [
      { obs: this.maintenanceRequest.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.maintenanceRequest.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.maintenanceRequest.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
  }

  ngOnInit(): void {
    this.getYear();
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);
    this.maintenanceRequest.disableGrid.next(false);
    this.gridDisabled = false;
    const match = this.years.find(y => y.period_id == event);
    if (match) {
      this.year = match.period_id; 
      sessionStorage.setItem('year',this.year.toString());
      sessionStorage.setItem('period_from',match.period_from.toString());
      sessionStorage.setItem('period_to',match.period_to.toString());
      sessionStorage.setItem('period_status',match.period_status.toString());
      sessionStorage.setItem('data_entry_status',match.data_entry_status.toString());
    }
    this.maintenanceRequest.GetMaintenanceRequestList(event,1);
  }

  getYear(){
    this.commonService.getYears().then(async(res: any) => {
      this.years = res;
      const currentYear = new Date().getFullYear();
      const match = this.years.find(y => y.period_name === currentYear);
      this.matchyear = match;
      if (match) {
        this.year = match.period_id; // set to the matching GUID
        sessionStorage.setItem('year',this.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
        sessionStorage.setItem('currentYear',this.year.toString());
        sessionStorage.setItem('period_status',match.period_status.toString());
        sessionStorage.setItem('data_entry_status',match.data_entry_status.toString());
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  buttonClick(type: 'N' | 'M' | 'D') {
    if(type != 'D'){
      this.newDisable = true;
      this.modifyDisable = true;
      this.deleteDisable = true;
      this.yearDisable = true;
      this.maintenanceRequest.disableGrid.next(true);
    }
    this.maintenanceRequest.btnClick.next(type);
  }

  Refresh(){
    this.maintenanceRequest.ngOnInit.next(true);
    this.yearDisable = false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.maintenanceRequest.disableGrid.next(this.gridDisabled);
  }
}

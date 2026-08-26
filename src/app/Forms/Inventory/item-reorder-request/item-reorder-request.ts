import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ItemReorderRequestService } from '../../../Service/ItemReorderRequestService/item-reorder-request-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';
import { App } from '../../../app';
import { ItemReorderRequestSearch } from '../../../Model/ItemReorderRequest/item-reorder-request.model';

@Component({
  selector: 'item-reorder-request',
  standalone: false,
  templateUrl: './item-reorder-request.html',
  styleUrls: ['./item-reorder-request.css', '../../common.css']
})
export class ItemReorderRequest {
yearDisable: boolean = false;
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  years: any[] = [];
  year: number = new Date().getFullYear(); 
  itemReorderRequestSearch:ItemReorderRequestSearch = new ItemReorderRequestSearch();
  subscription: Subscription[]= new Array<Subscription>();

  constructor(public app:App,public itemReorderRequestService:ItemReorderRequestService,private alertService:AlertService,public commonService:CommonService) {
     this.subscription.push(this.itemReorderRequestService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.itemReorderRequestService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.itemReorderRequestService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.itemReorderRequestService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
    this.getYear();
  }

  buttonClick(type: 'M' |'D'|'N') {
    if(type != 'D'){
      this.modifyDisable = true;
      this.searchDisable = true;
      this.yearDisable = true;
      this.deleteDisable = true;
      this.refreshDisable = true;
      this.newDisable = true;
      this.itemReorderRequestService.disableGrid.next(true);
    }
    this.itemReorderRequestService.btnClick.next(type);
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);
    this.itemReorderRequestService.disableGrid.next(false);
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
    this.itemReorderRequestService.getItemReorderRequestList(event,1);
  }

  getYear(){
    this.commonService.getYears().then(async(res: any) => {
      this.years = res;
      const currentYear = new Date().getFullYear();
      const match = this.years.find(y => y.period_name === currentYear);
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

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.itemReorderRequestSearch.status = null; 
    this.itemReorderRequestSearch.document_number = null;
  }

  modalSearch() {
     const model = {
      status: this.itemReorderRequestSearch.status,
      document_number: this.itemReorderRequestSearch.document_number,
    };

    this.itemReorderRequestService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.itemReorderRequestSearch.status = null;
      this.itemReorderRequestSearch.document_number = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.itemReorderRequestService.ngOnInit.next(true);
    this.searchDisable =  false;
    this.yearDisable = false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.itemReorderRequestService.disableGrid.next(this.gridDisabled);
  }
  
}

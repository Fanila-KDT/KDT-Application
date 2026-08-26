import { Component } from '@angular/core';
import { StockTakingSearch } from '../../../Model/StockTaking/stock-taking.model';
import { Subscription } from 'rxjs';
import { App } from '../../../app';
import { StockTakingService } from '../../../Service/StockTakingService/stock-taking-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'app-stock-taking',
  standalone: false,
  templateUrl: './stock-taking.html',
  styleUrls: ['./stock-taking.css','../../common.css']
})
export class StockTaking {
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
  stockTakingSearch:StockTakingSearch = new StockTakingSearch();
  subscription: Subscription[]= new Array<Subscription>();

  constructor(public app:App,public stockTakingService:StockTakingService,private alertService:AlertService,public commonService:CommonService) {
      this.subscription.push(this.stockTakingService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
      this.yearDisable = data;
    }));

    const subs = [
      { obs: this.stockTakingService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.stockTakingService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.stockTakingService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.newDisable = true;
      this.refreshDisable = true;
      this.stockTakingService.disableGrid.next(true);
    }
    this.stockTakingService.btnClick.next(type);
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);
    this.stockTakingService.disableGrid.next(false);
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
    this.stockTakingService.getStockTakingList(event,1);
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
    this.stockTakingSearch.approval_status = null; 
    this.stockTakingSearch.document_number = null;
  }

  modalSearch() {
     const model = {
      approval_status: this.stockTakingSearch.approval_status,
      document_number: this.stockTakingSearch.document_number,
    };

    this.stockTakingService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.stockTakingSearch.approval_status = null;
      this.stockTakingSearch.document_number = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.stockTakingService.ngOnInit.next(true);
    this.searchDisable =  false;
    this.yearDisable = false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.stockTakingService.disableGrid.next(this.gridDisabled);
  }
  
}

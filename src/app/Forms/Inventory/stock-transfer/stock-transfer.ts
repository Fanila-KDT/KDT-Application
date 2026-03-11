import { Component } from '@angular/core';
import { CommonService } from '../../../Service/CommonService/common-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { App } from '../../../app';
import { Subscription } from 'rxjs';
import { StockTransferSearch } from '../../../Model/StockTransfer/stock-transfer.model';
import { StockTransferService } from '../../../Service/StockTransferService/stock-transfer-service';

@Component({
  selector: 'stock-transfer',
  standalone: false,
  templateUrl: './stock-transfer.html',
  styleUrls: ['./stock-transfer.css','../../common.css']
})
export class StockTransfer {
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
  stockTransferSearch:StockTransferSearch = new StockTransferSearch();
  subscription: Subscription[]= new Array<Subscription>();

  constructor(public app:App,public stockTransferService:StockTransferService,private alertService:AlertService,public commonService:CommonService) {
     this.subscription.push(this.stockTransferService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
    }));

    const subs = [
      { obs: this.stockTransferService.newDisable, setter: (val: boolean) => this.newDisable = val },
      { obs: this.stockTransferService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.stockTransferService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
      this.stockTransferService.disableGrid.next(true);
    }
    this.stockTransferService.btnClick.next(type);
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);
    this.stockTransferService.disableGrid.next(false);
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
    this.stockTransferService.getStockTransferList(event,1);
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
    this.stockTransferSearch.approval_status = null; 
    this.stockTransferSearch.document_number = null;
  }

  modalSearch() {
     const model = {
      approval_status: this.stockTransferSearch.approval_status,
      document_number: this.stockTransferSearch.document_number,
    };

    this.stockTransferService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.stockTransferSearch.approval_status = null;
      this.stockTransferSearch.document_number = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.stockTransferService.ngOnInit.next(true);
    this.searchDisable =  false;
    this.yearDisable = false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.stockTransferService.disableGrid.next(this.gridDisabled);
  }
  
}

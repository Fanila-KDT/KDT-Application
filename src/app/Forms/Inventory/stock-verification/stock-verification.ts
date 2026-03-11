import { Component } from '@angular/core';
import { StockVerificationMSearch } from '../../../Model/StockVerification/stock-verification.model';
import { Subscription } from 'rxjs';
import { App } from '../../../app';
import { StockVerificationService } from '../../../Service/StockVerificationService/stock-verification-service';
import { CommonService } from '../../../Service/CommonService/common-service';
import { AlertService } from '../../../shared/alert/alert.service';

@Component({
  selector: 'stock-verification',
  standalone: false,
  templateUrl: './stock-verification.html',
  styleUrls: ['./stock-verification.css','../../common.css']
})
export class StockVerification {
  yearDisable: boolean = false;
  modifyDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  gridDisabled: boolean = false;
  showModalSearch: boolean = false;
  stockVerificationSearch:StockVerificationMSearch = new StockVerificationMSearch();
  subscription: Subscription[]= new Array<Subscription>();
  years: any[] = [];
  year: number = new Date().getFullYear(); 

  constructor(public app:App,public stockVerificationService:StockVerificationService,private alertService:AlertService,public commonService:CommonService) {

    this.subscription.push(this.stockVerificationService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
    }));

    const subs = [
      { obs: this.stockVerificationService.editDisabled, setter: (val: boolean) => this.modifyDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
    
    this.getYear();
  }

  ngOnInit() {
   
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);

    const match = this.years.find(y => y.period_id == event);
      if (match) {
        this.year = match.period_id; 
        sessionStorage.setItem('year',this.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
        sessionStorage.setItem('period_status',match.period_status.toString());
        sessionStorage.setItem('data_entry_status',match.data_entry_status.toString());
      }
      this.stockVerificationService.getStockVerificationList(event);
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

   buttonClick(type: 'M') {
    this.modifyDisable = true;
    this.searchDisable = true;
    this.yearDisable = true;
    this.stockVerificationService.disableGrid.next(true);
    this.stockVerificationService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.stockVerificationSearch.po_no = null; 
    this.stockVerificationSearch.document_number = null;
    this.stockVerificationSearch.approval_status = null;
  }

  modalSearch() {
     const model = {
      po_no: this.stockVerificationSearch.po_no,
      document_number: this.stockVerificationSearch.document_number,
      approval_status: this.stockVerificationSearch.approval_status
    };

    this.stockVerificationService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.stockVerificationSearch.po_no = null;
      this.stockVerificationSearch.document_number = null;
      this.stockVerificationSearch.approval_status = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.stockVerificationService.ngOnInit.next(true);
    this.getYear();
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.stockVerificationService.disableGrid.next(this.gridDisabled);
  }
}

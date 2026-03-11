import { Component } from '@angular/core';
import { CommonService } from '../../../Service/CommonService/common-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { Subscription } from 'rxjs';
import { ExpenseEntryService } from '../../../Service/ExpenseEntryService/expense-entry-service';
import { App } from '../../../app';
import { ExpenseEntrySearch } from '../../../Model/ExpenseEntry/expense-entry.model';

@Component({
  selector: 'expense-entry',
  standalone: false,
  templateUrl: './expense-entry.html',
  styleUrls: ['./expense-entry.css', '../../common.css']
})
export class ExpenseEntry {
  yearDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  expenseEntrySearch:ExpenseEntrySearch = new ExpenseEntrySearch();
  subscription: Subscription[]= new Array<Subscription>();
  years: any[] = [];
  year: number = new Date().getFullYear(); 

  constructor(public app:App,public expenseEntryService:ExpenseEntryService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.expenseEntryService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
    }));

    const subs = [
      { obs: this.expenseEntryService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.expenseEntryService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
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
    this.expenseEntryService.disableGrid.next(false);
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
      this.expenseEntryService.getExpenseEntryList(event,1);
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

  buttonClick(type: 'M' |'D') {
    if(type != 'D'){
      this.modifyDisable = true;
      this.searchDisable = true;
      this.yearDisable = true;
      this.deleteDisable = true;
      this.expenseEntryService.disableGrid.next(true);
    }
    this.expenseEntryService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.expenseEntrySearch.ref_grn = null; 
    this.expenseEntrySearch.document_number = null;
  }

  modalSearch() {
     const model = {
      ref_grn: this.expenseEntrySearch.ref_grn,
      document_number: this.expenseEntrySearch.document_number,
    };

    this.expenseEntryService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.expenseEntrySearch.ref_grn = null;
      this.expenseEntrySearch.document_number = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.expenseEntryService.ngOnInit.next(true);
    //this.getYear();
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.expenseEntryService.disableGrid.next(this.gridDisabled);
  }
  
}

import { Component } from '@angular/core';
import { SalesInvoiceSearch } from '../../../Model/SalesInvoice/sales-invoice.model';
import { Subscription } from 'rxjs';
import { SalesInvoiceService } from '../../../Service/SalesInvoiceService/sales-invoice-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'sales-invoice',
  standalone: false,
  templateUrl: './sales-invoice.html',
  styleUrls: ['./sales-invoice.css','../../common.css']
})
export class SalesInvoice {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  salesInvoiceSearch:SalesInvoiceSearch = new SalesInvoiceSearch();
  subscription: Subscription[]= new Array<Subscription>();
  AreaList: any[] = [];
  years: any[] = [];
  year: number = new Date().getFullYear(); 
  yearDisable: boolean = false;
  matchyear: any = null;

  constructor(public salesInvoiceService:SalesInvoiceService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.salesInvoiceService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.salesInvoiceService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.salesInvoiceService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.salesInvoiceService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.getYear();
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);
    this.salesInvoiceService.disableGrid.next(false);
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
    this.salesInvoiceService.getSalesInvoiceList(event,1);
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

 
  buttonClick(type: 'M' |'D'|'N') {
    if(type != 'D'){
      this.modifyDisable = true;
      this.searchDisable = true;
      this.deleteDisable = true;
      this.newDisable = true;
      this.refreshDisable = true;
      this.salesInvoiceService.disableGrid.next(true);
    }
    this.salesInvoiceService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
    // this.AreaList =  this.salesInvoiceService.AreaList;
  }

  modalSearch(){
  //   const model = {
  //     area_id:this.salesInvoiceSearch.area_id,
  //     inactive:this.salesInvoiceSearch.inactive,
  //     dead:this.salesInvoiceSearch.dead,
  //     verified:this.salesInvoiceSearch.verified
  //   };

  //   this.salesInvoiceService.SearchList(model)
  //   .then(() => {
  //    this.showModalSearch = false;
  //     this.salesInvoiceSearch.area_id = null;
  //     this.salesInvoiceSearch.inactive = null;
  //     this.salesInvoiceSearch.dead = null;
  //     this.salesInvoiceSearch.verified = null;
  //   })
  //   .catch(error => {
  //    console.error('Error while searching:', error);
  //  });
  }

  modalCancel(){
    // this.showModalSearch = false;
    // this.salesInvoiceSearch.area_id = null;
    // this.salesInvoiceSearch.inactive = null;
    // this.salesInvoiceSearch.dead = null;
    // this.salesInvoiceSearch.verified = null;
  }

  Refresh(){
    this.salesInvoiceService.ngOnInit.next(true);
    this.searchDisable =  false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.salesInvoiceService.disableGrid.next(this.gridDisabled);
  }
}

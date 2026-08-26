import { Component } from '@angular/core';
import { DeliveryNoteSearch } from '../../../Model/DeliveryNote/delivery-note.model';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { EndPointService } from '../../../Service/end-point.services';
import { App } from '../../../app';
import { DeliveryNoteService } from '../../../Service/DeliveryNoteService/delivery-note-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'delivery-note',
  standalone: false,
  templateUrl: './delivery-note.html',
  styleUrls: ['./delivery-note.css','../../common.css']
})
export class DeliveryNote {
  yearDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  years: any[] = [];
  year: number = new Date().getFullYear(); 
  matchyear: any = null;
  salesQuotationSearch:DeliveryNoteSearch = new DeliveryNoteSearch();
  subscription: Subscription[]= new Array<Subscription>();
  showModalPrint: boolean = false;
  reportType: string = '2';
  StatusType: string = 'approve';
  status_remarks:any;

   constructor(private router: Router,public endPointService:EndPointService,public app:App,public salesQuotationService:DeliveryNoteService,
                private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.salesQuotationService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.salesQuotationService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.salesQuotationService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val },
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
  }

  async ngOnInit(){
    this.getYear();
  }
  
  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.year = this.matchyear.period_id; // set to the this.matchyearing GUID
    sessionStorage.setItem('year',this.year.toString());
    sessionStorage.setItem('period_from',this.matchyear.period_from.toString());
    sessionStorage.setItem('period_to',this.matchyear.period_to.toString());
    sessionStorage.setItem('currentYear',this.year.toString());
    sessionStorage.setItem('period_status',this.matchyear.period_status.toString());
    sessionStorage.setItem('data_entry_status',this.matchyear.data_entry_status.toString());
  }

  buttonClick(type: 'M' |'D'|'N') {
    if(type != 'D'){
      this.modifyDisable = true;
      this.searchDisable = true;
      this.yearDisable = true;
      this.deleteDisable = true;
      this.refreshDisable = true;
      this.salesQuotationService.disableGrid.next(true);
    }
    this.salesQuotationService.btnClick.next(type);
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);
    this.salesQuotationService.disableGrid.next(false);
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
    this.salesQuotationService.getDeliveryNoteList(event,1);
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

  Search() {
    this.showModalSearch = true;
    this.showModalPrint = false;
  }

  print() {
    this.showModalPrint = true;
    this.showModalSearch = false;
  }

  modalCancel(type?: 'search' | 'print' | 'status') {
    if (type === 'search') {
      this.showModalSearch = false;
      this.salesQuotationSearch.payterm_id = null;
      this.salesQuotationSearch.new = false;
      this.salesQuotationSearch.warranty = null;
      this.salesQuotationSearch.delivery = null;
      this.showModalSearch = false;
    } else if (type === 'print') {
      this.showModalPrint = false;
    }else {
      this.showModalSearch = false;
      this.showModalPrint = false;
    }
  }

  modalSearch() {
     const model = {
      payterm_id: this.salesQuotationSearch.payterm_id,
      new: this.salesQuotationSearch.new,
      warranty: this.salesQuotationSearch.warranty,
      delivery: this.salesQuotationSearch.delivery,
    };

    // this.salesQuotationService.SearchList(model)
    // .then(() => {
    //   this.showModalSearch = false;
    //   this.salesQuotationSearch.payterm_id = null;
    //   this.salesQuotationSearch.new = false;
    //   this.salesQuotationSearch.warranty = null;
    //   this.salesQuotationSearch.delivery = null;
    // })
    // .catch(error => {
    //   console.error('Error while searching:', error);
    // });
  }

  Refresh(){
    this.salesQuotationService.ngOnInit.next(true);
    this.searchDisable =  false;
    this.yearDisable = false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.salesQuotationService.disableGrid.next(this.gridDisabled);
  }

  printReport(){
    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; //13
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();

    params.append("reportType", this.reportType);
   // params.append("voucher_id", this.salesQuotationService.item.voucher_id?? null);
    params.append("kdt_logo",  this.endPointService.Report_logo);

    const finalUrl = apiHostingURL + "&" + params.toString();
    window.open(finalUrl, "_blank");
    this.showModalPrint = false;
  }
}

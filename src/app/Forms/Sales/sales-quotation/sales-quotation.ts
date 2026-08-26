import { Component } from '@angular/core';
import { SalesQuotationSearch } from '../../../Model/SalesQuotation/sales-quotation.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EndPointService } from '../../../Service/end-point.services';
import { App } from '../../../app';
import { SalesQuotationService } from '../../../Service/SalesQuotationService/sales-quotation-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sales-quotation',
  standalone: false,
  templateUrl: './sales-quotation.html',
  styleUrls: ['./sales-quotation.css','../../common.css']
})
export class SalesQuotation {
  yearDisable: boolean = false;
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  changeStatus: boolean = false;
  years: any[] = [];
  year: number = new Date().getFullYear(); 
  matchyear: any = null;
  salesQuotationSearch:SalesQuotationSearch = new SalesQuotationSearch();
  subscription: Subscription[]= new Array<Subscription>();
  showModalPrint: boolean = false;
  showModalStatus: boolean = false;
  reportType: string = '2';
  StatusType: string = 'approve';
  status_remarks:any;
  PaymentTypeList:any[]=[];

  constructor(private router: Router,public endPointService:EndPointService,public app:App,public salesQuotationService:SalesQuotationService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.salesQuotationService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
      this.refreshDisable = data;
      this.changeStatus =data ;
    }));

    const subs = [
      { obs: this.salesQuotationService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.salesQuotationService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.salesQuotationService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val },
      { obs: this.salesQuotationService.changeStatus, setter: (val: boolean) => this.changeStatus = val },
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
      this.newDisable = true;
      this.changeStatus = true;
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
    this.salesQuotationService.getSalesQuotationList(event,1);
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
    this.PaymentTypeList = this.salesQuotationService.PaymentTypeList;
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
    }else if (type === 'status') {
      this.showModalStatus = false;
      this.StatusType = 'approve';
      this.status_remarks = null;
    } else {
      this.showModalSearch = false;
      this.showModalPrint = false;
      this.showModalStatus = false;
    }
  }

  modalSearch() {
     const model = {
      payterm_id: this.salesQuotationSearch.payterm_id,
      new: this.salesQuotationSearch.new,
      warranty: this.salesQuotationSearch.warranty,
      delivery: this.salesQuotationSearch.delivery,
    };

    this.salesQuotationService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.salesQuotationSearch.payterm_id = null;
      this.salesQuotationSearch.new = false;
      this.salesQuotationSearch.warranty = null;
      this.salesQuotationSearch.delivery = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
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

  ChangeStatusModal(){
    this.showModalStatus= true;
  }

  async ChangeStatus() {
    let statusCode: number;
    let statusLabel: string;

    switch (this.StatusType) {
      
      case "approve":
        if (!this.salesQuotationService.Approved) {
          this.alertService.triggerAlert('Please approve any of the item', 4000, 'error');
          return;
        }
        statusCode = 1;
        statusLabel = 'Approved';
        break;

      case "lost":
        if (!this.status_remarks) {
          this.alertService.triggerAlert('Please type the remarks', 4000, 'error');
          return;
        }
        statusCode = 2;
        statusLabel = 'Lost';
        break;

      case "reject":
        if (!this.status_remarks) {
          this.alertService.triggerAlert('Please type the remarks', 4000, 'error');
          return;
        }
        statusCode = 3;
        statusLabel = 'Rejected';
        break;

      case "pending":
        statusCode = 4;
        statusLabel = 'Pending';
        break;

      default:
        return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to send for ${this.StatusType} the item?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, send it',
      cancelButtonText: 'No, cancel',
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.salesQuotationService.SendForStatusChange(
            this.salesQuotationService.voucher_id,
            this.status_remarks,
            statusCode
          );
          this.alertService.triggerAlert(`Sent for ${statusLabel} the item`, 4000, 'success');
          await this.salesQuotationService.Status.next([statusLabel,this.status_remarks]);
          this.showModalStatus = false;
          this.status_remarks = null;
          this.StatusType = 'approve';
        } catch (error) {
          console.error('Error while sending status change:', error);
        }
      }
    });
  }

  
}




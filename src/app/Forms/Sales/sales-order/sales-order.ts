import { Component } from '@angular/core';
import { SalesOrderSearch } from '../../../Model/SalesOrder/sales-order.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EndPointService } from '../../../Service/end-point.services';
import { SalesOrderService } from '../../../Service/SalesOrderService/sales-order-service';
import { App } from '../../../app';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';

@Component({
  selector: 'app-sales-order',
  standalone: false,
  templateUrl: './sales-order.html',
  styleUrls: ['./sales-order.css','../../common.css']
})
export class SalesOrder {
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
  matchyear: any = null;
  salesOrderSearch:SalesOrderSearch = new SalesOrderSearch();
  subscription: Subscription[]= new Array<Subscription>();
  showModalPrint: boolean = false;
  showModalStatus: boolean = false;
  reportType: string = '2';
  StatusType: string = 'approve';
  status_remarks:any;
  PaymentTypeList:any[]=[];

  constructor(private router: Router,public endPointService:EndPointService,public app:App,public salesOrderService:SalesOrderService,private alertService:AlertService,public commonService:CommonService) {
    this.subscription.push(this.salesOrderService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.salesOrderService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.salesOrderService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.salesOrderService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val },
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });

    this.getYear();
  }

  async ngOnInit(){
    
  }
  
  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  buttonClick(type: 'M' |'D'|'N') {
    if(type != 'D'){
      this.modifyDisable = true;
      this.searchDisable = true;
      this.yearDisable = true;
      this.deleteDisable = true;
      this.newDisable = true;
      this.refreshDisable = true;
      this.salesOrderService.disableGrid.next(true);
    }
    this.salesOrderService.btnClick.next(type);
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);

    const match = this.years.find(y => y.period_id == event);
      if (match) {
        this.year = match.period_id; 
        sessionStorage.setItem('year',this.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
      }
    if(this.salesOrderService.btnClick.value == ''){
      this.salesOrderService.getSalesOrderList(event,1);
    }
  }

  async getYear(){
    sessionStorage.setItem('year',this.endPointService.year.toString());
    await this.commonService.getYears().then(async(res: any) => {
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
    this.PaymentTypeList = this.salesOrderService.PaymentTypeList;
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
      // this.salesOrderSearch.payterm_id = null;
      // this.salesOrderSearch.new = false;
      // this.salesOrderSearch.warranty = null;
      // this.salesOrderSearch.delivery = null;
      this.showModalSearch = false;
    } else if (type === 'print') {
      this.showModalPrint = false;
    }else {
      this.showModalSearch = false;
      this.showModalPrint = false;
      this.showModalStatus = false;
    }
  }

  modalSearch() {
     const model = {
      // payterm_id: this.salesOrderSearch.payterm_id,
      // new: this.salesOrderSearch.new,
      // warranty: this.salesOrderSearch.warranty,
      // delivery: this.salesOrderSearch.delivery,
    };

    this.salesOrderService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      // this.salesOrderSearch.payterm_id = null;
      // this.salesOrderSearch.new = false;
      // this.salesOrderSearch.warranty = null;
      // this.salesOrderSearch.delivery = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.salesOrderService.ngOnInit.next(true);
    this.searchDisable =  false;
    this.yearDisable = false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.salesOrderService.disableGrid.next(this.gridDisabled);
  }

  printReport(){
    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; //13
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();

    params.append("reportType", this.reportType);
   // params.append("voucher_id", this.salesOrderService.item.voucher_id?? null);
    params.append("kdt_logo",  this.endPointService.Report_logo);

    const finalUrl = apiHostingURL + "&" + params.toString();
    window.open(finalUrl, "_blank");
    this.showModalPrint = false;
  }

  ChangeStatusModal(){
    this.showModalStatus= true;
  }  
}




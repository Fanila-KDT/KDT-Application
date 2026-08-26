import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { POReportModel } from '../../../Model/ReportModel/report-model.model';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReportService } from '../../../Service/ReportService/report-service';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';
import { AlertService } from '../../../shared/alert/alert.service';
import { CommonService } from '../../../Service/CommonService/common-service';
import { EndPointService } from '../../../Service/end-point.services';
import { PurchaseOrderService } from '../../../Service/PurchaseOrderService/purchase-order-service';

@Component({
  selector: 'purchase-order-report',
  standalone: false,
  templateUrl: './purchase-order-report.html',
  styleUrls: ['./purchase-order-report.css','../../common.css']
})
export class PurchaseOrderReport {
  poReportModel: POReportModel = new POReportModel();
  subscription:Subscription[] = new Array<Subscription>()
  categoryList: any[] = [ 'OP', 'RGC'];
  productList: any[] = [];
  subList: any[] = [];
  itemList: any[] = [];
  years: any[] = [];
  registerList: any[] = [];
  vendorList: any[] = [];

  constructor (private router: Router, private purchaseOrderService: PurchaseOrderService, private datePipe: DatePipe, public reportService: ReportService, public userAccessService: UserAccessService,
                private alertService: AlertService, public endPointService:EndPointService, private commonService: CommonService) {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    this.poReportModel.fromDate = firstDayOfYear;
    this.poReportModel.toDate = new Date();
    this.getYear();
  }

  async ngOnInit(){

    this.reportService.getVendorList().then((res: any[]) => {
      this.vendorList = res;
    });

    this.purchaseOrderService.getRegisterList(this.endPointService.companycode).then((res: any[]) => {
      this.registerList = res;
    });

    var temp: any[] = [];

    this.reportService.getSubCategoryList(temp).then((res: any[]) => {
      this.subList = res;
    });

    this.reportService.getCategoryList(temp).then((res: any[]) => {
      this.productList = res;
    });

    const itemList = JSON.parse(sessionStorage.getItem('ItemList')||'');
    this.itemList = itemList.map((item:any) => ({
      ...item,
      combinedLabel: `${item.item_code} - ${item.item_name_abbr}`
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.poReportModel = new POReportModel();
  }

  getYear(){
    this.commonService.getYears().then(async(res: any) => {
      this.years = res;
      const currentYear = new Date().getFullYear();
      const match = this.years.find(y => y.period_name === currentYear);
      if (match) {
        this.poReportModel.year = match.period_id; // set to the matching GUID
        sessionStorage.setItem('year',this.poReportModel.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
        sessionStorage.setItem('currentYear',this.poReportModel.year.toString());
      }
    });
  }
  
  yearChange(event:any){
    sessionStorage.setItem('year',event);

    const match = this.years.find(y => y.period_name == event);
    if (match) {
      this.poReportModel.year = match.period_id; 
      sessionStorage.setItem('year',this.poReportModel.year.toString());
      sessionStorage.setItem('period_from',match.period_from.toString());
      sessionStorage.setItem('period_to',match.period_to.toString());
    }
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.poReportModel.fromDate = date;
    this.yearChange(this.poReportModel.fromDate.getFullYear());
  }

  formatToDateInput(value: string): void {
    this.poReportModel.fromDate = value;
  }

  onDateSelected1(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.poReportModel.toDate = date;
  }

  formatToDateInput1(value: string): void {
    this.poReportModel.toDate = value;
  }

  onSubmit(form: any) {}

  subCategoryChange(event: any) {
    if (this.poReportModel.deptname.length == 0) {
      this.poReportModel.deptname = ''
      this.poReportModel.category_name = '';
      return;
    }

    let category  = event? event:'';
    const categories = category.map((item:any) => item.deptname);
    this.reportService.getCategoryList(categories).then((res:any)=>{
      this.productList = res;
    });
  }

  printReport(reportType: any) {
    if (!this.poReportModel.fromDate || !this.poReportModel.toDate) {
      this.alertService.triggerAlert("Please select both From Date and To Date.", 3000, 'error');
      return;
    }

    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; //20
    const model = this.poReportModel;
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();

    params.append("reportType", reportType);
    params.append("company_code", this.endPointService.companycode.toString());
    params.append("period_id", model.year);
    const from_Date = this.datePipe.transform(model.fromDate, 'MM/dd/yyyy')||'';
    params.append("fromDate", from_Date);
    const to_Date = this.datePipe.transform(model.toDate, 'MM/dd/yyyy')||'';
    params.append("toDate", to_Date);
    params.append("user_id", localStorage.getItem('user_id')??'');

    params.append("pending_reciept", model.pending_reciept ? "1" : "0");
    params.append("register_code", model.register_code?? null);
    params.append("item_no", model.item_no?? null);
    params.append("product_type", model.product_type?? null);
    params.append("category_name", model.category_name?model.category_name.join(","):null);
    params.append("deptname", model.deptname?model.deptname.join(","):null);
    params.append("account_name", model.account_name??null);

    const finalUrl = apiHostingURL + "&" + params.toString();
    window.open(finalUrl, "_blank");
  }
}

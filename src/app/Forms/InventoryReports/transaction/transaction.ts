import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { TransactionReportModel } from '../../../Model/ReportModel/report-model.model';
import { CommonService } from '../../../Service/CommonService/common-service';
import { EndPointService } from '../../../Service/end-point.services';
import { AlertService } from '../../../shared/alert/alert.service';
import { ReportService } from '../../../Service/ReportService/report-service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'transaction',
  standalone: false,
  templateUrl: './transaction.html',
  styleUrls: ['./transaction.css','../../common.css']
})
export class TransactionReport {

  transactionReportModel: TransactionReportModel = new TransactionReportModel();
  subscription:Subscription[] = new Array<Subscription>()
  warehouseList: any[] = [];
  registerList: any[] = [];
  categoryList: any[] = [ 'OP', 'RGC'];
  reasonList: any[] = [ 'Complimentary','Customer Taste','Excess','Expiry','Gift','Others','Scrap','Shortage','Stolen','Unknown','Wastage'];
  vendorList: any[] = [];
  productList: any[] = [];
  subList: any[] = [];
  itemList: any[] = [];
  StockCorrection: boolean = false;
  Vendor: boolean = false;
  ToWarehouse: boolean = false;
  transactiontype: string = 'Transaction Reports';

  constructor (private router: Router,private datePipe: DatePipe,public reportService:ReportService,private alertService: AlertService,
    public endPointService:EndPointService,private commonService: CommonService) {

    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    this.transactionReportModel.fromDate = firstDayOfYear;
    this.transactionReportModel.toDate = new Date();

    this.commonService.getFullWarehouseList(this.endPointService.companycode).then((res: any[]) => {
      this.warehouseList = res;
    });

    this.reportService.getRegisterList().then((res: any[]) => {
      this.registerList = res;
    });

    this.reportService.getVendorList().then((res: any[]) => {
      this.vendorList = res;
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
    this.transactionReportModel = new TransactionReportModel();
  }


  onSubmit(repForm:any){
    
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.transactionReportModel.fromDate = date;
  }

  formatToDateInput(value: string): void {
    this.transactionReportModel.fromDate = value;
  }

  onDateSelected1(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.transactionReportModel.toDate = date;
  }

  formatToDateInput1(value: string): void {
    this.transactionReportModel.toDate = value;
  }

  TransactionTypeChange(type: any): void {
    if(type.length == 1){
      this.StockCorrection = type.includes(200);
      this.Vendor = [31, 151, 41, 181].some(val => type.includes(val));
      this.ToWarehouse = type.includes(81);
      switch(type[0]){
        case 200:
          this.transactiontype = 'Stock Correction Report';
          break;
        case 81:
          this.transactiontype = 'Stock Transfer Report';
          break;
        case 31:
          this.transactiontype = 'Local Purchase Report';
          break;
        case 151:
          this.transactiontype = 'Foreign Purchase Report';
          break;
        case 41:
          this.transactiontype = 'Local Purchase Return Report';
          break;
        case 181:
          this.transactiontype = 'Foreign Purchase Return Report';
          break;
      }
    }else{
      this.StockCorrection = false;
      this.Vendor = false;
      this.ToWarehouse = false;
      this.transactionReportModel.reason = '';
      this.transactionReportModel.account_name = '';
      this.transactionReportModel.transfer_godown_name = '';
      this.transactiontype = 'Transaction Reports'
    }
  }

  subCategoryChange(event: any) {
    if (this.transactionReportModel.deptname.length == 0) {
      this.transactionReportModel.deptname = ''
      this.transactionReportModel.category_name = '';
      return;
    }

    let category  = event? event:'';
    const categories = category.map((item:any) => item.deptname);
    this.reportService.getCategoryList(categories).then((res:any)=>{
      this.productList = res;
    });
  }

  printReport(reportType: string): void {
    if (!this.transactionReportModel.fromDate || !this.transactionReportModel.toDate) {
      this.alertService.triggerAlert("Please select both From Date and To Date.", 3000, 'error');
      return;
    }
    
    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; //19
    const model = this.transactionReportModel;
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();
    params.append("reportType", reportType);
    params.append("transaction_types", this.transactiontype);
    const from_Date = this.datePipe.transform(model.fromDate, 'MM/dd/yyyy')||'';
    params.append("fromDate", from_Date);
    const to_Date = this.datePipe.transform(model.toDate, 'MM/dd/yyyy')||'';
    params.append("toDate", to_Date);
    params.append("company_code", this.endPointService.companycode.toString());
    params.append("user_id", localStorage.getItem('user_id')??'');

    params.append("godown_code", model.godown_code?model.godown_code.join("','"):null);
    params.append("deptname", model.deptname?model.deptname.join("','"):null);
    params.append("category_name", model.category_name?model.category_name.join("','"):null);
    params.append("item_no", model.item_no?model.item_no:null);
    params.append("register_code", model.register_code.join(","));
    params.append("product_type", model.product_type?model.product_type:null);

    params.append("reason", model.reason?? null);
    params.append("account_name", model.account_name?? null);
    params.append("transfer_godown_name", model.transfer_godown_name?? null);

    const godownNames = this.warehouseList
    .filter(w =>  this.transactionReportModel.godown_code.includes(w.godown_code))
    .map(w => w.godown_name);
    params.append("godownName", godownNames?godownNames.join("','"):'');

    const finalUrl = apiHostingURL + "&" + params.toString();

    window.open(finalUrl, "_blank");
  }
}

import { Component } from '@angular/core';
import { StockReportModel } from '../../../Model/ReportModel/report-model.model';
import { CommonService } from '../../../Service/CommonService/common-service';
import { EndPointService } from '../../../Service/end-point.services';
import { AlertService } from '../../../shared/alert/alert.service';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';
import { Subscription } from 'rxjs';
import { ReportService } from '../../../Service/ReportService/report-service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'stock-report',
  standalone: false,
  templateUrl: './stock-report.html',
  styleUrls: ['./stock-report.css','../../common.css'],
})
export class StockReport {
  stockReportModel: StockReportModel = new StockReportModel();
  subscription:Subscription[] = new Array<Subscription>()
  warehouseList: any[] = [];
  mainList: any[] = [];
  categoryList: any[] = [ 'OP', 'RGC'];
  productList: any[] = [];
  subList: any[] = [];
  brandList: any[] = [];
  itemList: any[] = [];
  years: any[] = [];
  //year: number = new Date().getFullYear(); 

  constructor (private router: Router,private datePipe: DatePipe,public reportService:ReportService,public userAccessService:UserAccessService,private alertService: AlertService,
    public endPointService:EndPointService,private commonService: CommonService) {
      const now = new Date();
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      this.stockReportModel.fromDate = firstDayOfYear;
      this.stockReportModel.toDate = new Date();
      this.getYear();
  }

  async ngOnInit() {
    this.commonService.getFullWarehouseList(this.endPointService.companycode).then((res: any[]) => {
      this.warehouseList = res;
    });

    this.reportService.getMainCategoryList().then((res: any[]) => {
      this.mainList = res;
    });

    var temp: any[] = [];

    this.reportService.getSubCategoryList(temp).then((res: any[]) => {
      this.subList = res;
    });

    this.reportService.getCategoryList(temp).then((res: any[]) => {
      this.productList = res;
    });

    this.reportService.getBrandList().then((res: any[]) => {
      this.brandList = res;
    });

    const itemList = JSON.parse(sessionStorage.getItem('ItemList')||'');
    this.itemList = itemList.map((item:any) => ({
      ...item,
      combinedLabel: `${item.item_code} - ${item.item_name_abbr}`
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.stockReportModel = new StockReportModel();
  }

  getYear(){
    this.commonService.getYears().then(async(res: any) => {
      this.years = res;
      const currentYear = new Date().getFullYear();
      const match = this.years.find(y => y.period_name === currentYear);
      if (match) {
        this.stockReportModel.year = match.period_id; // set to the matching GUID
        sessionStorage.setItem('year',this.stockReportModel.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
        sessionStorage.setItem('currentYear',this.stockReportModel.year.toString());
      }
    });
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);

    const match = this.years.find(y => y.period_name == event);
    if (match) {
      this.stockReportModel.year = match.period_id; 
      sessionStorage.setItem('year',this.stockReportModel.year.toString());
      sessionStorage.setItem('period_from',match.period_from.toString());
      sessionStorage.setItem('period_to',match.period_to.toString());
    }
  }

  mainCategoryChange(event: any) {
    if (this.stockReportModel.main_category_code.length  == 0) {
      this.stockReportModel.main_category_code = '';
      this.stockReportModel.deptno = '';        
      this.stockReportModel.category_code = ''; 
      return;
    }

    let subgroups = event?event:'';
    const codes = subgroups.map((item:any) => item.main_category);
    this.reportService.getSubCategoryList(codes).then((res:any)=>{
      this.subList = res;
    });
  }

  subCategoryChange(event: any) {
    if (this.stockReportModel.deptno.length == 0) {
      this.stockReportModel.deptno = ''
      this.stockReportModel.category_code = '';
      return;
    }

    let category  = event? event:'';
    const categories = category.map((item:any) => item.deptname);
    this.reportService.getCategoryList(categories).then((res:any)=>{
      this.productList = res;
    });
  }

  mainCategoryChangeLoc(event: any) {
    if (this.stockReportModel.main_category_code_loc.length  == 0) {
      this.stockReportModel.main_category_code_loc = '';
      this.stockReportModel.deptno_loc = '';        // clear Sub Category
      this.stockReportModel.category_code_loc = ''; // clear Product Class
      return;
    }

    let subgroups = event? event:'';
    const codes = subgroups.map((item:any) => item.main_category_code);
    this.reportService.getSubCategoryList(codes).then((res:any)=>{
      this.subList = res;
    });
  }

  subCategoryChangeLoc(event: any) {
    if (this.stockReportModel.deptno_loc.length == 0) {
      this.stockReportModel.deptno_loc = ''
      this.stockReportModel.category_code_loc = '';
      return;
    }

    let category  = event? event:'';
    const categories = category.map((item:any) => item.deptno);
    this.reportService.getCategoryList(categories).then((res:any)=>{
      this.productList = res;
    });
  }

  onSubmit(repForm:any){
    
  }

  printReport(reportType: any) {
    if (!this.stockReportModel.fromDate || !this.stockReportModel.toDate) {
      this.alertService.triggerAlert("Please select both From Date and To Date.", 3000, 'error');
      return;
    }
    // const toDate = new Date(this.stockReportModel.toDate); // dd/MM/yyyy
    // const fromDate = new Date(this.stockReportModel.fromDate); // dd/MM/yyyy
    // const today = new Date();
    // const periodFrom = new Date(today.getFullYear(), 0, 1);
    // const periodTo = new Date(today.getFullYear(), 11, 31);
    // const isBetweenFrom = fromDate >= periodFrom && fromDate <= periodTo;
    // const isBetweenTo = toDate >= periodFrom && toDate <= periodTo;

    // if(!isBetweenFrom || !isBetweenTo){
    //   this.alertService.triggerAlert('Dates must choose within the chosen financial year.', 3000, 'error');
    //   return ;
    // }
    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; //18
    const model = this.stockReportModel;
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();

    params.append("reportType", reportType);
    params.append("company_code", this.endPointService.companycode.toString());
    params.append("period_id", model.year);
    const from_Date = this.datePipe.transform(model.fromDate, 'MM/dd/yyyy')||'';
    params.append("fromDate", from_Date);
    const to_Date = this.datePipe.transform(model.toDate, 'MM/dd/yyyy')||'';
    params.append("toDate", to_Date);

    params.append("costing", model.costing?"1":"2");
    params.append("hardware", model.hardware ? "1" : "0");
    params.append("accessories", model.accessories ? "1" : "0");
    params.append("hide_zero_stock", model.hide_zero_stock ? "1" : "0");
    params.append("bal_col_only", model.bal_col_only ? "1" : "0");
    params.append("show_transfer", model.show_transfer ? "1" : "0");
    params.append("showOnlyZeroCost", model.show_only_zero_cost ? "1" : "0");

    params.append("item_no", model.item_no);
    params.append("product_type", model.product_type?? null);
    params.append("brand_id", model.brand_id??null);
    params.append("category_code", model.category_code?model.category_code.join(","):null);
    params.append("deptno", model.deptno?model.deptno.join(","):null);
    params.append("godown_code", model.godown_code?model.godown_code.join(","):null);
    params.append("main_category_code", model.main_category_code?model.main_category_code.join(","):null);
    params.append("user_id", localStorage.getItem('user_id')??'');

    const godownNames = this.warehouseList
    .filter(w =>  this.stockReportModel.godown_code.includes(w.godown_code))
    .map(w => w.godown_name);
    params.append("godownName", godownNames?godownNames.join(","):'');

    const finalUrl = apiHostingURL + "&" + params.toString();

    window.open(finalUrl, "_blank");
  }


  okLocationWise(){
    
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.stockReportModel.fromDate = date;
    this.yearChange(this.stockReportModel.fromDate.getFullYear());
  }

  formatToDateInput(value: string): void {
    this.stockReportModel.fromDate = value;
  }

  onDateSelected1(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.stockReportModel.toDate = date;
  }

  formatToDateInput1(value: string): void {
    this.stockReportModel.toDate = value;
  }

}

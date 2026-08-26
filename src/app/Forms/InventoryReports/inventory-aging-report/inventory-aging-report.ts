import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { InventoryAgingReportModel } from '../../../Model/ReportModel/report-model.model';
import { AlertService } from '../../../shared/alert/alert.service';
import { ReportService } from '../../../Service/ReportService/report-service';
import { EndPointService } from '../../../Service/end-point.services';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inventory-aging-report',
  standalone: false,
  templateUrl: './inventory-aging-report.html',
  styleUrls: ['./inventory-aging-report.css','../../common.css'] 
})
export class InventoryAgingReport {
  inventoryAgingReportModel:InventoryAgingReportModel = new InventoryAgingReportModel();
  categoryList: any[] = [ 'OP', 'RGC'];
  productList: any[] = [];
  subList: any[] = [];
  itemList: any[] = [];

  constructor( private datePipe: DatePipe,private router: Router,private alertService: AlertService,private reportService: ReportService, public endPointService:EndPointService,) {
    this.inventoryAgingReportModel.agingAsOf = new Date();
  }

  async ngOnInit(){

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

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.inventoryAgingReportModel.agingAsOf = date;
  }

  formatToDateInput(value: string): void {
    this.inventoryAgingReportModel.agingAsOf = value;
  }
  
  onSubmit(arg0: NgForm) {
    throw new Error('Method not implemented.');
  }

  subCategoryChange(event: any) {
    if (this.inventoryAgingReportModel.deptname.length == 0) {
      this.inventoryAgingReportModel.deptname = ''
      this.inventoryAgingReportModel.category_name = '';
      return;
    }

    let category  = event? event:'';
    const categories = category.map((item:any) => item.deptname);
    this.reportService.getCategoryList(categories).then((res:any)=>{
      this.productList = res;
    });
  }

  printReport(reportType: any) {
    if (!this.inventoryAgingReportModel.agingAsOf) {
      this.alertService.triggerAlert("Please select the Aging As Of Date.", 3000, 'error');
      return;
    }

    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; // 21
    const model = this.inventoryAgingReportModel;
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();

    params.append("reportType", reportType);
    const agingAsOf = this.datePipe.transform(model.agingAsOf, 'MM/dd/yyyy')||'';
    params.append("agingAsOf", agingAsOf);
    params.append("user_id", localStorage.getItem('user_id')??'');

    params.append("product_type", model.product_type?? null);
    params.append("category_name", model.category_name?model.category_name.join(","):null);
    params.append("deptname", model.deptname?model.deptname.join(","):null);
    params.append("item_no", model.item_no?? null);
    params.append("aboveDays", model.aboveDays?? null);

    const finalUrl = apiHostingURL + "&" + params.toString();
    window.open(finalUrl, "_blank");
  }

}

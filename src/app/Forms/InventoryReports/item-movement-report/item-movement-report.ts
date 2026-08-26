import { Component } from '@angular/core';
import { ItemMovementReportModel } from '../../../Model/ReportModel/report-model.model';
import { EndPointService } from '../../../Service/end-point.services';
import { ReportService } from '../../../Service/ReportService/report-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-item-movement-report',
  standalone: false,
  templateUrl: './item-movement-report.html',
  styleUrls: ['./item-movement-report.css','../../common.css']
})
export class ItemMovementReport {
  ItemMovementReportModel:ItemMovementReportModel = new ItemMovementReportModel();
  categoryList: any[] = [ 'OP', 'RGC'];
  productList: any[] = [];
  subList: any[] = [];

  constructor( private datePipe: DatePipe,private router: Router,private alertService: AlertService,private reportService: ReportService, public endPointService:EndPointService,) {
  }

  async ngOnInit(){

    var temp: any[] = [];

    this.reportService.getSubCategoryList(temp).then((res: any[]) => {
      this.subList = res;
    });

    this.reportService.getCategoryList(temp).then((res: any[]) => {
      this.productList = res;
    });

  }

  onSubmit(arg0: NgForm) {
    throw new Error('Method not implemented.');
  }

  subCategoryChange(event: any) {
    if (this.ItemMovementReportModel.deptname.length == 0) {
      this.ItemMovementReportModel.deptname = ''
      this.ItemMovementReportModel.category_name = '';
      return;
    }

    let category  = event? event:'';
    const categories = category.map((item:any) => item.deptname);
    this.reportService.getCategoryList(categories).then((res:any)=>{
      this.productList = res;
    });
  }

  printReport(reportType: any) {
    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; // 22
    const model = this.ItemMovementReportModel;
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();

    params.append("reportType", reportType);
    params.append("user_id", localStorage.getItem('user_id')??'');

    params.append("product_type", model.product_type?? null);
    params.append("category_name", model.category_name?model.category_name.join(","):null);
    params.append("deptname", model.deptname?model.deptname.join(","):null);
    params.append("months", model.months?? null);

    const finalUrl = apiHostingURL + "&" + params.toString();
    window.open(finalUrl, "_blank");
  }
}

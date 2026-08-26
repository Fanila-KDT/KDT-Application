import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'; 
import { FilterPipe } from '../../Admin/user-master/user-master';
import { StockReportRouting } from './stock-report.routing';
import { StockReport } from './stock-report';
import { ReportService } from '../../../Service/ReportService/report-service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipDirective } from "ngx-bootstrap/tooltip";

@NgModule({
  declarations: [
    StockReport
  ],
  imports: [
    CommonModule,
    FormsModule,
    StockReportRouting,
    NgxDatatableModule,
    NgSelectModule,
    MatFormFieldModule,
    MatSelectModule,
    FilterPipe,
    BsDatepickerModule,
    TooltipDirective
  ],
  providers:[ReportService,DatePipe]
})
export class StockReportModule { }

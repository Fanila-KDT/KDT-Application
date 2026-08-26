import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { SalesOrderRouting } from './sales-order.routing';
import { SalesOrder } from './sales-order';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SalesOrderService } from '../../../Service/SalesOrderService/sales-order-service';
import { SalesOrderList } from './sales-order-list/sales-order-list';
import { SalesOrderDetails } from './sales-order-details/sales-order-details';
@NgModule({
  declarations: [
   SalesOrder,
   SalesOrderList,
   SalesOrderDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    SalesOrderRouting,
    NgSelectModule,
    CdkAutofill,
    BsDatepickerModule,
    NgxDatatableModule,
],
  providers:[SalesOrderService]
})
export class SalesOrderModule { }

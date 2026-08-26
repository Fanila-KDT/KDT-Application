import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { SalesInvoiceRouting } from './sales-invoice.routing';
import { SalesInvoice } from './sales-invoice';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SalesInvoiceService } from '../../../Service/SalesInvoiceService/sales-invoice-service';
import { SalesInvoiceList } from './sales-invoice-list/sales-invoice-list';
import { SalesInvoiceDetails } from './sales-invoice-details/sales-invoice-details';
@NgModule({
  declarations: [
   SalesInvoice,
   SalesInvoiceList,
   SalesInvoiceDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    SalesInvoiceRouting,
    NgSelectModule,
    CdkAutofill,
    BsDatepickerModule,
    NgxDatatableModule,
],
  providers:[SalesInvoiceService]
})
export class SalesInvoiceModule { }

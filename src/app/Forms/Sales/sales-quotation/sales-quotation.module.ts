import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { SalesQuotationRouting } from './sales-quotation.routing';
import { SalesQuotation } from './sales-quotation';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SalesQuotationService } from '../../../Service/SalesQuotationService/sales-quotation-service';
import { SalesQuotationList } from './sales-quotation-list/sales-quotation-list';
import { SalesQuotationDetails } from './sales-quotation-details/sales-quotation-details';
@NgModule({
  declarations: [
   SalesQuotation,
   SalesQuotationList,
   SalesQuotationDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    SalesQuotationRouting,
    NgSelectModule,
    CdkAutofill,
    BsDatepickerModule,
    NgxDatatableModule,
],
  providers:[SalesQuotationService]
})
export class SalesQuotationModule { }

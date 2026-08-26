import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { SalesLeadRouting } from './sales-lead.routing';
import { SalesLead } from './sales-lead';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SalesLeadService } from '../../../Service/SalesLeadService/sales-lead-service';
import { SalesLeadList } from './sales-lead-list/sales-lead-list';
import { SalesLeadDetails } from './sales-lead-details/sales-lead-details';
@NgModule({
  declarations: [
   SalesLead,
   SalesLeadList,
   SalesLeadDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    SalesLeadRouting,
    NgSelectModule,
    CdkAutofill,
    BsDatepickerModule,
    NgxDatatableModule,
],
  providers:[SalesLeadService]
})
export class SalesLeadModule { }

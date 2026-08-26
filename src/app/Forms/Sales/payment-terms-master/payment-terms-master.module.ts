import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { PaymentTermsMasterRouting } from './payment-terms-master.routing';
import { PaymentTermsMaster } from './payment-terms-master';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { PaymentTermsMasterService } from '../../../Service/PaymentTermsMasterService/payment-terms-service';
import { PaymentTermsMasterList } from './payment-terms-master-list/payment-terms-master-list';
import { PaymentTermsMasterDetails } from './payment-terms-master-details/payment-terms-master-details';
@NgModule({
  declarations: [
   PaymentTermsMaster,
   PaymentTermsMasterList,
   PaymentTermsMasterDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    PaymentTermsMasterRouting,
    NgxDatatableModule,
    NgSelectModule,
    CdkAutofill
],
  providers:[PaymentTermsMasterService]
})
export class PaymentTermsMasterModule { }

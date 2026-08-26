import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { PaymentRequest } from '../payment-request/payment-request';
import { PaymentRequestRouting } from './payment-request.routing';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaymentRequestService } from '../../../Service/PaymentRequestService/payment-request-service';
import { PaymentRequestList } from './payment-request-list/payment-request-list';
import { PaymentRequestDetails } from './payment-request-details/payment-request-details';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
@NgModule({
  declarations: [
    PaymentRequest,
    PaymentRequestList,
    PaymentRequestDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    PaymentRequestRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
  ],
  providers:[PaymentRequestService]
})
export class PaymentRequestModule { }

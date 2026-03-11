import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PurchaseOrder } from './purchase-order';
import { PurchaseOrderRouting } from './purchase-order.routing';
import { PurchaseOrderList } from './purchase-order-list/purchase-order-list';
import { PurchaseOrderService } from '../../../Service/PurchaseOrderService/purchase-order-service';
import { PurchaseOrderDetails } from './purchase-order-details/purchase-order-details';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
   PurchaseOrder,
   PurchaseOrderList,
   PurchaseOrderDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    PurchaseOrderRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[PurchaseOrderService]
})
export class PurchaseOrderModule { }

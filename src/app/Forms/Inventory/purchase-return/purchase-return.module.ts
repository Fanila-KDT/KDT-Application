import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PurchaseReturnService } from '../../../Service/PurchaseReturnService/purchase-return-service';
import { PurchaseReturn } from './purchase-return';
import { PurchaseReturnRouting } from './purchase-return.routing';
import { PurchaseReturnList } from './purchase-return-list/purchase-return-list';
import { PurchaseReturnDetails } from './purchase-return-details/purchase-return-details';
@NgModule({
  declarations: [
    PurchaseReturn,
    PurchaseReturnList,
    PurchaseReturnDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    PurchaseReturnRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[PurchaseReturnService]
})
export class PurchaseReturnModule { }

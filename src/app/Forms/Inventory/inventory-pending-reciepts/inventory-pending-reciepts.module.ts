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
import { InventoryPendingReciepts } from '../inventory-pending-reciepts/inventory-pending-reciepts';
import { InventoryPendingRecieptsRouting } from './inventory-pending-reciepts.routing';
import { RecieptEntryService } from '../../../Service/RecieptEntryService/reciept-entry-service';
@NgModule({
  declarations: [
    InventoryPendingReciepts
  ],
  imports: [
   CommonModule,
    FormsModule,
    InventoryPendingRecieptsRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[RecieptEntryService]
})
export class InventoryPendingRecieptsModule { }

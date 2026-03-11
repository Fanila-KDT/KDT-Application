import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { InventoryDashboardRouting } from './inventory-dashboard.routing';
import { InventoryDashboard } from './inventory-dashboard';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RecieptEntryService } from '../../../Service/RecieptEntryService/reciept-entry-service';
@NgModule({
  declarations: [
    InventoryDashboard
  ],
  imports: [
   CommonModule,
    FormsModule,
    InventoryDashboardRouting,
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
export class InventoryDashboardModule { }

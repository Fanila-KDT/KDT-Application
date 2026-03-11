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
import { ExpenseEntry } from './expense-entry';
import { ExpenseEntryService } from '../../../Service/ExpenseEntryService/expense-entry-service';
import { ExpenseEntryRouting } from './expense-entry.routing';
import { ExpenseEntryList } from './expense-entry-list/expense-entry-list';
import { ExpenseEntryDetails } from './expense-entry-details/expense-entry-details';
@NgModule({
  declarations: [
    ExpenseEntry,
    ExpenseEntryList,
    ExpenseEntryDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    ExpenseEntryRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[ExpenseEntryService]
})
export class ExpenseEntryModule { }

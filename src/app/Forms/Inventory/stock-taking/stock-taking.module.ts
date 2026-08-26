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
import { StockTaking } from './stock-taking';
import { StockTakingRouting } from './stock-taking.routing';
import { StockTakingService } from '../../../Service/StockTakingService/stock-taking-service';
import { StockTakingList } from './stock-taking-list/stock-taking-list';
import { StockTakingDetails } from './stock-taking-details/stock-taking-details';

@NgModule({
  declarations: [
    StockTaking,
    StockTakingList,
    StockTakingDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    StockTakingRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[StockTakingService]
})
export class StockTakingModule { }

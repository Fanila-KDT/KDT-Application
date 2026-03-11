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
import { StockVerification } from './stock-verification';
import { StockVerificationService } from '../../../Service/StockVerificationService/stock-verification-service';
import { StockVerificationRouting } from './stock-verification.routing';
import { StockVerificationList } from './stock-verification-list/stock-verification-list';
import { StockVerificationDetails } from './stock-verification-details/stock-verification-details';
@NgModule({
  declarations: [
    StockVerification,
    StockVerificationList,
    StockVerificationDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    StockVerificationRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[StockVerificationService]
})
export class StockVerificationModule { }

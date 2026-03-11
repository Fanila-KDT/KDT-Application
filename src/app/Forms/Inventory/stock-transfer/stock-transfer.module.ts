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
import { StockTransfer } from './stock-transfer';
import { StockTransferRouting } from './stock-transfer.routing';
import { StockTransferService } from '../../../Service/StockTransferService/stock-transfer-service';
import { StockTransferList } from './stock-transfer-list/stock-transfer-list';
import { StockTransferDetails } from './stock-transfer-details/stock-transfer-details';

@NgModule({
  declarations: [
    StockTransfer,
    StockTransferList,
    StockTransferDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    StockTransferRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[StockTransferService]
})
export class StockTransferModule { }

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
import { StockCorrection } from './stock-correction';
import { StockCorrectionRouting } from './stock-correction.routing';
import { StockCorrectionService } from '../../../Service/StockCorrectionService/stock-correction-service';
import { StockCorrectionList } from './stock-correction-list/stock-correction-list';
import { StockCorrectionDetails } from './stock-correction-details/stock-correction-details';

@NgModule({
  declarations: [
    StockCorrection,
    StockCorrectionList,
    StockCorrectionDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    StockCorrectionRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[StockCorrectionService]
})
export class StockCorrectionModule { }

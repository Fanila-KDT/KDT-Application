import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyMaster } from './currency-master';
import { CurrencyMasterRouting } from './currency-master.routing';
import { CurrencyMasterService } from '../../../Service/CurrencyMasterService/currency-master-service';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { CurrencyMasterList } from './currency-master-list/currency-master-list';
import { CurrencyMasterDetails } from './currency-master-details/currency-master-details';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [
    CurrencyMaster,
    CurrencyMasterList,
    CurrencyMasterDetails,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CurrencyMasterRouting,
    BsDatepickerModule,
    NgxDatatableModule,
  ],
  providers:[CurrencyMasterService]
})
export class CurrencyMasterModule { }

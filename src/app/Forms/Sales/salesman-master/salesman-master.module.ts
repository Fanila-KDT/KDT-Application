import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { SalesmanMasterRouting } from './salesman-master.routing';
import { SalesmanMaster } from './salesman-master';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { SalesmanMasterService } from '../../../Service/SalesmanMasterService/salesman-master-service';
import { SalesmanMasterList } from './salesman-master-list/salesman-master-list';
import { SalesmanMasterDetails } from './salesman-master-details/salesman-master-details';
@NgModule({
  declarations: [
   SalesmanMaster,
   SalesmanMasterList,
   SalesmanMasterDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    SalesmanMasterRouting,
    NgxDatatableModule,
    NgSelectModule,
    CdkAutofill
],
  providers:[SalesmanMasterService]
})
export class SalesmanMasterModule { }

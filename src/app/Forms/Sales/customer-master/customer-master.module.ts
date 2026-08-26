import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { CustomerMasterRouting } from './customer-master.routing';
import { CustomerMaster } from './customer-master';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerMasterService } from '../../../Service/CustomerMasterService/customer-master-service';
import { CustomerMasterList } from './customer-master-list/customer-master-list';
import { CustomerMasterDetails } from './customer-master-details/customer-master-details';
import { CdkAutofill } from "@angular/cdk/text-field";
@NgModule({
  declarations: [
   CustomerMaster,
   CustomerMasterList,
   CustomerMasterDetails,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CustomerMasterRouting,
    NgxDatatableModule,
    NgSelectModule,
    CdkAutofill
],
  providers:[CustomerMasterService]
})
export class CustomerMasterModule { }

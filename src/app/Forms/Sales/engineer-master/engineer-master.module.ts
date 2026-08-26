import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { EngineerMasterRouting } from './engineer-master.routing';
import { EngineerMaster } from './engineer-master';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { EngineerMasterService } from '../../../Service/EngineerMasterService/engineer-master-service';
import { EngineerMasterList } from './engineer-master-list/engineer-master-list';
import { EngineerMasterDetails } from './engineer-master-details/engineer-master-details';
@NgModule({
  declarations: [
   EngineerMaster,
   EngineerMasterList,
   EngineerMasterDetails,
  ],
  imports: [
    CommonModule,
    FormsModule,
    EngineerMasterRouting,
    NgxDatatableModule,
    NgSelectModule,
    CdkAutofill
],
  providers:[EngineerMasterService]
})
export class EngineerMasterModule { }

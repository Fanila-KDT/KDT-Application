import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { AreaMasterRouting } from './area-master.routing';
import { AreaMaster } from './area-master';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { AreaMasterService } from '../../../Service/AreaMasterService/area-master-service';
import { AreaMasterList } from './area-master-list/area-master-list';
import { AreaMasterDetails } from './area-master-details/area-master-details';
@NgModule({
  declarations: [
   AreaMaster,
   AreaMasterList,
   AreaMasterDetails,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AreaMasterRouting,
    NgxDatatableModule,
    NgSelectModule,
    CdkAutofill
],
  providers:[AreaMasterService]
})
export class AreaMasterModule { }

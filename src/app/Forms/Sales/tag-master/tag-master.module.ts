import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { TagMasterRouting } from './tag-master.routing';
import { TagMaster } from './tag-master';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { TagMasterService } from '../../../Service/TagMasterService/tag-master-service';
import { TagMasterList } from './tag-master-list/tag-master-list';
import { TagMasterDetails } from './tag-master-details/tag-master-details';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
@NgModule({
  declarations: [
   TagMaster,
   TagMasterList,
   TagMasterDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    TagMasterRouting,
    NgSelectModule,
    CdkAutofill,
    BsDatepickerModule,
    NgxDatatableModule,
],
  providers:[TagMasterService]
})
export class TagMasterModule { }

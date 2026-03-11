import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { WarehouseMasterRouting } from './warehouse-master.routing';
import { WarehouseMaster } from './warehouse-master';
import { WarehouseMasterService } from '../../../Service/WarehouseMasterService/warehouse-master-service';
import { WarehouseMasterList } from './warehouse-master-list/warehouse-master-list';
import { WarehouseMasterDetails } from './warehouse-master-details/warehouse-master-details';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [
   WarehouseMaster,
   WarehouseMasterList,
   WarehouseMasterDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    WarehouseMasterRouting,
    NgxDatatableModule,
    NgSelectModule
  ],
  providers:[WarehouseMasterService]
})
export class WarehouseMasterModule { }

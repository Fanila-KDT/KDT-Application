import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { SupplierMaster } from '../supplier-master/supplier-master';
import { SupplierMasterRouting } from './supplier-master.routing';
import { SupplierMasterService } from '../../../Service/SupplierMasterService/supplier-master-service';
import { SupplierMasterDetails } from './supplier-master-details/supplier-master-details';
import { SupplierMasterList } from './supplier-master-list/supplier-master-list';
@NgModule({
  declarations: [
    SupplierMaster,
    SupplierMasterDetails,
    SupplierMasterList,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SupplierMasterRouting,
    NgxDatatableModule
  ],
  providers:[SupplierMasterService]
})
export class SupplierMasterModule { }

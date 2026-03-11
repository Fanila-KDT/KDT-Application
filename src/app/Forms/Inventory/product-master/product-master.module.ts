import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductMaster } from './product-master';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { ProductMasterRouting } from './product-master.routing';
import { ProductMasterList } from './product-master-list/product-master-list';
import { ProductMasterDetails } from './product-master-details/product-master-details';
import { ProductMasterService } from '../../../Service/ProductMasterService/product-master-service';
@NgModule({
  declarations: [
    ProductMaster,
    ProductMasterList,
    ProductMasterDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProductMasterRouting,
    NgxDatatableModule
  ],
  providers:[ProductMasterService]
})
export class ProductMasterModule { }

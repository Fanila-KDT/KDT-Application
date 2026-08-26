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
import { ItemReorderRequestRouting } from './item-reorder-request.routing';
import { ItemReorderRequestService } from '../../../Service/ItemReorderRequestService/item-reorder-request-service';
import { ItemReorderRequest } from './item-reorder-request';
import { ItemReorderRequestList } from './item-reorder-request-list/item-reorder-request-list';
import { ItemReorderRequestDetails } from './item-reorder-request-details/item-reorder-request-details';

@NgModule({
  declarations: [
    ItemReorderRequest,
    ItemReorderRequestList,
    ItemReorderRequestDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    ItemReorderRequestRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[ItemReorderRequestService]
})
export class ItemReorderRequestModule { }

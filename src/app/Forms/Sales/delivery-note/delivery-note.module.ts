import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { DeliveryNoteRouting } from './delivery-note.routing';
import { DeliveryNote } from './delivery-note';
import { NgSelectModule } from '@ng-select/ng-select';
import { CdkAutofill } from "@angular/cdk/text-field";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DeliveryNoteService } from '../../../Service/DeliveryNoteService/delivery-note-service';
import { DeliveryNoteList } from './delivery-note-list/delivery-note-list';
import { DeliveryNoteDetails } from './delivery-note-details/delivery-note-details';
@NgModule({
  declarations: [
   DeliveryNote,
   DeliveryNoteList,
   DeliveryNoteDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    DeliveryNoteRouting,
    NgSelectModule,
    CdkAutofill,
    BsDatepickerModule,
    NgxDatatableModule,
],
  providers:[DeliveryNoteService]
})
export class DeliveryNoteModule { }

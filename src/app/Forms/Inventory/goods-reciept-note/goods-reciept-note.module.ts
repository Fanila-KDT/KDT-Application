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
import { RecieptEntryService } from '../../../Service/RecieptEntryService/reciept-entry-service';
import { GoodsRecieptNote } from './goods-reciept-note';
import { GoodsRecieptNoteRouting } from './goods-reciept-note.routing';
import { GoodsRecieptNoteList } from './goods-reciept-note-list/goods-reciept-note-list';
import { GoodsRecieptNoteDetails } from './goods-reciept-note-details/goods-reciept-note-details';
@NgModule({
  declarations: [
    GoodsRecieptNote,
    GoodsRecieptNoteList,
    GoodsRecieptNoteDetails
  ],
  imports: [
   CommonModule,
    FormsModule,
    GoodsRecieptNoteRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  providers:[RecieptEntryService]
})
export class GoodsRecieptNoteModule { }

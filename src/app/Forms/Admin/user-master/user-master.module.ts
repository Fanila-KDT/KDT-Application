import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserMaster, FilterPipe } from './user-master';
import { UserMasterRouting } from './user-master.routing';
import { UserMasterService } from '../../../Service/UserMasterService/user-master-service';
import { UserMasterList } from './user-master-list/user-master-list';
import { OrderByPipe, UserMasterDetails } from './user-master-details/user-master-details';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'; 

@NgModule({
  declarations: [
   UserMaster,
   UserMasterList,
   UserMasterDetails,
   OrderByPipe,
   OrderByPipe   
  ],
  imports: [
    CommonModule,
    FormsModule,
    UserMasterRouting,
    NgxDatatableModule,
    NgSelectModule,
    MatFormFieldModule,
    MatSelectModule,
    FilterPipe
],
  providers:[UserMasterService]
})
export class UserMasterModule { }

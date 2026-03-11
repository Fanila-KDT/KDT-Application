import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { AccountMaster } from '../account-master/account-master';
import { AccountMasterRouting } from './account-master.routing';
import { AccountMasterService } from '../../../Service/AccountMasterService/account-master-service';
import { AccountMasterList } from './account-master-list/account-master-list';
import { AccountMasterDetails } from './account-master-details/account-master-details';
@NgModule({
  declarations: [
    AccountMaster,
    AccountMasterList,
    AccountMasterDetails,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AccountMasterRouting,
    NgxDatatableModule
  ],
  providers:[AccountMasterService]
})
export class AccountMasterModule { }

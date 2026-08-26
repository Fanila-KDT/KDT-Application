import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { AccountSetup } from '../account-setup/account-setup';
import { AccountSetupRouting } from './account-setup.routing';
import { AccountSetupService } from '../../../Service/AccountSetupService/account-setup-service';
import { AccountSetupList } from './account-setup-list/account-setup-list';
import { AccountSetupDetails } from './account-setup-details/account-setup-details';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [
    AccountSetup,
    AccountSetupList,
    AccountSetupDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    AccountSetupRouting,
    NgxDatatableModule,
    NgSelectModule,
  ],
  providers:[AccountSetupService]
})
export class AccountSetupModule { }

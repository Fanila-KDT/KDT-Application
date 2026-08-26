import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { MaintenanceIssueRouting } from './maintenance-issue.routing';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MaintenanceIssue } from './maintenance-issue';
import { MaintenanceIssueService } from '../../../Service/MaintenanceIssueService/maintenance-issue-service';
import { MaintenanceIssueList } from './maintenance-issue-list/maintenance-issue-list';
import { MaintenanceIssueDetails } from './maintenance-issue-details/maintenance-issue-details';
@NgModule({
  declarations: [
    MaintenanceIssue,
    MaintenanceIssueList,
    MaintenanceIssueDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaintenanceIssueRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
  ],
  providers:[MaintenanceIssueService]
})
export class MaintenanceIssueModule { }

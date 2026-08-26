import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { MaintenanceRequestRouting } from './maintenance-request.routing';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MaintenanceRequestList } from './maintenance-request-list/maintenance-request-list';
import { MaintenanceRequest } from './maintenance-request';
import { MaintenanceRequestService } from '../../../Service/MaintenanceRequestService/maintenance-request-service';
import { MaintenanceRequestDetails } from './maintenance-request-details/maintenance-request-details';
@NgModule({
  declarations: [
    MaintenanceRequest,
    MaintenanceRequestList,
    MaintenanceRequestDetails,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaintenanceRequestRouting,
    NgxDatatableModule,
    NgSelectModule,
    BsDatepickerModule,
  ],
  providers:[MaintenanceRequestService]
})
export class MaintenanceRequestModule { }

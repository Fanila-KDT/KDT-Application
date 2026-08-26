import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Dashboard } from './dashboard';
import { DashboardRouting } from './dashboard.routing';
import { DashboardService } from '../../../Service/DashboardService/dashboard-service';
import { SharedMaterialModule } from '../../../shared.module';
@NgModule({
  declarations: [
    Dashboard
  ], 
  imports: [
    SharedMaterialModule,
    DashboardRouting,
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    RouterModule.forChild([{ path: '', component: Dashboard }])
  ],
  exports: [Dashboard],
  providers:[DashboardService]
})
export class DashboardModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoginPage } from './login-page';
import { LoginService } from '../../../Service/LoginService/login-page-service';
@NgModule({
  declarations: [
    //LoginPage
  ], 
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    RouterModule.forChild([{ path: '', component: LoginPage }])
  ],
  providers:[LoginService]
})
export class LoginComponentModule { }

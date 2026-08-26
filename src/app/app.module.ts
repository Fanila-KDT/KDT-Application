import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app.routing';
import { App } from './app';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Alert } from './shared/alert/alert';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginModelLog } from './Model/LoginPage/login-page.model';
import { Header } from './shared/header/header';
import { NavigationComponent } from './shared/navigation/navigation';
import { LoginPage } from './Forms/Main/login-page/login-page';
import { CustomInterceptor } from './Service/AuthenticationService/custom-interceptor';
import { ItemMovementReport } from './Forms/InventoryReports/item-movement-report/item-movement-report';
import { CustomerMaster } from './Forms/Sales/customer-master/customer-master';
import { SalesmanMaster } from './Forms/Sales/salesman-master/salesman-master';
import { EngineerMaster } from './Forms/Sales/engineer-master/engineer-master';
import { PaymentTermsMaster } from './Forms/Sales/payment-terms-master/payment-terms-master';
import { AreaMaster } from './Forms/Sales/area-master/area-master';

@NgModule({
  declarations: [
    App,
    NavigationComponent,
    Alert,
    Header,
    LoginPage
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxDatatableModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    
  ],
  exports:[],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CustomInterceptor, multi: true },
    provideBrowserGlobalErrorListeners(),
    LoginModelLog,
  ],
  bootstrap: [App]
})
export class AppModule { }

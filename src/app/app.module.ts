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
import { ItemReorderRequest } from './Forms/Inventory/item-reorder-request/item-reorder-request';

@NgModule({
  declarations: [
    App,
    NavigationComponent,
    Alert,
    Header,
    LoginPage,
    ItemReorderRequest,
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
    LoginModelLog
  ],
  bootstrap: [App]
})
export class AppModule { }

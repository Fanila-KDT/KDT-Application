import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { TransactionReport } from "./transaction";

export const routes: Routes = [
  {
    path: '',
    component: TransactionReport,
    pathMatch: 'full',
    data: { pageTitle: 'Transaction Report' },
    children: []
  }
];

export const TransactionReportRouting = RouterModule.forChild(routes);

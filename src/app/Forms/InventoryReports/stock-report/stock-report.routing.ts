import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { StockReport } from "./stock-report";

export const routes: Routes = [
  {
    path: '',
    component: StockReport,
    pathMatch: 'full',
    data: { pageTitle: 'Stock Report' },
    children: []
  }
];

export const StockReportRouting = RouterModule.forChild(routes);

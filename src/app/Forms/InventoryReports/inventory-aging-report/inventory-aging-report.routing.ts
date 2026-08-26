import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { InventoryAgingReport } from "./inventory-aging-report";

export const routes: Routes = [
  {
    path: '',
    component: InventoryAgingReport,
    pathMatch: 'full',
    data: { pageTitle: 'Inventory Aging Report' },
    children: []
  }
];

export const InventoryAgingReportRouting = RouterModule.forChild(routes);

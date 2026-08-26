import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { ItemMovementReport } from "./item-movement-report";

export const routes: Routes = [
  {
    path: '',
    component: ItemMovementReport,
    pathMatch: 'full',
    data: { pageTitle: 'Item Movement Report' },
    children: []
  }
];

export const ItemMovementReportRouting = RouterModule.forChild(routes);

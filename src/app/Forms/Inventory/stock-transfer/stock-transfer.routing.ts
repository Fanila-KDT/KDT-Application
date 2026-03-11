import { RouterModule, Routes } from "@angular/router";
import { StockTransfer } from "./stock-transfer";

export const routes: Routes = [
  {
    path: '',
    component: StockTransfer,
    pathMatch: 'full',
    data: { pageTitle: 'stock-transfer' },
  }
];

export const StockTransferRouting = RouterModule.forChild(routes);
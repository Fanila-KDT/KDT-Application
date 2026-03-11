import { RouterModule, Routes } from "@angular/router";
import { StockVerification } from "./stock-verification";

export const routes: Routes = [
  {
    path: '',
    component: StockVerification,
    pathMatch: 'full',
    data: { pageTitle: 'stock-verification' },
  }
];

export const StockVerificationRouting = RouterModule.forChild(routes);
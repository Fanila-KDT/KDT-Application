import { RouterModule, Routes } from "@angular/router";
import { StockCorrection } from "./stock-correction";

export const routes: Routes = [
  {
    path: '',
    component: StockCorrection,
    pathMatch: 'full',
    data: { pageTitle: 'stock-correction' },
  }
];

export const StockCorrectionRouting = RouterModule.forChild(routes);
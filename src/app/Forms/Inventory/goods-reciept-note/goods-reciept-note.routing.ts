import { RouterModule, Routes } from "@angular/router";
import { GoodsRecieptNote } from "./goods-reciept-note";

export const routes: Routes = [
  {
    path: '',
    component: GoodsRecieptNote,
    pathMatch: 'full',
    data: { pageTitle: 'goods-reciept-note' },
  }
];

export const GoodsRecieptNoteRouting = RouterModule.forChild(routes);

import { ModuleWithProviders } from "@angular/core"
import { RouterModule, Routes } from "@angular/router";
import { DeliveryNote } from "./delivery-note";

export const routes: Routes = [
  {
    path: '',
    component: DeliveryNote,
    pathMatch: 'full',
    data: { pageTitle: 'delivery-note' },
    children: []
  }
];

export const DeliveryNoteRouting = RouterModule.forChild(routes);

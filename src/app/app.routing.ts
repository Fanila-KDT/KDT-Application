import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, PermissionGuard } from './Service/AuthenticationService/auth-guard';


const routes: Routes = [
    {
    path: '',
    redirectTo: 'login-page',
    pathMatch: 'full'
  },
  {
    path: 'login-page',
    loadChildren: () =>
      import('./Forms/Main/login-page/login-page.module').then(m => m.LoginComponentModule)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./Forms/Main/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard]
  },
  {
    path: 'Forms',
    loadChildren: () =>
      import('./Forms/Inventory/product-master/product-master.module').then(m => m.ProductMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PRODUCT_MASTER', level: 1 }
  },

  {
    path: 'Forms/currency-master',
    loadChildren: () =>
      import('./Forms/Accounts/currency-master/currency-master.module').then(m => m.CurrencyMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'CURRENCY_MASTER', level: 1 }
  },

  {
    path: 'Forms/account-master',
    loadChildren: () =>
      import('./Forms/Accounts/account-master/account-master.module').then(m => m.AccountMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'ACCOUNT_MASTER', level: 1 }
  },

  {
    path: 'Forms/supplier-master',
    loadChildren: () =>
      import('./Forms/Accounts/supplier-master/supplier-master.module').then(m => m.SupplierMasterModule), canActivate: [AuthGuard,PermissionGuard],data: { permission: 'SUPPLIER_MASTER', level: 1 }
  },
  {
    path: 'Forms/warehouse-master',
    loadChildren: () =>
      import('./Forms/Inventory/warehouse-master/warehouse-master.module').then(m => m.WarehouseMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'WAREHOUSE_MASTER', level: 1 }
  },
  {
    path: 'Forms/user-master',
    loadChildren: () =>
      import('./Forms/Admin/user-master/user-master.module').then(m => m.UserMasterModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'USER_MASTER', level: 1 }
  },
  {
    path: 'Forms/purchase-order',
    loadChildren: () =>
      import('./Forms/Inventory/purchase-order/purchase-order.module').then(m => m.PurchaseOrderModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PURCHASE_ORDER', level: 1 }
  },
  {
    path: 'Forms/inventory-dashboard',
    loadChildren: () =>
      import('./Forms/Inventory/inventory-dashboard/inventory-dashboard.module').then(m => m.InventoryDashboardModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'GOODS_RECEIPT_NOTE', level: 1 }
  },
  {
    path: 'Forms/inventory-pending-reciepts',
    loadChildren: () =>
      import('./Forms/Inventory/inventory-pending-reciepts/inventory-pending-reciepts.module').then(m => m.InventoryPendingRecieptsModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'GOODS_RECEIPT_NOTE', level: 1 }
  },
  {
    path: 'Forms/goods-reciept-note',
    loadChildren: () =>
      import('./Forms/Inventory/goods-reciept-note/goods-reciept-note.module').then(m => m.GoodsRecieptNoteModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'GOODS_RECEIPT_NOTE', level: 1 }
  },
  {
    path: 'Forms/stock-verification',
    loadChildren: () =>
      import('./Forms/Inventory/stock-verification/stock-verification.module').then(m => m.StockVerificationModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_VERIFICATION', level: 1 }
  },
  {
    path: 'Forms/expense-entry',
    loadChildren: () =>
      import('./Forms/Inventory/expense-entry/expense-entry.module').then(m => m.ExpenseEntryModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'PURCHASE_EXPENSE', level: 1 }
  },
  {
    path: 'Forms/stock-transfer',
    loadChildren: () =>
      import('./Forms/Inventory/stock-transfer/stock-transfer.module').then(m => m.StockTransferModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_TRANSFER', level: 1 }
  },
  {
    path: 'Forms/stock-correction',
    loadChildren: () =>
      import('./Forms/Inventory/stock-correction/stock-correction.module').then(m => m.StockCorrectionModule), canActivate: [AuthGuard,PermissionGuard], data: { permission: 'STOCK_CORRECTION', level: 1 }
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

  

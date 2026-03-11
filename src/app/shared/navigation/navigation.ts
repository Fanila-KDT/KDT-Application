import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import * as config from '../../../assets/api/URLconfig.json';
import { Subscription } from 'rxjs';
import { UserAccessService } from '../../Service/AuthenticationService/user-access';

type HeaderKey = 'dashboard' | 'Inventory' | 'Sales' | 'Service' | 'Accounts' | 'HR' | 'Admin';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.css'],
  standalone: false
})
export class NavigationComponent implements OnInit {
  public urlConfig: any = config;
  subscription: Subscription[] = [];
  activeHeader: HeaderKey = 'dashboard';

  sidebarConfig: Record<HeaderKey, Record<'masters' | 'transactions' | 'reports', { path: string; label: string }[]>> = {
    dashboard: { masters: [], transactions: [], reports: [] },
    Inventory: {
      masters: [
        { path: '/Forms/product-master', label: 'Product Master' },
        { path: '/Forms/warehouse-master', label: 'Warehouse Master' }
      ],
      transactions: [
        { path: '/Forms/inventory-dashboard', label: 'Dashboard' },
        { path: '/Forms/purchase-order', label: 'Purchase Order' },
        { path: '/Forms/goods-reciept-note', label: 'Goods Receipt Note' },
        { path: '/Forms/stock-verification', label: 'Stock Verification' },
        { path: '/Forms/expense-entry', label: 'Expense Entry' },
        { path: '/Forms/stock-transfer', label: 'Stock Transfer' },
        { path: '/Forms/stock-correction', label: 'Stock Correction' },

      ],
      reports: [
      ]
    },
    Sales: {
      masters: [],
      transactions: [],
      reports: []
    },
    Service: {
      masters: [],
      transactions: [],
      reports: []
    },
    Accounts: {
      masters: [
        { path: '/Forms/currency-master', label: 'Currency Master' },
        { path: '/Forms/account-master', label: 'Account Master' },
        { path: '/Forms/supplier-master', label: 'Supplier Master' }],
      transactions: [],
      reports: []
    },
    HR: {
      masters: [],
      transactions: [],
      reports: []
    },
    Admin: {
      masters: [
        { path: '/Forms/user-master', label: 'User Master' }
      ],
      transactions: [],
      reports: []
    }
  };

  constructor(private router: Router, public userAccessService: UserAccessService) {
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const segment = event.urlAfterRedirects.split('/')[1] as HeaderKey;
        const validHeaders: HeaderKey[] = ['Inventory','Sales','Service','Accounts','HR','Admin'];

        if (validHeaders.includes(segment)) {
          this.userAccessService.setHeader(segment);
        }
      }
    });

    this.subscription.push(
      this.userAccessService.HeaderName.subscribe(x => {
        if(x != 'dashboard'){
          this.activeHeader = x as HeaderKey;
          sessionStorage.setItem('activeHeader',x)
        }
        else{
          let temp = sessionStorage.getItem('activeHeader')||'';
          this.activeHeader = temp as HeaderKey;
        }
      })
    );
  } 

}

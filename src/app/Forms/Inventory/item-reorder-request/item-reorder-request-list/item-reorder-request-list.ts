import { ChangeDetectorRef, Component } from '@angular/core';
import { ItemReorderRequestModel } from '../../../../Model/ItemReorderRequest/item-reorder-request.model';
import { Subscription } from 'rxjs';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Pagination } from '../../../../Model/pagingResponse';
import { ItemReorderRequestService } from '../../../../Service/ItemReorderRequestService/item-reorder-request-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { DashboardService } from '../../../../Service/DashboardService/dashboard-service';
import { Router } from '@angular/router';
import { CommonService } from '../../../../Service/CommonService/common-service';

@Component({
  selector: 'item-reorder-request-list',
  standalone: false,
  templateUrl: './item-reorder-request-list.html',
  styleUrls: ['./item-reorder-request-list.css','../../../common.css']
})
export class ItemReorderRequestList {
 subscription: Subscription[] =  new Array<Subscription>();
  isLoading: boolean = false;
  disableGrid: boolean =false;
  rows: any[] = [];           // Original data
  temp:any[] = [];
  gridHeight:number;
  scroll: boolean = true;
  controls = {
    pageSize:50
  };
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  totRowCounts: number=0;
  currPage: number = 1;
  selectedItemReorderRequest: number=0;
  filterItemReorderRequest = new ItemReorderRequestModel();
  filteredRows: any[] = [];  
  itemReorderRequestPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;
  status:string ='';
  poBtnDisable: boolean = false;

  
  constructor(public itemReorderRequestService:ItemReorderRequestService,public endPointService:EndPointService,public userAccessService:UserAccessService,public commonService:CommonService,
            private cdRef: ChangeDetectorRef,public purchaseOrderService:PurchaseOrderService, public dashboardService: DashboardService, private router: Router) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.itemReorderRequestService.loadListItemReorderRequest.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.itemReorderRequestPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.itemReorderRequestService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));
    
    this.subscription.push(this.itemReorderRequestService.selected.subscribe(async data=>{
      if(!data){
        return;
      }
      this.selected = data;
    }));

    this.subscription.push(this.itemReorderRequestService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.status = this.rows.length > 0 ? this.rows[this.selectedItemReorderRequest].status : '';
        if(data){
          this.ControlsEnableAndDisable();
          const hasExpensePermission = this.userAccessList?.some(
            (u: any) => (u.permissionName === 'PURCHASE_ORDER' && u.level_of_rights > 1) // Assuming accessLevel > 1 means they can access the expense entry
          );
          this.rows.forEach((row: any) => {
          if((row.status).toUpperCase() == 'POSTED' && hasExpensePermission ){
            row.poBtnDisable = false;
          } else {
            row.poBtnDisable = true;
          }
        });
        }
      }
    }));

    this.subscription.push(this.itemReorderRequestService.ngOnInit.subscribe(data=>{
      if(data){
        this.itemReorderRequestService.getItemReorderRequestList(sessionStorage.getItem('year'),1);
        this.disableGrid = false;
        this.itemReorderRequestService.btnClick.next('');
        this.itemReorderRequestService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.itemReorderRequestService.clickedReorderItem.subscribe(async x=>{
      if(x.voucher_id){
        this.selected = [x];
      }
    }));
  }

  async ngOnInit() {
    this.filterItemReorderRequest = new ItemReorderRequestModel();
    await this.itemReorderRequestService.getItemReorderRequestList(this.endPointService.year,1);
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedItemReorderRequest = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedItemReorderRequest]);
        this.status = this.rows[this.selectedItemReorderRequest].status;
        this.itemReorderRequestService.clickedReorderItem.next(this.rows[this.selectedItemReorderRequest]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedItemReorderRequest = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedItemReorderRequest]);
        this.status = this.rows[this.selectedItemReorderRequest].status;
        this.itemReorderRequestService.clickedReorderItem.next(this.rows[this.selectedItemReorderRequest]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedItemReorderRequest = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.status = this.rows[this.selectedItemReorderRequest].status;
        this.itemReorderRequestService.clickedReorderItem.next(this.rows[this.selectedItemReorderRequest]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterItemReorderRequest;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.orderDate || row.orderDate?.toLowerCase().includes(f.orderDate.toLowerCase()))&&
      (!f.status || row.status?.toLowerCase().includes(f.status.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.status = this.rows[0].status;
    this.itemReorderRequestService.clickedReorderItem.next(this.rows[0]);
  }

  isVisibleGroupingDD() {
    if (this.rows.length != 0) {
      return false;
    }
    else {
      return true;
    }
  }

  async updatePageSize() {
    this.paginate('');
    this.onPageSizeChange(this.controls.pageSize);
  }

  async viewDetails(row: any) {
    this.isLoading = true;
    this.selected = [row];
    this.isLoading = false;
  }
  
  paginate(direction: 'left' | 'right' | ''): void {
    if (direction === 'right' && this.currPage < this.totalPages_pager) {
      this.currPage++;
    } else if (direction === 'left' && this.currPage > 1) {
      this.currPage--;
    }
    this.updatePage();
  }

  goToPage(page: number): void {
    this.currPage = Math.max(1, Math.min(page, this.totalPages_pager));
    this.updatePage();
  }

  onPageSizeChange(newSize: number): void {
    this.controls.pageSize = newSize;
    this.totalPages_pager = Math.max(1, Math.ceil(this.temp.length / newSize));
    this.currPage = Math.min(this.currPage, this.totalPages_pager);
    this.updatePage();
  }

  private updatePage(): void {
    const pageSize = Number(this.controls.pageSize)
    const totalRows = this.temp.length;
    this.totalPages_pager = Math.max(1, Math.ceil(totalRows / pageSize));
    this.currPage = Math.max(1, Math.min(this.currPage, this.totalPages_pager));
    const startIndex = (this.currPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);
    this.rows = this.temp.slice(startIndex, endIndex);
    this.selected = this.rows.length > 0 ? [this.rows[0]] : [];
    this.totRowCounts = totalRows;
    this.startCount = totalRows === 0 ? 0 : startIndex + 1;
    this.endCount = totalRows === 0 ? 0 : endIndex;
    this.leftArrwDisable = this.currPage <= 1;
    this.rightArrwDisable = this.currPage >= this.totalPages_pager;
  }

  getMiddlePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(2, this.currPage - 1);
    const end = Math.min(this.totalPages_pager - 1, this.currPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  ControlsEnableAndDisable() {
    // 1. Run user access check first
    this.userAccessService.CheckUserAccess(this.itemReorderRequestService.FormName, this.itemReorderRequestService);
    const cached = localStorage.getItem('userAccessList');
    if (cached) {
      this.userAccessList = JSON.parse(cached);
    }
    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.itemReorderRequestService.newDisabled.getValue();
    const editDisabled = this.itemReorderRequestService.editDisabled.getValue();
    const deleteDisabled = this.itemReorderRequestService.deleteDisabled.getValue();

    // 3. Only if user access allows (enabled), apply period rules
    let period_status = sessionStorage.getItem('period_status') || '';
    let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; 
    let status = this.status;

    const periodAllowed = this.userAccessService.CheckPeriodAccess(
      status,
      period_status,
      data_entry_status
    );

    if(this.commonService.isSystemAdmin.value == true){
      this.itemReorderRequestService.newDisabled.next(false);
      this.itemReorderRequestService.editDisabled.next(false);
      this.itemReorderRequestService.deleteDisabled.next(false);
      return;
    }

    this.itemReorderRequestService.newDisabled.next(!(periodAllowed && newDisable));
    
    this.itemReorderRequestService.editDisabled.next(
      !(periodAllowed && this.status?.toUpperCase() === 'DRAFT' && editDisabled)
    );
    
    this.itemReorderRequestService.deleteDisabled.next(
      !(periodAllowed && this.status?.toUpperCase() === 'DRAFT' && deleteDisabled)
    );
  }

  OpenPurchaseOrder(row:any){
    this.dashboardService.PurchaseOrder = 1;
    this.dashboardService.clickedPurchaseOrder.next(row); 
    sessionStorage.setItem('clickedPurchaseOrder', JSON.stringify(row)); // ⚠️ store as JSON string
    this.router.navigate(['/Forms/purchase-order']);
  }
}

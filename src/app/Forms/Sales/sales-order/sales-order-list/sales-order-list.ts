import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { SalesOrderModel } from '../../../../Model/SalesOrder/sales-order.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { SalesOrderService } from '../../../../Service/SalesOrderService/sales-order-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'sales-order-list',
  standalone: false,
  templateUrl: './sales-order-list.html',
  styleUrls: ['./sales-order-list.css','../../../common.css']
})
export class SalesOrderList {
 subscription: Subscription[] =  new Array<Subscription>();
  isLoading: boolean = false;
  disableGrid: boolean = false;
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
  selectedSalesOrder: number = 0;
  filterSalesOrder = new SalesOrderModel();
  filteredRows: any[] = [];  
  salesOrderPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

  constructor(public salesOrderService:SalesOrderService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.salesOrderService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.salesOrderPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.salesOrderService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.salesOrderService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.salesOrderService.ngOnInit.subscribe(data=>{
      if(data){
        this.salesOrderService.getSalesOrderList(sessionStorage.getItem('year'),1);
        this.disableGrid = false;
        this.salesOrderService.btnClick.next('');
        this.salesOrderService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.salesOrderService.clickedSalesOrder.subscribe(async x=>{
      if(x?.voucher_id){
        this.selected = [x];
      }
    }));

  }

  async ngOnInit() {
    this.filterSalesOrder = new SalesOrderModel();
    await this.salesOrderService.getSalesOrderList(sessionStorage.getItem('year'),1);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.rows = [];           // Original data
    this.temp = [];
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedSalesOrder = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedSalesOrder]);
        this.salesOrderService.clickedSalesOrder.next(this.rows[this.selectedSalesOrder]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedSalesOrder = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedSalesOrder]);
        this.salesOrderService.clickedSalesOrder.next(this.rows[this.selectedSalesOrder]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedSalesOrder = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.salesOrderService.clickedSalesOrder.next(this.rows[this.selectedSalesOrder]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterSalesOrder;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.salesman_name || row.salesman_name?.toLowerCase().includes(f.salesman_name.toLowerCase()))&&
      (!f.engineer || row.engineer?.toLowerCase().includes(f.engineer.toLowerCase()))&&
      (!f.name || row.name?.toLowerCase().includes(f.name.toLowerCase()))&&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.salesOrderService.clickedSalesOrder.next(this.rows[0]);
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
    let period_status = sessionStorage.getItem('period_status') || '';
    let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; // ⚠️ you had a bug: you were reading period_status twice
   
    const periodAllowed = this.userAccessService.CheckPeriodAccess(
      "",
      period_status,
      data_entry_status
    );

    // 1. Run user access check first
    this.userAccessService.CheckUserAccess(this.salesOrderService.FormName, this.salesOrderService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.salesOrderService.newDisabled.getValue();
    const editDisabled = this.salesOrderService.editDisabled.getValue();
    const deleteDisabled = this.salesOrderService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.salesOrderService.newDisabled.next(false); 
      this.salesOrderService.editDisabled.next(false);
      this.salesOrderService.deleteDisabled.next(false);
      return;
    }

    this.salesOrderService.newDisabled.next(!newDisable);
    this.salesOrderService.editDisabled.next(!editDisabled);
    this.salesOrderService.deleteDisabled.next(!deleteDisabled);

  }

}

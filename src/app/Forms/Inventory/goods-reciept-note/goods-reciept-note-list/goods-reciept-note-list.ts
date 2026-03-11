import { ChangeDetectorRef, Component } from '@angular/core';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { Subscription } from 'rxjs';
import { RecieptEntryService } from '../../../../Service/RecieptEntryService/reciept-entry-service';
import { GRNModel } from '../../../../Model/RecieptEnry/reciept-enry.model';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Pagination } from '../../../../Model/pagingResponse';
import { EndPointService } from '../../../../Service/end-point.services';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../Service/DashboardService/dashboard-service';

@Component({
  selector: 'goods-reciept-note-list',
  standalone: false,
  templateUrl: './goods-reciept-note-list.html',
  styleUrls: ['./goods-reciept-note-list.css','../../../common.css']
})
export class GoodsRecieptNoteList {

  disableGrid: boolean =false;
  rows: any[] = [];           // Original data
  temp:any[] = [];     
  isLoading: boolean = false;
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  controls = {
    pageSize:50
  };
  goodsRecieptPagingResponse: Pagination = new Pagination();
  filterGoodsReciept = new GRNModel();
  startCount:any =0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  userAccessList: any[] = [];
  currPage: number = 1;
  chunkSize: number = 50;
  selectedGoodsReciept: number=0;
  subscription: Subscription[] = new Array<Subscription>();;
  prevPage: number = 0;
  start: number=0;
  end: number=0;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  totRowCounts: number=0;
  endCount: number=0;
  gridHeight:number;
  scroll: boolean = true;
  clrFilterDisable = false;
  approval_status:string ='';
  expBtnDisable: boolean = true;

  constructor(public goodsRecieptService:RecieptEntryService,public endPointService:EndPointService,public userAccessService:UserAccessService,
              private cdRef: ChangeDetectorRef,private purchaseOrderService:PurchaseOrderService, public dashboardService: DashboardService, private router: Router) {
    this.gridHeight = this.endPointService.GridHeight;
    this.subscription.push(this.goodsRecieptService.loadListGRN.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.goodsRecieptPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.goodsRecieptService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.goodsRecieptService.addRowAfterSave.subscribe(data=>{
      if(data.account_code){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
      }
    }));

    this.subscription.push(this.goodsRecieptService.addRowAfterModify.subscribe(data => {
      if (data.account_code) {
        const index = this.rows.findIndex(row => row.account_code === data.account_code);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));

    this.subscription.push(this.goodsRecieptService.isLoading.subscribe(data=>{
      this.isLoading = data;
    }));

    this.subscription.push(this.goodsRecieptService.approvalStatus.subscribe(data=>{
      if(data){
        this.approval_status = data;
        this.selected[0].approval_status = data;
      }
    }));

    this.subscription.push(this.goodsRecieptService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.goodsRecieptService.btnClick.next('');
        this.goodsRecieptService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.goodsRecieptService.ControlsEnableAndDisable.subscribe(data=>{
      this.ControlsEnableAndDisable();
      const hasExpensePermission = this.userAccessList?.some(
        (u: any) => u.permissionName === 'PURCHASE_EXPENSE'
      );

      this.rows.forEach((row: any) => {
        if (row.approval_status == 'Stock Verified' && hasExpensePermission) {
          row.expBtnDisable = false;
        } else {
          row.expBtnDisable = true;
        }
      });
    }));
  }

  async ngOnInit() {
    await this.purchaseOrderService.getItemList().then((res: any[]) => {
      this.goodsRecieptService.ItemList = res;
    });

    await this.goodsRecieptService.getGoodsRecieptList(this.endPointService.year);
    this.cdRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  updateFilter() {
    const f = this.filterGoodsReciept;
    this.filteredRows = this.allRows.filter(row =>
      (!f.register_name || row.register_name?.toLowerCase().includes(f.register_name.toLowerCase())) &&
      (!f.godown_name || row.godown_name?.toLowerCase().includes(f.godown_name.toLowerCase())) &&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase())) &&
      (!f.account_name || row.account_name?.toLowerCase().includes(f.account_name.toLowerCase())) &&
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase())) &&
      (!f.po_no || row.po_no?.toLowerCase().includes(f.po_no.toLowerCase())) &&
      (!f.voucher_date || row.voucher_date?.toLowerCase().includes(f.voucher_date.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.approval_status = this.rows[0].approval_status;
    this.goodsRecieptService.clickedGRN.next(this.rows[0]);
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

  leftAlignCell(): string {
    return 'text-left';
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedGoodsReciept = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedGoodsReciept]);
        this.approval_status = this.rows[this.selectedGoodsReciept].approval_status;
        this.goodsRecieptService.clickedGRN.next(this.rows[this.selectedGoodsReciept]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedGoodsReciept = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedGoodsReciept]);
        this.approval_status = this.rows[this.selectedGoodsReciept].approval_status;
        this.goodsRecieptService.clickedGRN.next(this.rows[this.selectedGoodsReciept]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedGoodsReciept = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.approval_status = this.rows[this.selectedGoodsReciept].approval_status;
        this.goodsRecieptService.clickedGRN.next(this.rows[this.selectedGoodsReciept]);
      }
    }
  }

  OpenPurchaseExpense(row:any){
    this.dashboardService.clickedExpenseEntry.next(row); 
    this.dashboardService.ExpenseEntry = 1;
    sessionStorage.setItem('clickedExpenseEntry', JSON.stringify(row)); // ⚠️ store as JSON string
    this.router.navigate(['/Forms/expense-entry']);

  }

  ControlsEnableAndDisable() {
    // 1. Run user access check first
    this.userAccessService.CheckUserAccess(this.goodsRecieptService.FormName, this.goodsRecieptService);
    const cached = localStorage.getItem('userAccessList');
    if (cached) {
      this.userAccessList = JSON.parse(cached);
    }

    // 2. Read current disable flags after CheckUserAccess
    const newDisabled = this.goodsRecieptService.newDisabled.getValue();
    const editDisabled = this.goodsRecieptService.editDisabled.getValue();
    const deleteDisabled = this.goodsRecieptService.deleteDisabled.getValue();

    // 3. Only if user access allows (enabled), apply period rules
    if (!newDisabled || !editDisabled || !deleteDisabled) {
      let period_status = sessionStorage.getItem('period_status') || '';
      let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; // ⚠️ you had a bug: you were reading period_status twice
      let approval_status = this.approval_status;

      const periodAllowed = this.userAccessService.CheckPeriodAccess(
        approval_status,
        period_status,
        data_entry_status
      );

      if (!periodAllowed && this.approval_status != 'VERIFICATION FAILED' && this.approval_status !== 'DRAFT' ) {
          //this.goodsRecieptService.newDisabled.next(false);
          this.goodsRecieptService.editDisabled.next(true);
          this.goodsRecieptService.deleteDisabled.next(true);
      }
    }

    const row = this.rows[this.selectedGoodsReciept];

    if (row.virtual_store != true && 
        ['DRAFT', 'VERIFICATION FAILED'].includes(row.approval_status)) {
      this.goodsRecieptService.SVDisabled.next(false);
    } else {
      this.goodsRecieptService.SVDisabled.next(true);
    }

    const hasExpensePermission = this.userAccessList?.some( (u: any) => u.permissionName === 'PURCHASE_EXPENSE' );
    if(this.approval_status == 'Stock Verified' && hasExpensePermission){
      row.expBtnDisable = false;
    }else{
      row.expBtnDisable = true;
    }
  }

}

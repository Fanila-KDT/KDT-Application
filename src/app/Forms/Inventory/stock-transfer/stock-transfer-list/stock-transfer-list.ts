import { ChangeDetectorRef, Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { Pagination } from '../../../../Model/pagingResponse';
import { StockTransferModel } from '../../../../Model/StockTransfer/stock-transfer.model';
import { StockTransferService } from '../../../../Service/StockTransferService/stock-transfer-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';

@Component({
  selector: 'stock-transfer-list',
  standalone: false,
  templateUrl: './stock-transfer-list.html',
  styleUrls: ['./stock-transfer-list.css','../../../common.css']
})
export class StockTransferList {
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
  selectedStockTransfer: number=0;
  filterStockTransfer = new StockTransferModel();
  filteredRows: any[] = [];  
  stockTransferPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;
  approval_status:string ='';

  
  constructor(public stockTransferService:StockTransferService,public endPointService:EndPointService,public userAccessService:UserAccessService,
            private cdRef: ChangeDetectorRef,public purchaseOrderService:PurchaseOrderService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.stockTransferService.loadListStockTransfer.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.stockTransferPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.stockTransferService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.stockTransferService.ControlsEnableAndDisable.subscribe(data=>{
      this.ControlsEnableAndDisable()
    }));

    this.subscription.push(this.stockTransferService.ngOnInit.subscribe(data=>{
      if(data){
        this.stockTransferService.getStockTransferList(sessionStorage.getItem('year'),1);
        this.disableGrid = false;
        this.stockTransferService.btnClick.next('');
        this.stockTransferService.cancelClick.next(true);
      }
    }));
  }

  async ngOnInit() {
    await this.stockTransferService.getStockTransferList(this.endPointService.year,1);
    await this.purchaseOrderService.getItemList().then((res: any[]) => {
      this.stockTransferService.ItemList = res;
    });

  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedStockTransfer = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedStockTransfer]);
        this.approval_status = this.rows[this.selectedStockTransfer].approval_status;
        this.stockTransferService.clickedStockTras.next(this.rows[this.selectedStockTransfer]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedStockTransfer = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedStockTransfer]);
        this.approval_status = this.rows[this.selectedStockTransfer].approval_status;
        this.stockTransferService.clickedStockTras.next(this.rows[this.selectedStockTransfer]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedStockTransfer = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.approval_status = this.rows[this.selectedStockTransfer].approval_status;
        this.stockTransferService.clickedStockTras.next(this.rows[this.selectedStockTransfer]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterStockTransfer;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.to_godown || row.to_godown?.toLowerCase().includes(f.to_godown.toLowerCase()))&&
      (!f.from_godown || row.from_godown?.toLowerCase().toString().includes(f.from_godown.toLowerCase().toString()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.approval_status = this.rows[0].approval_status;
    this.stockTransferService.clickedStockTras.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.stockTransferService.FormName, this.stockTransferService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.stockTransferService.newDisable.getValue();
    const editDisabled = this.stockTransferService.editDisabled.getValue();
    const deleteDisabled = this.stockTransferService.editDisabled.getValue();

    // 3. Only if user access allows (enabled), apply period rules
    if ( !newDisable ||  !editDisabled || !deleteDisabled) {
      let period_status = sessionStorage.getItem('period_status') || '';
      let data_entry_status = sessionStorage.getItem('data_entry_status') || ''; 
      let approval_status = this.approval_status;

      const periodAllowed = this.userAccessService.CheckPeriodAccess(
        approval_status,
        period_status,
        data_entry_status
      );

      this.stockTransferService.newDisable.next(!periodAllowed);
      this.stockTransferService.editDisabled.next(!periodAllowed);
      this.stockTransferService.deleteDisabled.next(!periodAllowed);
    }
  }
}
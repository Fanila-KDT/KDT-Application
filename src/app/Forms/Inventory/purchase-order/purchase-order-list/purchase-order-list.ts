import { ChangeDetectorRef, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { PurchaseOrderModel } from '../../../../Model/PurchaseOrder/purchase-order.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { SelectionType } from '@swimlane/ngx-datatable';
import { EndPointService } from '../../../../Service/end-point.services';

@Component({
  selector: 'purchase-order-list',
  standalone: false,
  templateUrl: './purchase-order-list.html',
  styleUrls: ['./purchase-order-list.css', '../../../common.css'],
})
export class PurchaseOrderList {
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
  purchaseOrderPagingResponse: Pagination = new Pagination();
  filterPurchaseOrder = new PurchaseOrderModel();
  startCount:any =0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  currPage: number = 1;
  chunkSize: number = 50;
  selectedPurchaseOrder: number=0;
  subscription: Subscription[];
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

  constructor(public purchaseOrderService:PurchaseOrderService,public endPointService:EndPointService,public userAccessService:UserAccessService,private cdRef: ChangeDetectorRef) {
    this.subscription = new Array<Subscription>();
    this.gridHeight = this.endPointService.GridHeight;
    this.subscription.push(this.purchaseOrderService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];  
          this.rows = this.rows.map((row, index) => {
            return {
              ...row,
              sl_no: index + 1   // index starts at 0, so add 1
            };
          });
          this.temp = [...this.rows];
          this.selected = [this.rows[0]];
          this.purchaseOrderPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
          this.allRows = [];
        }
      }
    }));

    this.subscription.push(this.purchaseOrderService.addRowAfterSave.subscribe(data=>{
      if(data.document_number){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
        this.purchaseOrderService.selectedDocNo =  data.register_name;
      }
    }));

    this.subscription.push(this.purchaseOrderService.addRowAfterModify.subscribe(data => {
      if (data.document_number) {
        this.purchaseOrderService.selectedDocNo =  data.register_name;
        const index = this.rows.findIndex(row => row.document_number === data.document_number);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));
    
    this.subscription.push(this.purchaseOrderService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.purchaseOrderService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.purchaseOrderService.btnClick.next('');
        this.purchaseOrderService.cancelClick.next(true);
      }
    }));
  }

  ngOnInit(){
    this.purchaseOrderService.getPurchaseOrderList(this.endPointService.year);
    this.userAccessService.CheckUserAccess(this.purchaseOrderService.FormName,this.purchaseOrderService);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }


  updateFilter() {
    const f = this.filterPurchaseOrder;

    this.filteredRows = this.allRows.filter(row =>
      (!f.register_name || row.register_name?.toLowerCase().includes(f.register_name.toLowerCase())) &&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase())) &&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase())) &&
      (!f.account_name || row.account_name?.toLowerCase().includes(f.account_name.toLowerCase())) &&
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))
    );

    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.purchaseOrderService.clickedPO.next(this.rows[0]);
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
          this.selectedPurchaseOrder = 1 + rowIndex;
          this.viewDetails(this.rows[this.selectedPurchaseOrder]);
          this.cdRef.markForCheck();
          this.purchaseOrderService.clickedPO.next(this.rows[this.selectedPurchaseOrder]);
          this.cdRef.markForCheck();
        } 
        else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
        {
          this.selectedPurchaseOrder = rowIndex - 1;
          this.viewDetails(this.rows[this.selectedPurchaseOrder]);
          this.cdRef.markForCheck();
          this.purchaseOrderService.clickedPO.next(this.rows[this.selectedPurchaseOrder]);
          this.cdRef.markForCheck();
        }
        else if (event.type == 'click') 
        {
          let rowItem = event.row;
          this.selectedPurchaseOrder = this.rows.indexOf(rowItem);
          this.viewDetails(event.row);
          this.cdRef.markForCheck();
          this.purchaseOrderService.clickedPO.next(this.rows[this.selectedPurchaseOrder]);
          this.cdRef.markForCheck();
        }
      }
      this.cdRef.markForCheck();
    }
}

import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { DeliveryNoteModel } from '../../../../Model/DeliveryNote/delivery-note.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { DeliveryNoteService } from '../../../../Service/DeliveryNoteService/delivery-note-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'delivery-note-list',
  standalone: false,
  templateUrl: './delivery-note-list.html',
  styleUrls: ['./delivery-note-list.css','../../../common.css']
})
export class DeliveryNoteList {
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
  selectedDeliveryNote: number = 0;
  filterDeliveryNote = new DeliveryNoteModel();
  filteredRows: any[] = [];  
  deliveryNotePagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

  constructor(public deliveryNoteService:DeliveryNoteService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.deliveryNoteService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.deliveryNotePagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.deliveryNoteService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.deliveryNoteService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.deliveryNoteService.ngOnInit.subscribe(data=>{
      if(data){
        this.deliveryNoteService.getDeliveryNoteList(sessionStorage.getItem('year'),1);
        this.disableGrid = false;
        this.deliveryNoteService.btnClick.next('');
        this.deliveryNoteService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.deliveryNoteService.clickedDeliveryNote.subscribe(async x=>{
      if(x?.voucher_id){
        this.selected = [x];
      }
    }));

    this.subscription.push(this.deliveryNoteService.Status.subscribe(([status,status_remarks]) => {
      if (status !='') {
        const idx = this.rows.findIndex(r => r.voucher_id === this.deliveryNoteService.voucher_id);
        if (idx !== -1) {
          this.rows[idx] = { ...this.rows[idx], approval_status: status }; // immutable update
        }
      }
    }));

  }

  async ngOnInit() {
    this.filterDeliveryNote = new DeliveryNoteModel();
    await this.deliveryNoteService.getDeliveryNoteList(sessionStorage.getItem('year'),1);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.rows = [];           // Original data
    this.temp = [];
    this.deliveryNoteService.Status.next(['','']);
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedDeliveryNote = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedDeliveryNote]);
        this.deliveryNoteService.clickedDeliveryNote.next(this.rows[this.selectedDeliveryNote]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedDeliveryNote = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedDeliveryNote]);
        this.deliveryNoteService.clickedDeliveryNote.next(this.rows[this.selectedDeliveryNote]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedDeliveryNote = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.deliveryNoteService.clickedDeliveryNote.next(this.rows[this.selectedDeliveryNote]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterDeliveryNote;
    this.filteredRows = this.allRows.filter(row =>
      (!f.document_number || row.document_number?.toLowerCase().includes(f.document_number.toLowerCase()))&&
      (!f.voucherDate || row.voucherDate?.toLowerCase().includes(f.voucherDate.toLowerCase()))&&
      (!f.godown_name || row.godown_name?.toLowerCase().includes(f.godown_name.toLowerCase()))&&
      (!f.order_no || row.order_no?.toLowerCase().includes(f.order_no.toLowerCase()))&&
      (!f.name || row.name?.toLowerCase().includes(f.name.toLowerCase()))&&
      (!f.approval_status || row.approval_status?.toLowerCase().includes(f.approval_status.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.deliveryNoteService.clickedDeliveryNote.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.deliveryNoteService.FormName, this.deliveryNoteService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.deliveryNoteService.newDisabled.getValue();
    const editDisabled = this.deliveryNoteService.editDisabled.getValue();
    const deleteDisabled = this.deliveryNoteService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.deliveryNoteService.newDisabled.next(false); 
      this.deliveryNoteService.editDisabled.next(false);
      this.deliveryNoteService.deleteDisabled.next(false);
      return;
    }

    if(this.deliveryNoteService.approval_status?.toUpperCase() === 'PENDING' || this.deliveryNoteService.approval_status?.toUpperCase() === 'LOST' 
        || this.deliveryNoteService.approval_status?.toUpperCase() === 'REJECTED' || this.deliveryNoteService.approval_status?.toUpperCase() === 'APPROVED'){
      this.deliveryNoteService.editDisabled.next(!(periodAllowed && editDisabled));
      this.deliveryNoteService.deleteDisabled.next(!(periodAllowed && deleteDisabled));
      this.deliveryNoteService.changeStatus.next(!(periodAllowed));
    }else{
      this.deliveryNoteService.editDisabled.next(true);
      this.deliveryNoteService.deleteDisabled.next(true);
      this.deliveryNoteService.changeStatus.next(true);
    }
    this.deliveryNoteService.newDisabled.next(!(periodAllowed && newDisable));

  }

}

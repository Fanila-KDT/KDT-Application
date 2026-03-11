import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { SupplierMasterModel } from '../../../../Model/SupplierMaster/supplier-master.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { Subscription } from 'rxjs';
import { SupplierMasterService } from '../../../../Service/SupplierMasterService/supplier-master-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'supplier-master-list',
  standalone: false,
  templateUrl: './supplier-master-list.html',
  styleUrls: ['./supplier-master-list.css','../../../common.css']
})
export class SupplierMasterList {
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
  supplierMasterPagingResponse: Pagination = new Pagination();
  filterSupplierMaster = new SupplierMasterModel();
  startCount:any =0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  currPage: number = 1;
  chunkSize: number = 50;
  selectedSupplierMaster: number=0;
  subscription: Subscription[];
  prevPage: number = 0;
  start: number=0;
  end: number=0;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  totRowCounts: number=0;
  endCount: number=0;
  gridHeight:number=384;
  scroll: boolean = true;
  clrFilterDisable = false;

  constructor(public supplierMasterService:SupplierMasterService,public userAccessService:UserAccessService) {
    this.subscription = new Array<Subscription>();
    this.subscription.push(this.supplierMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.supplierMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.supplierMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.supplierMasterService.addRowAfterSave.subscribe((data:any) =>{
      if(data){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
      }
    }));

    this.subscription.push(this.supplierMasterService.addRowAfterModify.subscribe((data:any) => {
      if (data) {
        const index = this.rows.findIndex(row => row.account_code === data.account_code);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));

    this.subscription.push(this.supplierMasterService.isLoading.subscribe(data=>{
      this.isLoading = data;
    }));

    this.subscription.push(this.supplierMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.supplierMasterService.btnClick.next('');
        this.supplierMasterService.cancelClick.next(true);
      }
    }));
  }

  async ngOnInit() {
    this.supplierMasterService.isLoading.next(true);
    await this.supplierMasterService.getSupplierMasterList();
    this.supplierMasterService.isLoading.next(false);
    this.userAccessService.CheckUserAccess(this.supplierMasterService.FormName,this.supplierMasterService);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  updateFilter() {
    const f = this.filterSupplierMaster;
    this.filteredRows = this.allRows.filter(row =>
      (!f.ac_code || row.ac_code?.toString().includes(f.ac_code.toString())) &&
      (!f.account_name || row.account_name?.toLowerCase().includes(f.account_name.toLowerCase())) &&
      (!f.cur_name || row.cur_name?.toLowerCase().includes(f.cur_name.toLowerCase())) &&
      (!f.group_name || row.group_name?.toLowerCase().includes(f.group_name.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.supplierMasterService.clickedSupplier.next(this.rows[0]);
  }


  onRowSelect(event: any) {
   this.supplierMasterService.clickedSupplier.next(event.selected[0]);
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
  
    updateGridHeight(): number {
      const rowHeight = 30; // Adjust based on your row styling
      const headerHeight = 60;
      const footerHeight = 80;
      const buffer = 10;
      if(this.rows.length != 0){
        const calculatedHeight =  this.rows.length * rowHeight + headerHeight + footerHeight + buffer;
        const minLen = Math.max(250, calculatedHeight)
        return Math.min(minLen, 400); // ✅ cap at 400px
      }else{
        const calculatedHeight =  1 * rowHeight + headerHeight + footerHeight + buffer;
        return Math.min(calculatedHeight, 400); // ✅ cap at 400px
      }
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
        this.selectedSupplierMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedSupplierMaster]);
        this.supplierMasterService.clickedSupplier.next(this.rows[this.selectedSupplierMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedSupplierMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedSupplierMaster]);
        this.supplierMasterService.clickedSupplier.next(this.rows[this.selectedSupplierMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedSupplierMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.supplierMasterService.clickedSupplier.next(this.rows[this.selectedSupplierMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
    }
  }
}

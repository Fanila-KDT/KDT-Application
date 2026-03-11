import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { WarehouseMasterModel } from '../../../../Model/WarehouseMaster/warehouse-master.model';
import { Pagination } from '../../../../Model/pagingResponse';
import { WarehouseMasterService } from '../../../../Service/WarehouseMasterService/warehouse-master-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { EndPointService } from '../../../../Service/end-point.services';

@Component({
  selector: 'warehouse-master-list',
  standalone: false,
  templateUrl: './warehouse-master-list.html',
  styleUrls: ['./warehouse-master-list.css','../../../common.css']
})
export class WarehouseMasterList {
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
  warehouseMasterPagingResponse: Pagination = new Pagination();
  filterWarehouseMaster = new WarehouseMasterModel();
  startCount:any =0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  currPage: number = 1;
  chunkSize: number = 50;
  selectedWarehouseMaster: number=0;
  subscription: Subscription[];
  prevPage: number = 0;
  start: number=0;
  end: number=0;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  totRowCounts: number=0;
  endCount: number=0;
  gridHeight:number = 0;
  scroll: boolean = true;
  clrFilterDisable = false;

  constructor(public warehouseMasterService:WarehouseMasterService,public userAccessService:UserAccessService, public endPointService: EndPointService) {
    this.gridHeight = this.endPointService.GridHeight;
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.warehouseMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.warehouseMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.warehouseMasterService.addRowAfterSave.subscribe(data=>{
      if(data.godown_code){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
        this.warehouseMasterService.selectedWerName =  data.godown_name;
      }
    }));

    this.subscription.push(this.warehouseMasterService.addRowAfterModify.subscribe(data => {
      if (data.godown_code) {
        this.warehouseMasterService.selectedWerName =  data.godown_name;
        const index = this.rows.findIndex(row => row.godown_code === data.godown_code);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));
    
    this.subscription.push(this.warehouseMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.warehouseMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.warehouseMasterService.btnClick.next('');
        this.warehouseMasterService.cancelClick.next(true);
      }
    }));
  }

  ngOnInit(){
    this.warehouseMasterService.getWarehouseMasterList();
    this.userAccessService.CheckUserAccess(this.warehouseMasterService.FormName,this.warehouseMasterService);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }
  
  onRowSelect(event: any) {
   this.warehouseMasterService.clickedWarehouse.next(event.selected[0]);
  }

  updateFilter() {
    const f = this.filterWarehouseMaster;

    this.filteredRows = this.allRows.filter(row =>
      (!f.godown_name || row.godown_name?.toLowerCase().includes(f.godown_name.toLowerCase())) &&
      (!f.godown_name_abbr || row.godown_name_abbr?.toLowerCase().includes(f.godown_name_abbr.toLowerCase()))
    );

    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.warehouseMasterService.clickedWarehouse.next(this.rows[0]);
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
        this.selectedWarehouseMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedWarehouseMaster]);
        this.warehouseMasterService.clickedWarehouse.next(this.rows[this.selectedWarehouseMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedWarehouseMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedWarehouseMaster]);
        this.warehouseMasterService.clickedWarehouse.next(this.rows[this.selectedWarehouseMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedWarehouseMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.warehouseMasterService.clickedWarehouse.next(this.rows[this.selectedWarehouseMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
    }
  }
}

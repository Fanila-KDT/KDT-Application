import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Pagination } from '../../../../Model/pagingResponse';
import { Subscription } from 'rxjs';
import { CurrencyMasterService } from '../../../../Service/CurrencyMasterService/currency-master-service';
import { CurrencyMasterModel } from '../../../../Model/CurrencyMaster/currency-master.model';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'currency-master-list',
  standalone: false,
  templateUrl: './currency-master-list.html',
  styleUrls: ['./currency-master-list.css','../../../common.css']
})
export class CurrencyMasterList {
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
  currencyMasterPagingResponse: Pagination = new Pagination();
  filterCurrencyMaster = new CurrencyMasterModel();
  startCount:any =0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  currPage: number = 1;
  chunkSize: number = 50;
  selectedCurrencyMaster: number=0;
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

  constructor(public currencyMasterService:CurrencyMasterService,public userAccessService:UserAccessService) {
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.currencyMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.currencyMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.currencyMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.currencyMasterService.addRowAfterSave.subscribe(data=>{
      if(data.cur_no){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
      }
    }));
    
    this.subscription.push(this.currencyMasterService.addRowAfterModify.subscribe(data => {
      if (data.cur_no) {
        const index = this.rows.findIndex(row => row.cur_no === data.cur_no);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));
    
    this.subscription.push(this.currencyMasterService.isLoading.subscribe(data=>{
      this.isLoading = data;
    }));

    this.subscription.push(this.currencyMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.currencyMasterService.btnClick.next('');
        this.currencyMasterService.cancelClick.next(true);
      }
    }));
  }    

  async ngOnInit() {
    this.currencyMasterService.isLoading.next(true);
    await this.currencyMasterService.getCurrencyMasterList();
    this.currencyMasterService.isLoading.next(false);
    this.userAccessService.CheckUserAccess(this.currencyMasterService.FormName,this.currencyMasterService);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  updateFilter() {
    const f = this.filterCurrencyMaster;

    this.filteredRows = this.allRows.filter(row =>
      (!f.cur_desc || row.cur_desc?.toLowerCase().includes(f.cur_desc.toLowerCase())) &&
      (!f.cur_name || row.cur_name?.toLowerCase().includes(f.cur_name.toLowerCase()))
    );

    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.currencyMasterService.clickedCurrency.next(this.rows[0]);
  }


  onRowSelect(event: any) {
   this.currencyMasterService.clickedCurrency.next(event.selected[0]);
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
        this.selectedCurrencyMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedCurrencyMaster]);
        this.currencyMasterService.clickedCurrency.next(this.rows[this.selectedCurrencyMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedCurrencyMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedCurrencyMaster]);
        this.currencyMasterService.clickedCurrency.next(this.rows[this.selectedCurrencyMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedCurrencyMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.currencyMasterService.clickedCurrency.next(this.rows[this.selectedCurrencyMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
    }
  }
}

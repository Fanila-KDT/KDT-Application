import { Component } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';
import { Pagination } from '../../../../Model/pagingResponse';
import { ProductMasterModel } from '../../../../Model/ProductMaster/product-master.model';
import { Subscription } from 'rxjs';
import { ProductMasterService } from '../../../../Service/ProductMasterService/product-master-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { EndPointService } from '../../../../Service/end-point.services';

@Component({
  selector: 'product-master-list',
  standalone: false,
  templateUrl: './product-master-list.html',
  styleUrls: ['./product-master-list.css', '../../../common.css']
})
export class ProductMasterList {

  rows: any[] = [];           // Original data
  temp:any[] = [];            // Temp data 
  isLoading: boolean = false;
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  controls = {
    pageSize:50
  };
  productMasterPagingResponse: Pagination = new Pagination();
  filterProductMaster = new ProductMasterModel();
  startCount:any =0;
  totalPages_pager: number =1;
  allRows: any[] = []; // full dataset
  filteredRows: any[] = []; // current visible chunk
  currPage: number = 1;
  selectedProductMaster: number=0;
  subscription: Subscription[];
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  totRowCounts: number=0;
  endCount: number=0;
  gridHeight: number = 0;
  scroll: boolean = true;
  disableGrid: boolean =false;
  constructor(public productMasterService:ProductMasterService,public userAccessService:UserAccessService, public endPointService: EndPointService) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription = new Array<Subscription>();
    this.subscription.push(this.productMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.productMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.productMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.productMasterService.pushprevCode.subscribe(data => {
      if(data.item_no){
        const row = this.rows.find(r => r.item_no === data.item_no);
        if (!row) return;
         row.item_code = this.productMasterService.NewItemCode;
      }
    }));

    this.subscription.push(this.productMasterService.addRowAfterSave.subscribe(data=>{
      if(data.item_no){
        this.rows.unshift(data);
        this.selected = [this.rows[0]];
      }
    }));

    this.subscription.push(this.productMasterService.addRowAfterModify.subscribe(data => {
      if (data.item_no) {
        const index = this.rows.findIndex(row => row.item_no === data.item_no);
        if (index !== -1) {
          this.rows.splice(index, 1, data);
        }
        this.selected = [data];
      }
    }));

    this.subscription.push(this.productMasterService.isLoading.subscribe(data=>{
      this.isLoading = data;
    }));

    this.subscription.push(this.productMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.ngOnInit();
        this.disableGrid = false;
        this.productMasterService.btnClick.next('');
        this.productMasterService.cancelClick.next(true);
      }
    }));
  }

  ngOnInit() {
    this.productMasterService.getProductMasterList();
    this.userAccessService.CheckUserAccess(this.productMasterService.FormName,this.productMasterService);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  updateFilter() {
    const f = this.filterProductMaster;

    this.filteredRows = this.allRows.filter(row =>
      (!f.item_code || row.item_code?.toLowerCase().includes(f.item_code.toLowerCase())) &&
      (!f.item_name || row.item_name?.toLowerCase().includes(f.item_name.toLowerCase())) &&
      (!f.item_name_abbr || row.item_name_abbr?.toLowerCase().includes(f.item_name_abbr.toLowerCase())) &&
      (!f.category_name || row.category_name?.toLowerCase().includes(f.category_name.toLowerCase())) &&
      (!f.bin_location || row.bin_location?.toLowerCase().includes(f.bin_location.toLowerCase())) &&
      (!f.brand_name|| row.brand_name?.toLowerCase().includes(f.brand_name.toLowerCase())) &&
      (!f.product_type || row.product_type?.toLowerCase().includes(f.product_type.toLowerCase()))
    );

      this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
      this.currPage = 1; // ✅ Reset to first page
      this.updatePage(); // ✅ Apply pagination
      this.productMasterService.clickedProduct.next(this.rows[0]);
  }

  onActivate(event: any) {
    let rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if(rowIndex+1!=this.controls.pageSize){
      if (event.type === 'keydown' && (event.event.code === 'ArrowDown'))
      {
        // Get Selected Row Index
        this.selectedProductMaster =rowIndex + 1 ;
        this.viewDetails(this.rows[this.selectedProductMaster]);
        this.productMasterService.clickedProduct.next(this.rows[this.selectedProductMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedProductMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedProductMaster]);
        this.productMasterService.clickedProduct.next(this.rows[this.selectedProductMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedProductMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.productMasterService.clickedProduct.next(this.rows[this.selectedProductMaster]);
        let indexv = this.rows.indexOf(rowItem)
        //this.ControlsEnableDisable(1,indexv)
      }
    }
  }

  onRowSelect(event: any) {
   this.productMasterService.clickedProduct.next(event.selected[0]);
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
   // this.isLoading = true;
    this.selected = [row];
   // this.isLoading = false;
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

}

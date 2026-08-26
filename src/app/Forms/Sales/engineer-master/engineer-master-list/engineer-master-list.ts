import { ChangeDetectorRef, Component } from '@angular/core';
import { Pagination } from '../../../../Model/pagingResponse';
import { EngineerMasterModel } from '../../../../Model/EngineerMaster/engineer-master.model';
import { Subscription } from 'rxjs';
import { SelectionType } from '@swimlane/ngx-datatable';
import { EngineerMasterService } from '../../../../Service/EngineerMasterService/engineer-master-service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'engineer-master-list',
  standalone: false,
  templateUrl: './engineer-master-list.html',
  styleUrls: ['./engineer-master-list.css','../../../common.css']
})
export class EngineerMasterList {
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
  selectedEngineerMaster: number=0;
  filterEngineerMaster = new EngineerMasterModel();
  filteredRows: any[] = [];  
  engineerMasterPagingResponse: Pagination = new Pagination();
  startCount:any = 0;
  totalPages : number = 0;
  totalPages_pager: number =1;
  allRows: any[] = []; 
  userAccessList: any[] = [];
  chunkSize: number = 50;
  leftArrwDisable: boolean = true;
  rightArrwDisable: boolean = false;
  endCount: number=0;

   constructor(public engineerMasterService:EngineerMasterService,public commonService:CommonService,public endPointService:EndPointService,public userAccessService:UserAccessService,
            private cdRef: ChangeDetectorRef) {
    this.gridHeight = this.endPointService.GridHeight;

    this.subscription.push(this.engineerMasterService.loadList.subscribe(async data => {
      if(data){
        if (data.length !== 0 ) {
          this.allRows = [...data]; // Save full dataset
          this.rows = [...data];    // Initial display
          this.temp = [...data];
          this.selected = [this.rows[0]];
          this.engineerMasterPagingResponse.TotalItems = this.rows.length;
          await this.viewDetails(this.rows[0]);
          await this.updatePageSize();
          this.cdRef.markForCheck();
        }else{
          this.rows = [];
          this.temp = [];
        }
      }
    }));

    this.subscription.push(this.engineerMasterService.disableGrid.subscribe(data=>{
      this.disableGrid = data;
    }));

    this.subscription.push(this.engineerMasterService.ControlsEnableAndDisable.subscribe(data=>{
      if(data){
        this.ControlsEnableAndDisable();
      }
    }));

    this.subscription.push(this.engineerMasterService.ngOnInit.subscribe(data=>{
      if(data){
        this.engineerMasterService.getEngineerMasterList(1);
        this.disableGrid = false;
        this.engineerMasterService.btnClick.next('');
        this.engineerMasterService.cancelClick.next(true);
      }
    }));

    this.subscription.push(this.engineerMasterService.clickedEngineer.subscribe(async x=>{
      if(x.engineer_id){
        this.selected = [x];
      }
    }));
  }

  async ngOnInit() {
    this.filterEngineerMaster = new EngineerMasterModel();
    await this.engineerMasterService.getEngineerMasterList(1);
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
        this.selectedEngineerMaster = 1 + rowIndex;
        this.viewDetails(this.rows[this.selectedEngineerMaster]);
        this.engineerMasterService.clickedEngineer.next(this.rows[this.selectedEngineerMaster]);
      } 
      else if (event.type === 'keydown' && (event.event.code === 'ArrowUp'))
      {
        this.selectedEngineerMaster = rowIndex - 1;
        this.viewDetails(this.rows[this.selectedEngineerMaster]);
        this.engineerMasterService.clickedEngineer.next(this.rows[this.selectedEngineerMaster]);
      }
      else if (event.type == 'click') 
      {
        let rowItem = event.row;
        this.selectedEngineerMaster = this.rows.indexOf(rowItem);
        this.viewDetails(event.row);
        this.engineerMasterService.clickedEngineer.next(this.rows[this.selectedEngineerMaster]);
      }
    }
  }

  leftAlignCell(): string {
    return 'text-left';
  }

  updateFilter() {
    const f = this.filterEngineerMaster;
    this.filteredRows = this.allRows.filter(row =>
      (!f.engineer_id || row.engineer_id?.toLowerCase().includes(f.engineer_id.toLowerCase()))&&
      (!f.engineer || row.engineer?.toLowerCase().includes(f.engineer.toLowerCase()))
    );
    this.temp = [...this.filteredRows]; // ✅ Store filtered data for pagination
    this.currPage = 1; // ✅ Reset to first page
    this.updatePage(); // ✅ Apply pagination
    this.engineerMasterService.clickedEngineer.next(this.rows[0]);
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
    this.userAccessService.CheckUserAccess(this.engineerMasterService.FormName, this.engineerMasterService);

    // 2. Read current disable flags after CheckUserAccess
    const newDisable = this.engineerMasterService.newDisabled.getValue();
    const editDisabled = this.engineerMasterService.editDisabled.getValue();
    const deleteDisabled = this.engineerMasterService.deleteDisabled.getValue();

    if(this.commonService.isSystemAdmin.value == true){
      this.engineerMasterService.newDisabled.next(false); 
      this.engineerMasterService.editDisabled.next(false);
      this.engineerMasterService.deleteDisabled.next(false);
      return;
    }

    this.engineerMasterService.newDisabled.next(!newDisable);
    this.engineerMasterService.editDisabled.next(!editDisabled);
    this.engineerMasterService.deleteDisabled.next(!deleteDisabled);
  }

}

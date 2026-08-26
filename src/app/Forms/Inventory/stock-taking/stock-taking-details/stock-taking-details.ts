import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { StockTakingDetail, StockTakingHeader, StockTakingModel } from '../../../../Model/StockTaking/stock-taking.model';
import { Subscription } from 'rxjs';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { StockTakingService } from '../../../../Service/StockTakingService/stock-taking-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import Swal from 'sweetalert2';
import { DateModelInventory } from '../../../../Model/CommonModel';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'stock-taking-details',
  standalone: false,
  templateUrl: './stock-taking-details.html',
  styleUrls: ['./stock-taking-details.css','../../../common.css'],
  providers: [DatePipe]
})
export class StockTakingDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  stockTaking: StockTakingModel = new StockTakingModel();
  stockTakingHeader: StockTakingHeader = new StockTakingHeader();
  stockTakingTemp: StockTakingModel = new StockTakingModel();
  stockTakingGridModel: StockTakingDetail[] =[];
  subscription: Subscription[] = new Array<Subscription>();
  dateModel: DateModelInventory = new DateModelInventory();
  saveDisable:boolean = true;
  cancelDisable:boolean = true;
  rows: any[] = []; 
  rowTemp: any[] = [];
  godownList: any[] = [];
  isEditable: boolean = true;
  statusDisable: boolean = true;
  scroll: boolean = true;
  gridHeight:number=350;
  reorderable = true;
  SelectionType = SelectionType;
  selected: any[] = [];
  btnType :string = '';
  isWarehouseInvalid: boolean = false;

  constructor(private datePipe: DatePipe,public stockTakingService:StockTakingService,public alertService:AlertService,public commonService:CommonService,public endPointService: EndPointService,
    private cdRef: ChangeDetectorRef,public purchaseOrderService:PurchaseOrderService) {

    this.subscription.push(this.stockTakingService.clickedStockTras.subscribe(async x=>{
      this.stockTakingService.ControlsEnableAndDisable.next(true);
      if(!x){
        this.stockTaking =  new StockTakingModel();
        this.rows =[];
        return;
      }
      this.stockTaking = {...x};
      try {
        const items = await this.stockTakingService.getStockTakingDetails(this.stockTaking.stock_taking_id);
        if (items && items.length) {
          this.rows = items.slice();
          this.rowTemp = this.clone(this.rows);
        } else {
          this.rows = [];
          this.rowTemp = [];
        }
      } catch (err) {
        console.error('Error fetching ItemDetails', err);
        this.rows = [];
        this.rowTemp = [];
      }
    }));

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));

    this.subscription.push(this.stockTakingService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  async ngOnInit(){
    this.commonService.getFullWarehouseList(this.endPointService.companycode).then((res: any[]) => {
      this.godownList = res;
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.stockTakingService.disableGrid.next(false);
    this.stockTakingService.disabledItems.next(false);
    this.stockTakingService.btnClick.next('');
    this.rows =[];
    this.rowTemp =[];
    this.stockTaking = new StockTakingModel(); 
    this.godownList =[];
    this.stockTakingHeader = new StockTakingHeader();
    this.stockTakingTemp = new StockTakingModel();
    this.stockTakingGridModel = [];
  }

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
  
  async btnClickFunction(x: string) {
    this.btnType = x;
    this.stockTakingTemp = {...this.stockTaking};
    if(x =='N'){
      this.stockTaking = new StockTakingModel();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
      this.rows = [];
      this.stockTaking.stock_date =  new Date();
      this.stockTaking.stockDate =  new Date();
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
    }else if(x =='D'){
      this.onDelete();
    }
  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.stockTaking.stock_date = date;
  }

  formatToDateInput(value: string): void {
    this.stockTaking.stock_date = value;
  }

  onSubListActivate(event: any) {
    const rowItem = event.row;
    let rowIndex = this.rows.indexOf(rowItem);

    if (event.type === 'keydown') {
      if (event.event.code === 'ArrowDown' && rowIndex < this.rows.length - 1) {
        rowIndex++;
        this.selected = [this.rows[rowIndex]];
        this.scrollToIndex(rowIndex);
      } else if (event.event.code === 'ArrowUp' && rowIndex > 0) {
        rowIndex--;
        this.selected = [this.rows[rowIndex]];
        this.scrollToIndex(rowIndex);
      }
    }
  }

  scrollToIndex(index: number) {
    const rowHeight = this.rows.length; // same as [rowHeight]
    const bodyElement = this.table?.element.querySelector('.datatable-body');

    if (bodyElement) {
      const maxScroll = bodyElement.scrollHeight - bodyElement.clientHeight;
      const targetScroll = index * rowHeight;

      bodyElement.scrollTop = Math.min(targetScroll, maxScroll);
    }
  }

  async loadGodowns(){
    if(this.stockTaking.godown_code){
      var response;
      if(this.btnType == 'N'){
        response = await this.stockTakingService.checkWarehouse(this.stockTaking.godown_code);
      }
      if(response == true){
        this.alertService.triggerAlert('Warehouse Detail is already Entered. Please try to Modify.', 6000, 'error');
        return;
      }else{
         try {
        const items = await this.stockTakingService.getStockTakingDetailLoad(this.stockTaking.godown_code, sessionStorage.getItem('year') || '');
        if (items && items.length) {
          this.rows = items.slice();
          this.rowTemp = this.clone(this.rows);
        } else {
          this.rows = [];
          this.rowTemp = [];
        }
      } catch (err) {
        console.error('Error fetching ItemDetails', err);
        this.rows = [];
        this.rowTemp = [];
      }
      }
    }
    else{
      this.alertService.triggerAlert('Please select a Godown...', 4000, 'error');
    }
  }

  PhysicalQtyChange = this.debounce((row: any) => {
    if(row.physical_qty < 0){
      this.alertService.triggerAlert('Please enter a valid quantity.',3000,'error');
      row.physical_qty = 0;
    }
    row.variance_qty = row.physical_qty -row.system_qty;
  }, 200);

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  async onSubmit(StockTakingForm:any){
    const isValid = await this.validateForm(this.stockTaking);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    if (this.rows.length == 0) {
      this.alertService.triggerAlert('Row items could not be empty.', 3000, 'error');
      return ;
    }
    await this.AssignValues();

    this.stockTakingService.saveStockTaking(this.stockTakingHeader, this.stockTakingGridModel,this.dateModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.stockTakingService.getStockTakingList(sessionStorage.getItem('year'),2);
        let item: StockTakingModel | undefined = this.stockTakingService.mainList.find(item => item.stock_taking_id === response.stockTakingHeader.stock_taking_id);
        if (item) {
          await this.stockTakingService.loadListStockTaking.next(this.stockTakingService.mainList);
          this.stockTakingService.clickedStockTras.next(item); // pass single object
        }
        this.stockTakingService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.isEditable = true;
        this.stockTakingService.disabledItems.next(false);
        this.stockTakingService.disableGrid.next(false);
        this.stockTakingService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.stockTakingService.btnClick.next('');
      }
    });
  }
  
  async AssignValues(){
    // Header Details
    this.stockTakingHeader = {
      stock_taking_id: this.stockTaking.stock_taking_id,
      period_id: Number(sessionStorage.getItem('year')),
      voucher_reference: this.stockTaking.voucher_reference? this.stockTaking.voucher_reference : null,
      godown_code: this.stockTaking.godown_code,
      ...(this.btnType === 'N'
      ? {
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          approved_by: null,modified_by: null,modified_on: null,
          approval_status : 'DRAFT',
          createdt :null,
          approver_remarks: null,
          stock_date: this.stockTaking.stock_date
        }
      : {
          document_number: this.stockTaking.document_number,
          created_by: this.stockTaking.created_by,
          modified_by: localStorage.getItem('user_id'),
          modified_on: null,
          stock_date: new Date(new Date(this.stockTaking.stock_date).setDate(new Date(this.stockTaking.stock_date).getDate() + 1)),
          approved_by: this.stockTaking.approved_by,
          approval_status: this.stockTaking.approval_status,
          createdt: this.stockTaking.createdt,
          approver_remarks: this.stockTaking.approver_remarks
        })
    };
    const stock_date = this.datePipe.transform(this.stockTaking.stock_date, 'dd/MM/yyyy');
    this.dateModel.stock_date = stock_date;

    //Grid Details
    this.stockTakingGridModel = await this.mapItemsToDetails(this.rows);
  }

  async mapItemsToDetails(items: any[]): Promise<StockTakingDetail[]> {
    const detailsList: StockTakingDetail[] = [];
    for (const item of items) {
      const details = new StockTakingDetail();
      details.detail_id = item.detail_id ? item.detail_id : null;
      details.stock_taking_id = null;
      details.item_no = item.item_no;
      details.system_qty = item.system_qty;
      details.physical_qty = item.physical_qty;
      details.variance_qty = item.variance_qty;
      details.remarks = item.remarks;
      detailsList.push(details);
    }
    return detailsList;
  }

  async validateForm(model: StockTakingModel): Promise<boolean> {
    // Reset validation flags
    this.isWarehouseInvalid = !model.godown_code;
    const isValid = !this.isWarehouseInvalid;
    return isValid;
  }

  cancelClickMethod(){
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.stockTakingService.disableGrid.next(false);
    this.rows = [...this.rowTemp];
    this.stockTaking = {...this.stockTakingTemp};
    this.stockTakingService.disabledItems.next(false);
    this.stockTakingService.btnClick.next('');
    this.stockTakingService.ControlsEnableAndDisable.next(true);
    this.isWarehouseInvalid = false;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.stockTakingService.deleteStockTaking(this.stockTaking.stock_taking_id)
    .subscribe(
      (updatedList: any[]) => {
        this.stockTakingService.getStockTakingList(sessionStorage.getItem('year'),1);
        this.stockTakingService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.stockTakingService.btnClick.next('')
      }
    );
  }
}

export function showconfirm(message: any): Promise<boolean> {
  return Swal.fire({
    title: 'Confirm Delete',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'btn btn-danger me-2',  // red Bootstrap button
      cancelButton: 'btn btn-secondary'      // grey Bootstrap button
    },
    buttonsStyling: false, // important: use Bootstrap styles instead of SweetAlert defaults
    background: '#ffffff',
    color: '#333333'
  }).then(result => result.isConfirmed);
}





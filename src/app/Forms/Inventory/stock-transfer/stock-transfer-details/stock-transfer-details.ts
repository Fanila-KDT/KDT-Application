import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { StockTransferDetailModel, StockTransferModel } from '../../../../Model/StockTransfer/stock-transfer.model';
import { StockTransferService } from '../../../../Service/StockTransferService/stock-transfer-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { Subscription } from 'rxjs';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import { FinancialDataHeader, StockDataDetails } from '../../../../Model/CommonModel';
import Swal from 'sweetalert2';

@Component({
  selector: 'stock-transfer-details',
  standalone: false,
  templateUrl: './stock-transfer-details.html',
  styleUrls: ['./stock-transfer-details.css','../../../common.css']
})
export class StockTransferDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  stockTransfer: StockTransferModel = new StockTransferModel();
  stockTransferHeader: FinancialDataHeader = new FinancialDataHeader();
  stockTransferTemp: StockTransferModel = new StockTransferModel();
  stockTransGridModel: StockDataDetails[] =[];
  subscription: Subscription[] = new Array<Subscription>();
  saveDisable:boolean = true;
  cancelDisable:boolean = true;
  rows: any[] = []; 
  rowTemp: any[] = [];
  godownList: any[] = [];
  isEditable: boolean = true;
  totalQty: number = 0;
  totalQtyTemp: number = 0;
  scroll: boolean = true;
  gridHeight:number=350;
  reorderable = true;
  controls = {
    pageSize:50 
  };
  SelectionType = SelectionType;
  selected: any[] = [];
  ItemList: any[] = [];
  ItemListTemp: any[] =[];
  btnType :string = '';
  isFromInvalid: boolean = false;
  isToInvalid: boolean = false;

  constructor(public stockTransferService:StockTransferService,public alertService:AlertService,public commonService:CommonService,public endPointService: EndPointService,
    private cdRef: ChangeDetectorRef,public purchaseOrderService:PurchaseOrderService) {

    this.subscription.push(this.stockTransferService.clickedStockTras.subscribe(async x=>{
      this.stockTransferService.ControlsEnableAndDisable.next(true);
      if(!x){
        this.stockTransfer =  new StockTransferModel();
        this.rows =[];
        return;
      }
      this.stockTransfer = {...x};
      this.cdRef.markForCheck();
      await this.stockTransferService.getStockTransferDetails(this.stockTransfer.voucher_id).then((res) => {});
    }));

    this.subscription.push(this.stockTransferService.assignStockTransDetails.subscribe(async (data:any)=>{
      if(data[0]){
        this.rows = JSON.parse(JSON.stringify(data));
        this.rowTemp = JSON.parse(JSON.stringify(data));
        this.totalQty = this.sumRows('receipt_quantity');
        this.AssignItems();
      }else{
        this.rows = [];
        this.rowTemp = [];
        this.totalQty = 0;
      }
    }));

    this.subscription.push(this.stockTransferService.btnClick.subscribe(async x=>{
      if(x !==''){
        this.ItemListTemp = this.ItemList;
        this.ItemList = this.stockTransferService.ItemList;
        await this.btnClickFunction(x);
      }
    }));
  }

  async ngOnInit(){
    this.stockTransferService.getGodownList(this.endPointService.companycode).then((res: any[]) => {
      this.godownList = res;
    });
  }
  
  async btnClickFunction(x: string) {
    this.btnType = x;
    this.stockTransferTemp = {...this.stockTransfer};
    this.totalQtyTemp = this.totalQty;
    this.rowTemp = this.rows;
    if(x =='N'){
      this.stockTransfer = new StockTransferModel();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
      this.totalQty =0;
      this.rows = [];
      this.stockTransfer.voucherDate =  new Date();
      this.stockTransfer.voucher_date =  new Date();
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
    }else if(x =='D'){
      this.onDelete();
    }
    this.cdRef.markForCheck();
  }

  ToGodownChange(trns_godown:any){
    if(this.stockTransfer.godown_code == trns_godown){
      this.stockTransfer.transfer_godown_code = null;
      this.alertService.triggerAlert('Please select different Transfer Godown', 4000, 'error');
      return;
    }

  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.stockTransfer.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.stockTransfer.voucher_date = value;
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
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

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  AssignItems(){
    const rowItemNos = this.rows.map(r => r.item_no);
    const filteredItems = this.stockTransferService.ItemList.filter(item =>
      rowItemNos.includes(item.item_no)
    );
    this.ItemList = filteredItems;
  }

  addRow(){
    if (this.rows.length > 0) {
      const lastRow = this.rows[this.rows.length - 1];
      if (!lastRow.item_no || lastRow.item_no == '') {
        alert('Please enter Item Code in the previous row before adding a new one.');
        return; // stop here
      }
    }

    let newRow: Partial<StockTransferDetailModel> = {
      rowguid : null,
      voucher_id : null,
      seq_no: this.rows.length + 1,
      item_no : null,
      item_name_abbr: null,
      unit_name:null,
      receipt_quantity:null,
      cost_rate:null,
      transamount:null,
      stock_qty:null,
      item_details:null
    };
    this.rows = [...this.rows, newRow];
  }

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
    this.totalQty = this.sumRows('receipt_quantity');
    this.stockTransfer.cst = this.sumRows('transamount').toFixed(3);
  }

  async ItemCodeEnter(item_no: any, row: any) {
    try {
      const res = await this.purchaseOrderService.itemCodeEnter(item_no);
      const item = res[0];
      row.item_details = item.item_name_abbr;
      row.item_name_abbr = item.item_name_abbr;
      row.unit_name = item.unit_name;
      row.receipt_quantity = 1;
      row.cost_rate = item.avG_COST;
      row.transamount = item.avG_COST;
      row.item_no = item.item_no;
      this.totalQty = this.sumRows('receipt_quantity');
      this.stockTransfer.cst = this.sumRows('transamount').toFixed(3);
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  async ModelNameChange(item_name_abbr: any, row: any) {
    const [item_code, item_details] = row.item_name_abbr.split('-');
    const item = this.ItemList.find(v => v.item_code == item_code.trim());
    this.ItemCodeEnter(item.item_no,row);
  }

  QtyChange = this.debounce((qty: number, row: any) => {
    row.transamount = (row.cost_rate * qty).toFixed(3);
    this.totalQty = this.sumRows('receipt_quantity');
    this.stockTransfer.cst = this.sumRows('transamount').toFixed(3);
  }, 200);

  async onSubmit(StockTransferForm:any){
    const isValid = await this.validateForm(this.stockTransfer);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    if (this.rows.length == 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return ;
    }

    const itemNos = this.rows.map(r => r.item_no?.toString().trim());
    const hasDuplicates = new Set(itemNos).size !== itemNos.length;
    if (hasDuplicates) {
      this.alertService.triggerAlert('Duplicate Item found', 3000, 'error');
      return ;
    } 

    const itemEmpty = this.rows.some(row => !row.item_no);
    if (itemEmpty) {
      this.alertService.triggerAlert('Please select Item Code', 3000, 'error');
      return ;
    }

    const quantityEmpty = this.rows.some(row => !row.receipt_quantity || row.receipt_quantity == 0);
    if (quantityEmpty) {
      this.alertService.triggerAlert('The column quantity cannot be empty', 3000, 'error');
      return ;
    }

    const negetiveQty = this.rows.some(row => row.receipt_quantity < 0);
    if (negetiveQty) {
      this.alertService.triggerAlert('The column quantity should be greater than zero ', 3000, 'error');
      return ;
    }

    const voucher_Date = new Date(this.stockTransfer.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    await this.AssignValues();
   
    this.stockTransferService.saveStockTransfer(this.stockTransferHeader, this.stockTransGridModel,this.stockTransfer.transfer_godown_code)
          .subscribe({
          next: async (response: any) => {
            if(this.btnType == 'N'){
              this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
            }else{
              this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
            }
            await this.stockTransferService.getStockTransferList(sessionStorage.getItem('year'),2);
            let item: StockTransferModel | undefined = this.stockTransferService.mainList.find(item => item.voucher_id === response.stockTransferModel.voucher_id);
            if (item) {
              await this.stockTransferService.loadListStockTransfer.next(this.stockTransferService.mainList);
              this.stockTransferService.clickedStockTras.next(item); // pass single object
            }
            this.stockTransferService.btnClick.next('');
            this.saveDisable = true;
            this.cancelDisable = true;
            this.isEditable = true;
            this.stockTransferService.disabledItems.next(false);
            this.stockTransferService.disableGrid.next(false);
            this.stockTransferService.ControlsEnableAndDisable.next(true);
          },
          error: () => {
            this.alertService.triggerAlert('Failed to save the Row...', 4000, 'error');
            this.stockTransferService.btnClick.next('');
          }
        });
  }

  async validateForm(model: StockTransferModel): Promise<boolean> {
    // Reset validation flags
    this.isFromInvalid = !model.godown_code;
    this.isToInvalid   = !model.transfer_godown_code;
    const isValid = !(this.isFromInvalid || this.isToInvalid);
    return isValid;
  }

  async AssignValues(){
    // Header Details
    const voucher_id = await this.commonService.GetGuid();
    this.stockTransferHeader = {
      company_code: this.endPointService.companycode,
      voucher_date: new Date(this.stockTransfer.voucher_date),
      period_id: Number(sessionStorage.getItem('year')),
      register_code: 81,
      voucher_reference: this.stockTransfer.voucher_reference,
      godown_code: this.stockTransfer.godown_code,
      account_code: null,
      line_amount: 0,
      enter_amount: 0,
      discount: 0,
      counter_vid: null,
      cst :this.stockTransfer.cst,
      pay_code :null,
      posted_by : null,
      posted_date: null,
      cash_inv: false,
      returned: false,
      status_code:null,
      salesman_id:null,
      narration: null,
      cust_code: 0,

      ...(this.btnType === 'N'
      ? {
          voucher_id:voucher_id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          user_enter_date: new Date(),
          approved_by: null,modified_by: null,modified_on: null,
          approval_status : 'DRAFT',
          createdt :null,
          approver_remarks: null,
        }
      : {
          voucher_id:this.stockTransfer.voucher_id,
          created_by: this.stockTransfer.created_by,
          document_number: this.stockTransfer.document_number,
          modified_by: localStorage.getItem('user_id'),
          modified_on: null,
          user_enter_date: new Date(this.stockTransfer.user_enter_date),
          approved_by: this.stockTransfer.approved_by,
          approval_status: this.stockTransfer.approval_status,
          createdt: this.stockTransfer.createdt,
          approver_remarks: this.stockTransfer.approver_remarks
        })
    };

    //Grid Details
    this.stockTransGridModel = await this.mapItemsToDetails(this.rows,this.stockTransferHeader.voucher_id);
  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<StockDataDetails[]> {
    const detailsList: StockDataDetails[] = [];
    for (const item of items) {
      const details = new StockDataDetails();
      const trans = new StockDataDetails();
      details.rowguid =  await this.commonService.GetGuid();
      details.voucher_id = voucher_id;
      details.seq_no = item.seq_no;
      details.item_no = item.item_no;
      details.godown_code = this.stockTransfer.godown_code;
      details.receipt_quantity = item.receipt_quantity;
      details.issue_quantity = 0;
      details.enter_rate = 0;
      details.cost_rate = item.cost_rate;   
      details.pamount = 0;
      details.item_discount = 0;
      details.transamount = item.transamount ?? 0;
      details.line_no = 0;
      details.fgn_rate = 0;
      details.fgn_total = 0;
      details.item_details = item.item_details;
      details.tag_item = false;
      details.print_item = false;
      details.warranty = 0;
      details.exch_rate = 0;
      details.ref_row_id = null;
      detailsList.push(details);

      trans.rowguid = await this.commonService.GetGuid();
      trans.voucher_id = voucher_id;
      trans.seq_no = item.seq_no;
      trans.item_no = item.item_no;
      trans.godown_code = this.stockTransfer.transfer_godown_code;
      trans.receipt_quantity = 0;
      trans.issue_quantity = item.receipt_quantity;
      trans.enter_rate = 0;
      trans.cost_rate = item.cost_rate;   
      trans.pamount = 0;
      trans.item_discount = 0;
      trans.transamount = item.transamount ?? 0;
      trans.line_no = 0;
      trans.fgn_rate = 0;
      trans.fgn_total = 0;
      trans.item_details = item.item_details;
      trans.tag_item = false;
      trans.print_item = false;
      trans.warranty = 0;
      trans.exch_rate = 0;
      trans.ref_row_id = null;
      detailsList.push(trans);
    }

    return detailsList;
  }
  
  cancelClickMethod(){
    this.ItemList = this.ItemListTemp;
    this.totalQty =this.totalQtyTemp;
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.stockTransferService.disableGrid.next(false);
    this.stockTransfer = JSON.parse(JSON.stringify(this.stockTransferTemp));
    this.rows = JSON.parse(JSON.stringify(this.rowTemp));
    this.stockTransferService.disabledItems.next(false);
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.stockTransferService.deleteStockTransfer(this.stockTransfer.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.stockTransferService.getStockTransferList(sessionStorage.getItem('year'),1);
        this.stockTransferService.btnClick.next('');
        this.cdRef.markForCheck();
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.stockTransferService.btnClick.next('')
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





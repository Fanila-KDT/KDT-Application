import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { StockCorrectionDetailModel, StockCorrectionModel } from '../../../../Model/StockCorrection/stock-correction.model';
import { FinancialDataHeader, StockDataDetails } from '../../../../Model/CommonModel';
import { Subscription } from 'rxjs';
import { StockCorrectionService } from '../../../../Service/StockCorrectionService/stock-correction-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { PurchaseOrderService } from '../../../../Service/PurchaseOrderService/purchase-order-service';
import Swal from 'sweetalert2';
import { StockTransferService } from '../../../../Service/StockTransferService/stock-transfer-service';

@Component({
  selector: 'stock-correction-details',
  standalone: false,
  templateUrl: './stock-correction-details.html',
  styleUrls: ['./stock-correction-details.css','../../../common.css']
})
export class StockCorrectionDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  stockCorrection: StockCorrectionModel = new StockCorrectionModel();
  stockCorrectionHeader: FinancialDataHeader = new FinancialDataHeader();
  stockCorrectionTemp: StockCorrectionModel = new StockCorrectionModel();
  stockTransGridModel: StockDataDetails[] =[];
  subscription: Subscription[] = new Array<Subscription>();
  saveDisable:boolean = true;
  cancelDisable:boolean = true;
  rows: any[] = []; 
  rowTemp: any[] = [];
  godownList: any[] = [];
  accountList: any[] = [];
  isEditable: boolean = true;
  totalQty: number = 0;
  totalQtyTemp: number = 0;
  totalIssuedQty: number = 0;
  totalIssuedQtyTemp: number = 0;
  totalIssuedAmount: number = 0;
  totalIssuedAmountTemp: number = 0;
  totalAmount: number = 0;
  totalAmountTemp: number = 0;
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
  isWarehouseInvalid: boolean = false;
  isAccountInvalid: boolean = false;
  isReasonInvalid: boolean = false;

  constructor(public stockCorrectionService:StockCorrectionService,public alertService:AlertService,public commonService:CommonService,public endPointService: EndPointService,
    private cdRef: ChangeDetectorRef,public purchaseOrderService:PurchaseOrderService,public stockTransferService:StockTransferService){

    this.subscription.push(this.stockCorrectionService.clickedStockCorr.subscribe(async x=>{
      this.stockCorrectionService.ControlsEnableAndDisable.next(true);
      if(!x){
        this.stockCorrection =  new StockCorrectionModel();
        this.rows =[];
        return;
      }
      this.stockCorrection = {...x};
      this.cdRef.markForCheck();
      await this.stockCorrectionService.getStockCorrectionDetails(this.stockCorrection.voucher_id).then((res) => {});
    }));

    this.subscription.push(this.stockCorrectionService.assignStockCorrDetails.subscribe(async (data:any)=>{
      if(data[0]){
        this.rows = JSON.parse(JSON.stringify(data));
        this.rowTemp = JSON.parse(JSON.stringify(data));
        this.calculateTotals();
        this.AssignItems();
      }else{
        this.rows = [];
        this.rowTemp = [];
        this.totalQty = 0;
        this.totalAmount = 0;
        this.totalIssuedQty = 0;
        this.totalIssuedAmount = 0; 
      }
    }));

    this.subscription.push(this.stockCorrectionService.btnClick.subscribe(async x=>{
      if(x !==''){
        this.ItemListTemp = this.ItemList;
        this.ItemList = this.stockCorrectionService.ItemList;
        await this.btnClickFunction(x);
      }
    }));
  }

  async ngOnInit(){
    this.stockTransferService.getGodownList(this.endPointService.companycode).then((res: any[]) => {
      this.godownList = res;
    });

    this.stockCorrectionService.getAccountList(this.endPointService.companycode).then((res: any[]) => {
      this.accountList = res;
    });
  }
  
  async btnClickFunction(x: string) {
    this.btnType = x;
    this.stockCorrectionTemp = {...this.stockCorrection};
    this.totalQtyTemp = this.totalQty;
    this.totalAmountTemp = this.totalAmount;
    this.totalIssuedAmountTemp = this.totalIssuedAmount;
    this.totalIssuedQtyTemp = this.totalIssuedQty;
    this.rowTemp = this.rows;
    if(x =='N'){
      this.stockCorrection = new StockCorrectionModel();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
      this.totalQty =0;
      this.totalAmount = 0;
      this.totalIssuedQty = 0;
      this.totalIssuedAmount = 0;
      this.rows = [];
      this.stockCorrection.voucherDate =  new Date();
      this.stockCorrection.voucher_date =  new Date();
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.isEditable =false;
    }else if(x =='D'){
      this.onDelete();
    }
    this.cdRef.markForCheck();
  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.stockCorrection.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.stockCorrection.voucher_date = value;
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
    const filteredItems = this.stockCorrectionService.ItemList.filter(item =>
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

    let newRow: Partial<StockCorrectionDetailModel> = {
      rowguid :null,
      seq_no :null,
      voucher_id :null,
      item_no :null,
      receipt_quantity :null,
      issue_quantity :null,
      item_details :null,
      item_code :null,
      avg_cost :null,
      item_name_abbr :null,
      unit_name :null
    };
    this.rows = [...this.rows, newRow];
  }

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.calculateTotals();
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
  }

  async ItemCodeEnter(item_no: any, row: any) {
    try {
      const res = await this.purchaseOrderService.itemCodeEnter(item_no);
      const item = res[0];
      row.item_details = item.item_name_abbr;
      row.item_name_abbr = item.item_name_abbr;
      row.unit_name = item.unit_name;
      row.receipt_quantity = 1;
      row.issue_quantity = 0;
      row.avG_COST = item.avG_COST;
      row.transamount = '+' + item.avG_COST;
      row.item_no = item.item_no;
      this.totalQty = this.sumRows('receipt_quantity');
      this.totalIssuedQty = this.sumRows('issue_quantity');
      this.totalAmount = this.totalAmount + item.avG_COST;
    } catch (error) {
      console.error('ItemCodeEnter error:', error);
    }
  }

  async ModelNameChange(item_name_abbr: any, row: any) {
    let xxx = item_name_abbr;
    const [item_code, item_details] = row.item_name_abbr.split('-');
    const item = this.ItemList.find(v => v.item_code == item_code.trim());
    this.ItemCodeEnter(item.item_no,row);
  }

  ReceiptQtyChange = this.debounce((qty: number, row: any) => {
    row.issue_quantity = 0;
    this. calculateTotals();
  }, 200);

  IssueQtyChange = this.debounce((qty: number, row: any) => {
    row.receipt_quantity = 0;
    this. calculateTotals();
  }, 200);

  RateChange = this.debounce((rate: number, row: any) => {
    this. calculateTotals();
  }, 200);

  FgnTotalChange= this.debounce((rate: number, row: any) => {
    row.fgn_rate = row.fgn_total / (row.receipt_quantity ? row.receipt_quantity : row.issue_quantity);
  }, 200);

  calculateTotals() {
    this.totalIssuedAmount =0;
    this.totalAmount =0;
    this.rows = this.rows.map(row => {
        let qty = 0;
        let sign = '';

        if (row.receipt_quantity && row.receipt_quantity !== 0) {
          qty = row.receipt_quantity;
          this.totalAmount =  Number((this.totalAmount + (row.receipt_quantity * row.avG_COST)).toFixed(3));
          sign = '+';
        } else if (row.issue_quantity && row.issue_quantity !== 0) {
          qty = row.issue_quantity;
          this.totalIssuedAmount =  Number((this.totalIssuedAmount + (row.issue_quantity * row.avG_COST)).toFixed(3));
          sign = '-';
        }
        const total = qty * row.avG_COST;

        return {
          ...row,
          transamount: `${sign}${total.toFixed(3)}`
        };
    });
    this.totalQty = this.sumRows('receipt_quantity');
    this.totalIssuedQty = this.sumRows('issue_quantity');
  }

  async onSubmit(StockCorrectionForm:any){
    const isValid = await this.validateForm(this.stockCorrection);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    if (this.rows.length == 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return ;
    }

    const itemEmpty = this.rows.some(row => !row.item_no);
    if (itemEmpty) {
      this.alertService.triggerAlert('Please select Item Code', 3000, 'error');
      return ;
    }

    const quantityEmpty = this.rows.some(row => row.issue_quantity && row.receipt_quantity);
    if (quantityEmpty) {
      this.alertService.triggerAlert('The One of the quantity should be greater than zero', 3000, 'error');
      return ;
    }

    const negetiveQty = this.rows.some(row => row.receipt_quantity < 0 || row.issue_quantity < 0); ;
    if (negetiveQty) {
      this.alertService.triggerAlert('The column quantity should be greater than zero ', 3000, 'error');
      return ;
    }

    const voucher_Date = new Date(this.stockCorrection.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    await this.AssignValues();

    this.stockCorrectionService.saveStockCorrection(this.stockCorrectionHeader, this.stockTransGridModel)
      .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.stockCorrectionService.getStockCorrectionList(sessionStorage.getItem('year'),2);
        let item: StockCorrectionModel | undefined = this.stockCorrectionService.mainList.find(item => item.voucher_id === response.headerModel.voucher_id);
        if (item) {
          await this.stockCorrectionService.loadListStockCorrection.next(this.stockCorrectionService.mainList);
          this.stockCorrectionService.clickedStockCorr.next(item); // pass single object
          let temp =[];
          temp.push(item)
          this.stockCorrectionService.selected.next(temp); // pass single object
        }
        this.stockCorrectionService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.isEditable = true;
        this.stockCorrectionService.disabledItems.next(false);
        this.stockCorrectionService.disableGrid.next(false);
        this.stockCorrectionService.ControlsEnableAndDisable.next(true);
      },
      error: () => {
        this.alertService.triggerAlert('Failed to save the Row...', 4000, 'error');
        this.stockCorrectionService.btnClick.next('');
      }
    });
  }

  async validateForm(model: StockCorrectionModel): Promise<boolean> {
    // Reset validation flags
    this.isWarehouseInvalid = !model.godown_code;
    this.isAccountInvalid = !model.account_code;
    this.isReasonInvalid = !model.narration;
    const isValid = !(this.isWarehouseInvalid || this.isAccountInvalid || this.isReasonInvalid);
    return isValid;
  }

  async AssignValues(){
    // Header Details
    const voucher_id = await this.commonService.GetGuid();
    this.stockCorrectionHeader = {
      company_code: this.endPointService.companycode,
      voucher_date: new Date(this.stockCorrection.voucher_date),
      period_id: Number(sessionStorage.getItem('year')),
      register_code: 200,
      voucher_reference: this.stockCorrection.voucher_reference,
      godown_code: this.stockCorrection.godown_code,
      account_code: this.stockCorrection.account_code,
      line_amount: 0,
      enter_amount: 0,
      discount: 0,
      counter_vid: null,
      cst :Math.abs(this.totalIssuedAmount - this.totalAmount),
      pay_code :null,
      posted_by : null,
      posted_date: null,
      cash_inv: false,
      returned: false,
      status_code:null,
      salesman_id:null,
      narration: this.stockCorrection.narration,
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
          voucher_id:this.stockCorrection.voucher_id,
          created_by: this.stockCorrection.created_by,
          document_number: this.stockCorrection.document_number,
          modified_by: localStorage.getItem('user_id'),
          modified_on: null,
          user_enter_date: new Date(this.stockCorrection.user_enter_date),
          approved_by: this.stockCorrection.approved_by,
          approval_status: this.stockCorrection.approval_status,
          createdt: this.stockCorrection.createdt,
          approver_remarks: this.stockCorrection.approver_remarks
        })
    };

    //Grid Details
    this.stockTransGridModel = await this.mapItemsToDetails(this.rows,this.stockCorrectionHeader.voucher_id);
  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<StockDataDetails[]> {
    const detailsList: StockDataDetails[] = [];
    let num = 0;
    for (const item of items) {
      num = num + 1;
      const details = new StockDataDetails();
      details.rowguid =  await this.commonService.GetGuid();
      details.voucher_id = voucher_id;
      details.seq_no = num;
      details.item_no = item.item_no;
      details.godown_code = this.stockCorrection.godown_code;
      details.receipt_quantity = item.receipt_quantity;
      details.issue_quantity = item.issue_quantity;
      details.enter_rate = 0;
      details.cost_rate = item.avG_COST;   
      details.pamount = 0;
      details.item_discount = 0;
      details.transamount = item.transamount ?Math.abs(parseFloat(item.transamount.replace('+', '').replace('-', ''))): 0;
      details.line_no = 0;
      details.fgn_rate = item.fgn_rate ?? 0;
      details.fgn_total = item.fgn_total ?? 0;
      details.item_details = item.item_details;
      details.tag_item = false;
      details.print_item = false;
      details.warranty = 0;
      details.exch_rate = 0;
      details.ref_row_id = null;
      detailsList.push(details);
    }

    return detailsList;
  }
  
  cancelClickMethod(){
    this.ItemList = this.ItemListTemp;
    this.totalQty =this.totalQtyTemp;
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.stockCorrectionService.disableGrid.next(false);
    this.stockCorrection = JSON.parse(JSON.stringify(this.stockCorrectionTemp));
    this.rows = JSON.parse(JSON.stringify(this.rowTemp));
    this.stockCorrectionService.disabledItems.next(false);
    this.totalQty = this.totalQtyTemp;
    this.totalAmount = this.totalAmountTemp;
    this.totalIssuedAmount = this.totalIssuedAmountTemp;
    this.totalIssuedQty = this.totalIssuedQtyTemp;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.stockCorrectionService.deleteStockCorrection(this.stockCorrection.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.stockCorrectionService.getStockCorrectionList(sessionStorage.getItem('year'),1);
        this.stockCorrectionService.btnClick.next('');
        this.cdRef.markForCheck();
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.stockCorrectionService.btnClick.next('')
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


import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ExpenseAccountModel, ExpenseEntryModel, ExpenseHeaderModel } from '../../../../Model/ExpenseEntry/expense-entry.model';
import { ExpenseEntryService } from '../../../../Service/ExpenseEntryService/expense-entry-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { Subscription } from 'rxjs';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { DashboardService } from '../../../../Service/DashboardService/dashboard-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { AccountList } from '../../../../Model/WarehouseMaster/warehouse-master.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'expense-entry-details',
  standalone: false,
  templateUrl: './expense-entry-details.html',
  styleUrls: ['./expense-entry-details.css','../../../common.css']
})
export class ExpenseEntryDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  expenseEntry: ExpenseEntryModel = new ExpenseEntryModel();
  expenseEntryTemp: ExpenseEntryModel = new ExpenseEntryModel();
  expenseHeaderModel:ExpenseHeaderModel = new ExpenseHeaderModel();
  expenseAccountModel:ExpenseAccountModel[] =[];
  saveDisable:boolean = true;
  cancelDisable:boolean = true;
  
  subscription: Subscription[] = new Array<Subscription>();
  scroll: boolean = true;
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  rows: any[] = []; 
  distinctGodownCodes: any[] = [];
  InventoryAccounts: any[] = [];
  rowsTemp: any[] = [];
  expenseRows: any[] = [];
  inventoryRows: any[] =[];
  expenseRowsTemp: any[] = [];
  isEditable: boolean = true;
  AccountList: any[] = [];
  est_landed_exp: number = 0;
  btnType: string = '';
  constructor(public expenseEntryService:ExpenseEntryService,public alertService:AlertService,public commonService:CommonService,private cdRef: ChangeDetectorRef
    , public dashboardService: DashboardService,public endPointService: EndPointService) {
    this.subscription.push(this.expenseEntryService.clickedEntry.subscribe(async x=>{
      if(this.dashboardService.ExpenseEntry == 1){
          this.expenseRows = [];
          this.inventoryRows =[];
          return;
        }
      this.expenseEntryService.ControlsEnableAndDisable.next(true);
      if(!x){
        this.expenseEntry =  new ExpenseEntryModel();
        this.rows =[];
        this.expenseRows = [];
        this.inventoryRows =[];
        return;
      }
      this.expenseEntry = {...x};
      await this.expenseEntryService.getExpenseEntryDetails(this.expenseEntry.counter_vid).then((res) => {});
      
      this.cdRef.markForCheck();
    }));

    this.subscription.push(this.expenseEntryService.assignExpenseDetails.subscribe(async (data:any)=>{
      if(data[0]){
        this.rows = JSON.parse(JSON.stringify(data));
        this.rowsTemp = JSON.parse(JSON.stringify(data));
        this.expenseEntry.line_amount = Number(this.sumRows('pamount').toFixed(3));
        this.expenseEntry.foriegn_total = Number(this.sumRows('fgn_total').toFixed(4));
        this.expenseEntry.est_landed_exp =  this.sumExpRows('credit_amount')||0;
        this.est_landed_exp = this.expenseEntry.est_landed_exp;
        this.findInventoryAccounts();
        this.calculateCosts();
        if(this.dashboardService.ExpenseEntry == 1){
          this.expenseRows = [];
          this.inventoryRows =[];
          return;
        }
        this.expenseEntryService.getExpenseAccountDetails(this.expenseEntry.voucher_id).then((res) => {});
      }else{
        this.rows = [];
        this.rowsTemp = [];
        this.expenseRows = [];
        this.inventoryRows =[];
      }
    }));

    this.subscription.push(this.expenseEntryService.assignAccountDetails.subscribe(async (data:any)=>{
      if(data[0]){
        this.expenseRows = data.filter((v:any) => v.credit_amount != 0);
        this.expenseEntry.est_landed_exp =  this.sumExpRows('credit_amount')||0;
        this.est_landed_exp = this.expenseEntry.est_landed_exp;
        this.calculateCosts();
      }else{
        this.expenseRows = [];
        this.inventoryRows =[];
      }
    }));

    this.subscription.push(this.expenseEntryService.btnClick.subscribe(async x=>{
      if(x !==''){
        this.saveDisable = false;
        this.cancelDisable = false;
        this.isEditable = false;
        this.expenseEntryTemp = JSON.parse(JSON.stringify(this.expenseEntry));
        this.rowsTemp = JSON.parse(JSON.stringify(this.rows));
        this.expenseRowsTemp = JSON.parse(JSON.stringify(this.expenseRows));
        if(x=='D'){
          this.onDelete();
        }
      }
    }));

    this.subscription.push(this.dashboardService.clickedExpenseEntry.subscribe(async data => {
      if (data) {
        this.expenseEntryBtnClick(data);
      }
    }));

    this.subscription.push(this.expenseEntryService.cancelClick.subscribe(data=>{
      this.cancelClickMethod();
    }));
  }

  async ngOnInit() {
    await this.expenseEntryService.getAccountList().then((res: any[]) => {
      this.AccountList = res;
    });
  }

  calculateCosts() {
    this.expenseEntry.enter_amount  = Number(((this.expenseEntry.line_amount - this.expenseEntry.discount) + this.expenseEntry.est_landed_exp).toFixed(3));

    this.rows.forEach(row => {
      const costRate = this.roundTo3Decimals(this.expenseEntry.enter_amount) /  this.roundTo3Decimals(this.expenseEntry.line_amount) ;
      row.cost_rate = this.roundTo3Decimals(this.roundTo3Decimals(row.pamount / row.receipt_quantity) * this.roundTo3Decimals(costRate));
      row.transamount = this.roundTo3Decimals(row.cost_rate * row.receipt_quantity);
    });

    this.expenseEntry.percentage =  (this.expenseEntry.est_landed_exp / (this.expenseEntry.line_amount - this.expenseEntry.discount) * 100) .toFixed(2) + '%';
  }

  roundTo3Decimals(value: number): number { 
    let num = Number(value.toFixed(3))
    return num; 
  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
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

  getExpenceRowIdentity(row: any): any {
    return row.detail_id; // unique identifier
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total);  // round to 4 decimal places
  }

  private sumExpRows(field: string): number {
    const total = this.expenseRows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total);  // round to 4 decimal places
  }

  addRow(){
    if (this.expenseRows.length > 0) {
      const lastRow = this.expenseRows[this.expenseRows.length - 1];
      if (!lastRow.account_code || lastRow.account_code == '') {
        alert('Please enter Account in the previous row before adding a new one.');
        return; // stop here
      }
    }

    let newRow: Partial<ExpenseAccountModel> = {
      voucher_id : null,
      seq_no: this.expenseRows.length + 1,
      debit_amount: 0,
      credit_amount: 0,
      account_code : null,
      counter_account_code : null,
      fgn_debit_amount: 0,
      fgn_credit_amount: 0,
      dOCUMENT_NUMBER: null,
      rOW_REF: null,
      counter_vid : null,
      profitcenterid : this.expenseEntry.centercode
    };

    this.expenseRows = [...this.expenseRows, newRow];
  }

  CreditAmountChange = this.debounce((credit: number, row: any) => {
    // recompute total from base + sum of all rows
    const totalCredits = this.expenseRows.reduce((sum, r) => sum + (Number(r.credit_amount) || 0), 0);
    this.expenseEntry.est_landed_exp = Number(this.est_landed_exp) + totalCredits;
    this.calculateCosts();
  }, 200);


  ForiegnCreditAmountChange = this.debounce((fcredit: number, row: any) => {
    row.credit_amount =  (row.fgn_credit_amount * this.expenseEntry.exch_rate).toFixed(3) ;
    this.CreditAmountChange(row.credit_amount, row);
  }, 200);

  deleteRow(index: number): void {
    this.expenseRows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.expenseRows.forEach((row, i) => { row.seq_no = i + 1; });
    this.expenseRows = [...this.expenseRows];
    const totalCredits = this.expenseRows.reduce((sum, r) => sum + (Number(r.credit_amount) || 0), 0);
    this.expenseEntry.est_landed_exp = Number(this.est_landed_exp) + totalCredits;
    this.calculateCosts();
  }

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  cancelClickMethod(){
    this.isEditable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.expenseEntryService.disableGrid.next(false);
    this.expenseEntry = JSON.parse(JSON.stringify(this.expenseEntryTemp));
    this.rows = JSON.parse(JSON.stringify(this.rowsTemp));
    this.expenseRows = JSON.parse(JSON.stringify(this.expenseRowsTemp));
    this.dashboardService.ExpenseEntry = 0;
    this.expenseEntryService.disabledItems.next(false);
  }

  async expenseEntryBtnClick(data:any){
    this.expenseEntryService.btnClick.next('N');
    this.btnType ='N';
    this.expenseEntryService.disabledItems.next(true);
    this.expenseEntryService.ControlsEnableAndDisable.next(true);
    this.expenseEntryService.disableGrid.next(true);
    await this.expenseEntryService.getExpenseEntryDetails(data.ref_grn_id).then((res) => {});
    this.expenseEntry.discount = this.rows[0]?.main_discount || 0;
    this.expenseEntry.exch_rate = data.exch_rate;
    this.expenseEntry.ref_grn = data.document_number;
    this.expenseEntry.approval_status = data.approval_status;
    this.expenseEntry.voucherDate = new Date();
    this.expenseEntry.voucher_date = new Date();
    this.expenseEntry.godown_code = data.godown_code;
    this.expenseEntry.counter_vid = data.ref_grn_id;

    await this.expenseEntryService.getProfitCenter(data.godown_code).then((res: any[]) => {
      this.expenseEntry.centercode = res[0].centercode;
      this.expenseEntry.centername = res[0].centername;
    });
    this.isEditable = false;
    this.saveDisable = false;
    this.cancelDisable = false;
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.expenseEntry.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.expenseEntry.voucher_date = value;
  }

  async saveAsDraftClickMethod() {
    await this.validateAndSave('Draft');
  }

  async onSubmit(ExpenseForm: any) {
    await this.validateAndSave(); // defaults to "Expense Processing"
  }

 async validateAndSave(status: string = 'DRAFT') {
    if (this.expenseRows.length === 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return;
    }

    const itemEmpty = this.expenseRows.some(row => !row.account_code);
    if (itemEmpty) {
      this.alertService.triggerAlert('Please select Item Code', 3000, 'error');
      return;
    }

    const voucher_Date = new Date(this.expenseEntry.voucher_date);
    const periodFrom = new Date(sessionStorage.getItem('period_from') || '');
    const periodTo   = new Date(sessionStorage.getItem('period_to') || '');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if (!isBetween) {
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return;
    }

    await this.AssignValues(status);
    this.expenseHeaderModel.account_code = this.expenseAccountModel[0].account_code;
    this.CalculateInventoryAccounts();
    
    const rows = [...this.expenseAccountModel, ...this.inventoryRows];
    const reSequencedRows = rows.map((item, index) => ({ ...item, seq_no: index + 1 }));

    this.expenseEntryService.savePurchaseExpenseEntry(this.expenseHeaderModel, reSequencedRows)
      .subscribe({
        next: async (response: any) => {
          if(this.btnType == 'N'){
            this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
          }else{
            this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
          }
          this.expenseEntryService.getExpenseEntryList(sessionStorage.getItem('year'),2);
          let item: ExpenseEntryModel | undefined = this.expenseEntryService.mainList.find(item => item.voucher_id === response.expenceEntryModel.voucher_id);
          if (item) {
            this.expenseEntryService.loadListExpenseEntry.next(this.expenseEntryService.mainList);
            this.expenseEntryService.clickedEntry.next(item); // pass single object
          }
          this.expenseEntryService.btnClick.next('');
          this.saveDisable = true;
          this.cancelDisable = true;
          this.isEditable = true;
          this.expenseEntryService.disabledItems.next(false);
          this.expenseEntryService.disableGrid.next(false);
          this.expenseEntryService.ControlsEnableAndDisable.next(true);
        },
        error: () => {
          this.alertService.triggerAlert('Failed to save the Row...', 4000, 'error');
          this.expenseEntryService.btnClick.next('');
          this.inventoryRows = [];
        }
      });
  }

  async AssignValues(status: string = 'Draft') {
    const voucher_id = await this.commonService.GetGuid();
    this.expenseHeaderModel = {
      company_code: this.endPointService.companycode,
      voucher_date: new Date(this.expenseEntry.voucher_date),
      period_id: sessionStorage.getItem('year'),
      register_code: 33,
      voucher_reference: this.expenseEntry.voucher_reference,
      godown_code: this.expenseEntry.godown_code,
      account_code: null,
      line_amount: this.expenseEntry.line_amount,
      enter_amount: this.expenseEntry.enter_amount,
      discount: this.expenseEntry.discount,
      counter_vid: this.expenseEntry.counter_vid,
      approver_remarks: this.expenseEntry.approver_remarks,
      cst: 0,

      ...(this.btnType === 'N'
        ? {
            voucher_id: voucher_id,
            document_number: '',
            created_by: localStorage.getItem('user_id'),
            user_enter_date: new Date(),
            approved_by: null,
            modified_by: null,
            modified_on: null,
            approval_status: status,   // 👈 use parameter here
            createdt: null,
          }
        : {
            voucher_id: this.expenseEntry.voucher_id,
            document_number: this.expenseEntry.document_number,
            created_by: this.expenseEntry.created_by,
            modified_by: localStorage.getItem('user_id'),
            modified_on: new Date(),
            user_enter_date: this.expenseEntry.user_enter_date,
            approved_by: this.expenseEntry.approved_by,
            approval_status: status,   // 👈 use parameter here
            createdt: this.expenseEntry.createdt,
          })
    };

    this.expenseAccountModel = await this.mapAccountDetails(
      this.expenseRows,
      this.expenseHeaderModel.voucher_id
    );
  }

  async mapAccountDetails(items: any[],voucher_id:any): Promise<ExpenseAccountModel[]> {
    const detailsList: ExpenseAccountModel[] = [];

    for (const item of items) {
      const maxSeqNo = Math.max(...this.expenseRows.map(d => d.seq_no));
      const details = new ExpenseAccountModel();
      details.detail_id = this.btnType === 'N' ? await this.commonService.GetGuid() : item.rowguid;
      details.voucher_id = voucher_id;
      details.seq_no = maxSeqNo + 1;
      details.debit_amount = item.debit_amount??0;
      details.credit_amount = item.credit_amount;
      details.account_code = item.account_code;
      details.counter_account_code = item.counter_account_code;
      details.fgn_debit_amount = item.fgn_debit_amount??0;
      details.fgn_credit_amount = item.fgn_credit_amount??0;
      details.dOCUMENT_NUMBER = null;
      details.rOW_REF = item.rOW_REF;
      details.counter_vid = item.voucher_id;
      details.profitcenterid = item.profitcenterid;
      detailsList.push(details);
    }
    return detailsList;
  }

  findInventoryAccounts(){
  this.distinctGodownCodes = [...new Set(this.rows.map(row => row.godown_code) .filter(code => code != null))];
    this.expenseEntryService.findInventoryAccounts(this.distinctGodownCodes)
      .subscribe({
        next: async (response: any) => {
          this.InventoryAccounts = response;
        },
      error: (err) => {
        this.alertService.triggerAlert('No Inventory Accounts...',4000, 'error');
        this.expenseEntryService.btnClick.next('');
      }
    });
  }

  CalculateInventoryAccounts(){
    const enterAmounts = this.processRows(this.rows);
    let InventoryAccounts = this.InventoryAccounts

    const merged = enterAmounts.map(ea => {
      const account = InventoryAccounts.find(acc => acc.godown_code === ea.godown_code);
      return {
        ...ea,
        ...(account || {}) 
      };
    });

    // Assume merged is already created as shown earlier
    merged.forEach((item) => {
      let newRow: Partial<ExpenseAccountModel> = {
        voucher_id: this.expenseHeaderModel.voucher_id,
        seq_no: this.expenseRows.length +this.inventoryRows.length+ 1,
        debit_amount: item.debit_amount ?? 0,  
        credit_amount: 0,
        account_code: item.account_code ?? null,     
        counter_account_code: this.expenseRows[0].account_code,
        fgn_debit_amount: 0,
        fgn_credit_amount: 0,
        dOCUMENT_NUMBER: null,
        rOW_REF: null,
        counter_vid: null,
        profitcenterid: this.expenseEntry.centercode,
      };

      this.inventoryRows = [...this.inventoryRows, newRow];
    });
  }

  processRows(rows: any[]) {
    // Step 1: Get distinct combinations of document_number + godown_code
    const distinctPairs = new Map<string, any>();

    rows.forEach(row => {
      const key = `${row.document_number}_${row.godown_code}`;
      if (!distinctPairs.has(key)) {
        distinctPairs.set(key, row);
      }
    });

    // Step 2: Group by godown_code and sum enter_amount
    const grouped = new Map<string, number>();

    distinctPairs.forEach(row => {
      const code = row.godown_code;
      const amount = Number(row.enter_amount) || 0;

      grouped.set(code, (grouped.get(code) || 0) + amount);
    });

    // Step 3: Convert to output array with debit_amount
    const result = Array.from(grouped.entries()).map(([godown_code, enter_amount]) => {
      const debit_amount = ((enter_amount * this.expenseEntry.est_landed_exp) / (this.expenseEntry.line_amount-this.expenseEntry.discount)).toFixed(3);

      return {
        godown_code,
        enter_amount,
        debit_amount
      };
    });

    return result;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.expenseEntryService.deletePurchaseExpense(this.expenseEntry.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.expenseEntryService.getExpenseEntryList(sessionStorage.getItem('year'),1);
        this.expenseEntryService.btnClick.next('');
        this.cdRef.markForCheck();
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.expenseEntryService.btnClick.next('')
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










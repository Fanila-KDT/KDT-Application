import { Component, ViewChild } from '@angular/core';
import { PaymentRequestDetailModel, PaymentRequestModel, PaymentRequestSave } from '../../../../Model/PaymentRequest/payment-request.model';
import { PaymentRequestService } from '../../../../Service/PaymentRequestService/payment-request-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { EndPointService } from '../../../../Service/end-point.services';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
import { Subscription } from 'rxjs';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { DateModelAccounts } from '../../../../Model/CommonModel';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'payment-request-details',
  standalone: false,
  templateUrl: './payment-request-details.html',
  styleUrls: ['./payment-request-details.css', '../../../common.css'],
  providers: [DatePipe]
})
export class PaymentRequestDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  paymentRequestModel: PaymentRequestModel;
  paymentRequestModelTemp: PaymentRequestModel;
  paymentRequestSave : PaymentRequestSave = new PaymentRequestSave();
  paymentRequestDetailModel : PaymentRequestDetailModel [] =[];
  dateModel: DateModelAccounts = new DateModelAccounts();
  itemDisable: boolean = true;
  subscription: Subscription[];
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string="";
  rows: any[] = []; 
  rowTemp: any[] = [];
  scroll: boolean = true;
  gridHeight:number = 350;
  reorderable = true;
  SelectionType = SelectionType;
  selected: any[] = [];
  statusDisable: boolean = true;

  constructor(public paymentRequestService:PaymentRequestService, private alertService: AlertService, public endPointService:EndPointService,
    public commonService:CommonService, public userAccessService:UserAccessService, private datePipe: DatePipe) {

    this.paymentRequestModel = new PaymentRequestModel();
    this.paymentRequestModelTemp = new PaymentRequestModel();
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.paymentRequestService.clickedPayment.subscribe(async x=>{
      if(!x){
        this.paymentRequestModel =  new PaymentRequestModel();
        return;
      }
      this.paymentRequestService.ControlsEnableAndDisable.next(true);
      this.paymentRequestModel = {...x}
      this.paymentRequestService.selectedVoucherId = this.paymentRequestModel.voucher_id;

      try {
        const items = await this.paymentRequestService.GetPaymentRequestDetails(this.paymentRequestModel.voucher_id);
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

    this.subscription.push(this.paymentRequestService.btnClick.subscribe(x=>{
      if(x != ''){
         if(x != ''){
        this.btnClickFunction(x);
     }
      }
    }));
    
    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));

  }

  btnClickFunction(x: string) {
    this.btnType = x;
    this.paymentRequestModelTemp = {...this.paymentRequestModel};
    if(x =='N'){
      this.paymentRequestModel = new PaymentRequestModel();
      this.paymentRequestModel.voucherDate = new Date();
      this.paymentRequestModel.voucher_date = new Date();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
      this.rows = [];
    }else if(x=='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='D'){
      this.onDelete()
    }
  }

  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  formatToDateInput(value: string): void {
    this.paymentRequestModel.voucher_date = value;
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.paymentRequestModel.voucher_date = date;
  }

  getRowIdentity(row: any): any {
    return row.detail_id; // unique identifier
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

  cancelClickMethod(){
    this.paymentRequestService.disableGrid.next(false);
    this.paymentRequestModel = {...this.paymentRequestModelTemp};
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.paymentRequestService.disabledItems.next(false);
    this.paymentRequestService.btnClick.next('');
    this.paymentRequestService.ControlsEnableAndDisable.next(true);
    this.rows = [...this.rowTemp];
  }

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total.toFixed(3));  // round to 4 decimal places
  }

  TotalChange(row: any) {
    this.paymentRequestModel.line_amount = this.sumRows('amount');
  }

  deleteRow(index: number): void {
    this.rows.splice(index, 1);
    // Reassign seq_no for all rows 
    this.rows.forEach((row, i) => { row.seq_no = i + 1; });
    this.rows = [...this.rows];
    this.paymentRequestModel.line_amount = this.sumRows('amount');
  }

  addRow(){
    if (this.rows.length > 0) {
      const lastRow = this.rows[this.rows.length - 1];
      if (!lastRow.description || lastRow.description == '') {
        alert('Please enter Description in the previous row before adding a new one.');
        return; // stop here
      }
    }

    let newRow: Partial<any> = {
      description : null,
      cheque_no : null,
      details : null,
      amount: null
    };
    this.rows = [...this.rows, newRow];
  }

  async onSubmit(Form:any){
    if (this.rows.length == 0) {
      this.alertService.triggerAlert('Please add the row items...', 3000, 'error');
      return ;
    }

    const itemNos = this.rows.map(r => r.description?.toString().trim());
    const hasDuplicates = new Set(itemNos).size !== itemNos.length;
    if (hasDuplicates) {
      this.alertService.triggerAlert('Duplicate Item found', 3000, 'error');
      return ;
    } 
    
    const voucher_Date = new Date(this.paymentRequestModel.voucher_date); // dd/MM/yyyy
    const periodFrom = new Date(sessionStorage.getItem('period_from')||'');
    const periodTo   = new Date(sessionStorage.getItem('period_to')||'');
    const isBetween = voucher_Date >= periodFrom && voucher_Date <= periodTo;
    if(!isBetween){
      this.alertService.triggerAlert('Entry date must choose within the chosen financial year.', 3000, 'error');
      return ;
    }

    await this.AssignValues();

    this.paymentRequestService.SavePaymentRequest(this.paymentRequestSave, this.paymentRequestDetailModel, this.dateModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        
        await this.paymentRequestService.GetPaymentRequestList(sessionStorage.getItem('year'),2);
        let item: PaymentRequestModel | undefined = this.paymentRequestService.mainList.find(item => item.voucher_id === response.paymentRequestSave.voucher_id);
        if (item) {
          await this.paymentRequestService.loadList.next(this.paymentRequestService.mainList);
          this.paymentRequestService.clickedPayment.next(item); // pass single object
        }
        this.paymentRequestService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.paymentRequestService.disabledItems.next(false);
        this.paymentRequestService.disableGrid.next(false);
        this.paymentRequestService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.paymentRequestService.btnClick.next('');
      }
    });
  }

  convertToSqlDate(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async AssignValues(){
    // Header Details
    const voucher_id = await this.commonService.GetGuid();
    this.paymentRequestSave = {
      reason:this.paymentRequestModel.reason,
      paid_to: this.paymentRequestModel.paid_to,
      line_amount: this.paymentRequestModel.line_amount??0,
      register_code: this.paymentRequestModel.register_code??62,
      period_id: sessionStorage.getItem('year'),
      company_code: this.endPointService.companycode,
      ...(this.btnType === 'N'
      ? {
          voucher_id:voucher_id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          modified_by: null,
          modified_on: null,
          approval_status : 'PENDING',
          createdt :null,
          approved_by: null,
          approver_remarks: null,
          voucher_date:this.convertToSqlDate(this.paymentRequestModel.voucher_date)
        }
      : {
          voucher_id:this.paymentRequestModel.voucher_id,
          document_number: this.paymentRequestModel.document_number,
          created_by: this.paymentRequestModel.created_by,
          modified_by: localStorage.getItem('user_id'),
          approved_by: this.paymentRequestModel.approved_by,
          approver_remarks: this.paymentRequestModel.approver_remarks,
          modified_on: null,
          voucher_date: this.convertToSqlDate(this.paymentRequestModel.voucher_date),
          approval_status: this.paymentRequestModel.approval_status,
          createdt: this.paymentRequestModel.createdt,
        })
    };

    const stock_date = this.datePipe.transform(this.paymentRequestModel.voucher_date, 'dd/MM/yyyy');
    this.dateModel.voucher_date = stock_date;

    this.paymentRequestDetailModel = await this.mapItemsToDetails(this.rows,this.paymentRequestSave.voucher_id);
  }

  async mapItemsToDetails(items: any[],voucher_id:any): Promise<PaymentRequestDetailModel[]> {
    const detailsList: PaymentRequestDetailModel[] = [];
    let seq_no = 0;
    for (const item of items) {
      seq_no++;
      const details = new PaymentRequestDetailModel();
      details.detail_id =  await this.commonService.GetGuid();
      details.voucher_id = voucher_id;
      details.seq_no = seq_no;
      details.description = item.description;
      details.cheque_no = item.cheque_no;
      details.amount = item.amount;
      details.details = item.details;
      detailsList.push(details);
    }

    return detailsList;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.paymentRequestService.DeletePaymentRequest(this.paymentRequestModel.voucher_id)
    .subscribe(
      (updatedList: any[]) => {
        this.paymentRequestService.GetPaymentRequestList(sessionStorage.getItem('year'),1);
        this.paymentRequestService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.paymentRequestService.btnClick.next('')
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


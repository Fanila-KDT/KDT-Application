import { Component, ViewChild } from '@angular/core';
import { StockVerificationModel } from '../../../../Model/StockVerification/stock-verification.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { StockVerificationService } from '../../../../Service/StockVerificationService/stock-verification-service';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'stock-verification-details',
  standalone: false,
  templateUrl: './stock-verification-details.html',
  styleUrls: ['./stock-verification-details.css','../../../common.css']
})
export class StockVerificationDetails {
  @ViewChild(DatatableComponent) table?: DatatableComponent;
  itemDisable:boolean=true;
  saveDisable:boolean=true;
  cancelDisable:boolean=true;
  scroll: boolean = true;
  selected: any[] = [];
  reorderable = true;
  SelectionType = SelectionType;
  rows: any[] = []; 
  Finalrows: any[] = []; 
  rowsTemp: any[] = [];
  stockVerification: StockVerificationModel = new StockVerificationModel();
  stockVerificationTemp: StockVerificationModel = new StockVerificationModel();
  
  subscription: Subscription[];
  totalQty: number = 0;
  recQty: number = 0;
  isEditable: boolean = true;
  status: number = 0; // 1 for save, 2 for draft

  constructor(public stockVerificationService:StockVerificationService,public alertService:AlertService,public commonService:CommonService) {
    this.subscription = new Array<Subscription>();
    this.subscription.push(this.stockVerificationService.clickedStock.subscribe(async x=>{
      this.stockVerificationService.ControlsEnableAndDisable.next(true);
      if(!x){
        this.stockVerification =  new StockVerificationModel();
        this.rows =[];
        return;
      }
      this.stockVerification = {...x};
      await this.stockVerificationService.getStockVerificationDetails(this.stockVerification.voucher_id).then((res) => {});
    }));

    this.subscription.push(this.stockVerificationService.btnClick.subscribe(async x=>{
      if(x !==''){
        this.itemDisable = false;
        this.saveDisable = false;
        this.cancelDisable = false;
        this.isEditable =false;
        this.stockVerificationTemp = JSON.parse(JSON.stringify(this.stockVerification));
        this.stockVerification.verifiedDate = new Date();
        this.stockVerification.verified_date = new Date();
      }
    })); 

    this.subscription.push(this.stockVerificationService.assignStockDetails.subscribe(async (data:any)=>{
      if(data[0]){
        this.rows = JSON.parse(JSON.stringify(data));
        this.rowsTemp = JSON.parse(JSON.stringify(data));
        this.totalQty = this.sumRows('receipt_quantity');
        this.recQty = this.sumRows('verified_qty');
      }else{
        this.rows = [];
        this.totalQty = 0;
      }
    }));
  }

  ngOnInit(): void {
    
  }

  getRowIdentity(row: any): any {
    return row.rowguid; // unique identifier
  }

  RecQtyChange = this.debounce((qty: number, row: any) => {
    if(qty>row.receipt_quantity){
      row.verified_qty = 0;
      row.received = false;
      this.alertService.triggerAlert('Received quantity cannot be greater than Receipt quantity.',3000,'error');
      return;
    }
    row.received = qty > 0;
    this.recQty = this.sumRows('verified_qty');
  }, 200);

  ReceiveChange = this.debounce((check: boolean, row: any) => {
    row.verified_qty = check ? row.receipt_quantity : 0;
    this.recQty = this.sumRows('verified_qty');
  }, 200);

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.stockVerification.verified_date = date;
  }

  formatToDateInput(value: string): void {
    this.stockVerification.verified_date = value;
  }

  cancelClickMethod(){
    this.stockVerificationService.disableGrid.next(false);
    this.stockVerificationService.disabledItems.next(false);
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.isEditable = true;
    this.rows = JSON.parse(JSON.stringify(this.rowsTemp));
    this.stockVerification = JSON.parse(JSON.stringify(this.stockVerificationTemp));
    this.recQty = this.sumRows('verified_qty');
    this.stockVerificationService.ControlsEnableAndDisable.next(true);
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

  private sumRows(field: string): number {
    const total = this.rows.reduce((sum: number, row: any) => {
      const val = Number(row[field]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return Number(total);  // round to 4 decimal places
  }

  async onSubmit(StockForm:any){
    if (this.totalQty !== this.recQty) {
      Swal.fire({
        title: 'Quantity mismatch',
        text: 'Total quantity and received quantity is not matching.',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Proceed',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-danger me-2',
          cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.status = 2;
          await this.saveVerification(this.status);
        }
      });
    } else {
      this.status = 1;
      await this.saveVerification(this.status);
    }
  }

  async saveVerification(status: number) {
    await this.AssignValues();
    this.stockVerificationService.saveVaricationItems(this.Finalrows, status)
    .subscribe({
      next: async (result) => {
        this.stockVerificationService.disableGrid.next(false);
        this.stockVerificationService.disabledItems.next(false);
        this.itemDisable = true;
        this.saveDisable = true;
        this.cancelDisable = true;
        this.isEditable = true;
        this.stockVerificationService.btnClick.next('');
        await this.stockVerificationService.getStockVerificationList(sessionStorage.getItem('year'));
        const filteredRows = this.stockVerificationService.mainList
        .filter(row => row.voucher_id == this.Finalrows[0].grn_voucher_id);
        this.stockVerificationService.addRowAfterModify.next(filteredRows)
        this.stockVerificationService.ControlsEnableAndDisable.next(true);
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to save the Row...',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: { confirmButton: 'btn btn-danger' },
          buttonsStyling: false
        });
        this.stockVerificationService.btnClick.next('');
      }
    });
  }

  async saveAsDraftClickMethod(){
    await this.AssignValues();
    this.stockVerificationService.saveVaricationItems(this.Finalrows,3)
    .subscribe({
      next: (response) => {
        this.stockVerificationService.disableGrid.next(false);
        this.stockVerificationService.disabledItems.next(false);
        this.itemDisable = true;
        this.saveDisable = true;
        this.cancelDisable = true;
        this.isEditable = true;
        this.stockVerificationService.ControlsEnableAndDisable.next(true);
        this.stockVerificationService.btnClick.next('');
      },
      error: (err) => {
        this.alertService.triggerAlert('Failed to draft the Row...', 4000, 'error');
        this.stockVerificationService.btnClick.next('');
      }
    });
  }

  async AssignValues(){
    for (const row of this.rows) {
      const guidResponse = await this.commonService.GetGuid();
      row.verification_id = guidResponse; // or guidResponse.body / guidResponse.guid depending on API
      row.grn_voucher_id = this.stockVerification.voucher_id;
      row.grn_row_id = row.rowguid;
      row.verified_by = localStorage.getItem('user_id') || '';
      row.verified_date = this.stockVerification.verified_date;
      row.remarks = this.stockVerification.remarks;
    }

    this.Finalrows = this.rows.map(({ bin_location, item_code,item_name,receipt_quantity,received,rowguid,voucher_id, ...rest }) => rest);
  }
}

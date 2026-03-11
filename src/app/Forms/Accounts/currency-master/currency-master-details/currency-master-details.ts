import { Component } from '@angular/core';
import { CurrencyMasterService } from '../../../../Service/CurrencyMasterService/currency-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { Subscription } from 'rxjs';
import { CurrencyMasterModel } from '../../../../Model/CurrencyMaster/currency-master.model';
import { SelectionType } from '@swimlane/ngx-datatable';
import { formatDate } from '@angular/common';
import { EndPointService } from '../../../../Service/end-point.services';
import { HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'currency-master-details',
  standalone: false,
  templateUrl: './currency-master-details.html',
  styleUrls: ['./currency-master-details.css','../../../common.css']
})
export class CurrencyMasterDetails {

  itemDisable: boolean = true;
  subscription: Subscription[];
  currencyMasterModel: CurrencyMasterModel;
  currencyMasterModelTemp: CurrencyMasterModel;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  scroll: boolean = true;
  selected: any[] = [];
  gridHeight:number=384;
  reorderable = true;
  controls = {
    pageSize:50 
  };
  rows: any[] = []; 
  rowsTemp: any[] = []; 
  SelectionType = SelectionType;
  isEditable: boolean = true;
  rowCount:number=0;
  btnType: string="";
  isCurNameInvalid: boolean = false;
  isDescriptionInvalid: boolean = false;

  constructor(public currencyMasterService:CurrencyMasterService,private alertService: AlertService, public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.currencyMasterModel = new CurrencyMasterModel();
    this.currencyMasterModelTemp = new CurrencyMasterModel();
    this.subscription = new Array<Subscription>();
    
    this.subscription.push(this.currencyMasterService.clickedCurrency.subscribe(x=>{
      if(!x){
        this.currencyMasterModel = new CurrencyMasterModel();
        this.rows = [];
        return;
      }
      this.currencyMasterModel={...x}
      this.currencyMasterService.selectedCurNo = this.currencyMasterModel.cur_no;
      this.currencyMasterService.getExchangeRateList(this.currencyMasterModel.cur_no);
    }));

    this.subscription.push(this.currencyMasterService.assignExchangeRate.subscribe( (data:any)=>{
      if(data[0]){
        if(data[0].from_date){
          data.forEach((item:any )=> {
            item.from_date = formatDate(item.from_date, 'dd/MM/yyyy', 'en-US');
            item.to_date = formatDate(item.to_date, 'dd/MM/yyyy', 'en-US');
          });
        }
        this.rows = [...data];
      }else{
        this.rows = [];
      }
    }));

    this.subscription.push(this.currencyMasterService.btnClick.subscribe(x=>{
     this.btnClickFunction(x);
    }));

    this.subscription.push(this.currencyMasterService.cancelClick.subscribe(x=>{
      if(x){
        this.CancelclickMethod();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  onRowSelect(event: any) {
    //this.productMasterService.clickedProduct.next(event.selected[0]);
  }

  CancelclickMethod(){
    this.currencyMasterService.disableGrid.next(false);
    this.rows = [...this.rowsTemp];
    this.currencyMasterModel = {...this.currencyMasterModelTemp};
    this.rowCount = 0;
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.isEditable = true;
    this.currencyMasterService.disabledItems.next(false);
    this.isCurNameInvalid = false;
    this.isDescriptionInvalid = false;
    this.currencyMasterService.btnClick.next('');
     this.userAccessService.CheckUserAccess(this.currencyMasterService.FormName,this.currencyMasterService);
  }

  btnClickFunction(x: string) {
    this.btnType = x;
    
      this.currencyMasterModelTemp = {...this.currencyMasterModel};
      this.rowsTemp = [...this.rows];
     if(x =='N'){
        this.rows = [];
        this.currencyMasterModel = new CurrencyMasterModel();
        this.saveDisable = false;
        this.cancelDisable = false;
        this.itemDisable = false;
        this.isEditable = false;
      }else if(x=='M'){
        this.saveDisable = false;
        this.cancelDisable = false;
        this.itemDisable = false;
        this.isEditable = false;
      }else if(x=='D'){
        this.onDelete()
      }
  }

  deleteRow(index: number): void {
    if (index === this.rows.length - 1) {
      this.rows = this.rows.filter((_, i) => i !== index);
    }
  }

  addRow() {
    const invalidRows = this.rows.filter(row => !this.isToDateValid(row));
    if (invalidRows.length > 0) {
      this.alertService.triggerAlert('To Date Should be greater than From date...',4000, 'error');
      return;
    }

    const invalidExRate = this.rows.filter(row => !this.isExRateValid(row));
    if (invalidExRate.length > 0) {
      this.alertService.triggerAlert('Exchange Rate Should greater than Zero',4000, 'error');
      return;
    }
    const today = new Date();
    let fromDate: string;

    // If no rows exist, start from today
    if (this.rows.length === 0) {
      fromDate = this.formatDate(today);
    } else {
      const lastRow = this.rows[this.rows.length - 1];

      // Check if previous row has a valid to_date
      if (!lastRow.to_date || lastRow.to_date.trim() === '') {
       this.alertService.triggerAlert('Cannot add row: previous row is missing to date',4000,'error');
        return;
      }

      const lastToDate = this.parseDate(lastRow.to_date);
      if (!lastToDate || isNaN(lastToDate.getTime())) {
        this.alertService.triggerAlert('Cannot add row: previous to_date is invalid',4000,'error');
        return;
      }

      const nextDay = new Date(lastToDate);
      nextDay.setDate(nextDay.getDate() + 1);
      fromDate = this.formatDate(nextDay);
    }

    const newRow = {
      from_date: fromDate,
      to_date: '',
      ex_rate: 0,
      consumable_ex_rate: 0
    };

    this.rows = [...this.rows, newRow];
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(+year, +month - 1, +day);
  }

  isToDateValid(row: any): boolean {
    if(row.to_date){
      if (!row.from_date || !row.to_date) return true; // skip if either is missing
        const from = this.parseDate(row.from_date);
        const to = this.parseDate(row.to_date);
      return to > from;
    }else{
      return false;
    }
  }
    
  onDateSelected(date: Date | string | null | undefined, row: any): void {
    if (!date) {
      return;
    }
    let parsedDate: Date;
    if (typeof date === 'string') {
      const [day, month, year] = date.split('/').map(Number);
      parsedDate = new Date(year, month - 1, day);
    } else if (date instanceof Date) {
      parsedDate = date;
    } else {
      return;
    }
    if (isNaN(parsedDate.getTime())) {
      console.warn('Parsed date is invalid:', parsedDate);
      return;
    }
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    row.to_date = `${day}/${month}/${year}`;
  }

  formatToDateInput(value: string, row: any): void {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    row.to_date = formatted;
  }

  onToDateChange(row: any): void {
    // Optional: validate or trigger other logic when to_date changes
  }

  isExRateValid(row: any): boolean {
    return row.ex_rate > 0;
  }

  convertToSqlDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  async onSubmit(CurrencyMasterForm: any) {
    const invalidRows = this.rows.filter(row => !this.isToDateValid(row));
    if (invalidRows.length > 0) {
     this.alertService.triggerAlert('Please ensure To date',4000,'error');
     return;
    }
    
    const invalidExRate = this.rows.filter(row => !this.isExRateValid(row));
    if (invalidExRate.length > 0) {
      this.alertService.triggerAlert('Exchange Rate Should greater than Zero',4000, 'error');
      return;
    }

    const isValid = await this.validateForm(this.currencyMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    if(this.btnType == 'N'){
      this.currencyMasterModel.companycode = this.endPointService.companycode;
      const cur_no = <HttpResponse<any>>await this.currencyMasterService.getItemNo();
      this.currencyMasterModel.cur_no = cur_no;
      // Assign cur_no to each row in this.rows
      this.rows.forEach(row => {
        row.cur_no = cur_no;
      });

      this.rows.forEach(row => {
        row.from_date = this.convertToSqlDate(row.from_date);
        row.to_date = this.convertToSqlDate(row.to_date);
      });

      this.currencyMasterService.saveCurrencyMasterWithRates(this.currencyMasterModel, this.rows)
        .subscribe({
          next: (response: any) => {
            const savedCurrency = response.currencyMaster;
            const savedRates = response.exchangeRates;
            savedRates.forEach((item: any) => {
              item.from_date = formatDate(item.from_date, 'dd/MM/yyyy', 'en-US');
              item.to_date = formatDate(item.to_date, 'dd/MM/yyyy', 'en-US');
            });
            this.currencyMasterService.addRowAfterSave.next(savedCurrency)
            this.rows = [ ...savedRates];
            this.currencyMasterModel = {...savedCurrency};
            this.itemDisable = true;
            this.saveDisable = true;
            this.cancelDisable = true;
            this.isEditable = true;
            this.currencyMasterService.disabledItems.next(false);
            this.currencyMasterService.disableGrid.next(false);
            this.alertService.triggerAlert('Row saved successfully...',4000, 'success');
            this.currencyMasterService.btnClick.next('');
            this.userAccessService.CheckUserAccess(this.currencyMasterService.FormName,this.currencyMasterService);
          },
        error: (err) => {
          this.alertService.triggerAlert('Failed to save the Row...',4000, 'error');
          this.currencyMasterService.btnClick.next('')
        }
      });
    }else if(this.btnType == 'M'){
      this.rows.forEach(row => {
        row.cur_no = this.currencyMasterModel.cur_no;
        row.from_date = this.convertToSqlDate(row.from_date);
        row.to_date = this.convertToSqlDate(row.to_date);
      });
      this.currencyMasterService.updateCurrencyMasterWithRates(this.currencyMasterModel, this.rows)
      .subscribe({
        next: (response: any) => {
          const savedCurrency = response.currencyMaster;
          const savedRates = response.exchangeRates;
          savedRates.forEach((item: any) => {
            item.from_date = formatDate(item.from_date, 'dd/MM/yyyy', 'en-US');
            item.to_date = formatDate(item.to_date, 'dd/MM/yyyy', 'en-US');
          });
          this.currencyMasterService.addRowAfterModify.next(savedCurrency)
          this.rows = [...savedRates];
          this.currencyMasterModel = {...savedCurrency};
          this.itemDisable = true;
          this.saveDisable = true;
          this.cancelDisable = true;
          this.isEditable = true;
          this.currencyMasterService.disabledItems.next(false);
          this.currencyMasterService.disableGrid.next(false);
          this.alertService.triggerAlert('Row updated successfully...', 4000, 'success');
          this.currencyMasterService.btnClick.next(''); 
          this.userAccessService.CheckUserAccess(this.currencyMasterService.FormName,this.currencyMasterService);
        },
        error: (err) => {
          this.alertService.triggerAlert('Failed to update the Row...', 4000, 'error');
          this.currencyMasterService.btnClick.next('')
        }
      });
    }
  }

  
  async validateForm(model: CurrencyMasterModel): Promise<boolean> {
    // Reset all flags
    this.isCurNameInvalid = !model.cur_name?.trim();
    this.isDescriptionInvalid = !model.cur_desc?.trim();
        // Final validity check
    const isValid = !(
      this.isCurNameInvalid ||
      this.isDescriptionInvalid 
    );

    return isValid;
  }


  async onDelete() {
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.currencyMasterService.deleteCurrencyMaster(this.currencyMasterModel.cur_no)
    .subscribe(
      (updatedList: any[]) => {
        this.currencyMasterService.loadList.next(updatedList);
        this.currencyMasterService.clickedCurrency.next(updatedList[0]);
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'success');
        this.currencyMasterService.btnClick.next('')
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.currencyMasterService.btnClick.next('')
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
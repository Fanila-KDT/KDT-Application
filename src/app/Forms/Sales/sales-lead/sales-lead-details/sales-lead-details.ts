import { Component } from '@angular/core';
import { SalesLeadModel, SalesLeadSave } from '../../../../Model/SalesLead/sales-lead.model';
import { Subscription } from 'rxjs';
import { SalesLeadService } from '../../../../Service/SalesLeadService/sales-lead-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import Swal from 'sweetalert2';
import { TagMasterService } from '../../../../Service/TagMasterService/tag-master-service';
import { CustomerMasterService } from '../../../../Service/CustomerMasterService/customer-master-service';

@Component({
  selector: 'sales-lead-details',
  standalone: false,
  templateUrl: './sales-lead-details.html',
  styleUrls: ['./sales-lead-details.css','../../../common.css']
})
export class SalesLeadDetails {
  salesLeadModel: SalesLeadModel = new SalesLeadModel();
  salesLeadTemp: SalesLeadModel = new SalesLeadModel();
  salesLeadSaveModel: SalesLeadSave = new SalesLeadSave();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  CustomerDisable:boolean =true;
  CustomerList:any[] = [];
  CustomerListTemp:any[] = [];
  btnType: string = '';
  AreaList:any[] = [];
  SalesManList:any[] = [];
  SalesManListTemp:any[] = [];
  isCustomer: boolean = false;
  isEmployee: boolean = false;
  isModel: boolean = false;
  statusDisable: boolean = true;

  constructor( private salesLeadService: SalesLeadService,public tagMasterService:TagMasterService, public alertService: AlertService, public commonService: CommonService, 
    public endPointService: EndPointService,public customerMasterService:CustomerMasterService) {
  
    this.subscription.push(this.salesLeadService.clickedSalesLead.subscribe(async x=>{
      if(!x){
        this.salesLeadModel =  new SalesLeadModel();
        return;
      }
      this.salesLeadService.ControlsEnableAndDisable.next(true);
      this.salesLeadModel = {...x};
      if(this.salesLeadModel.customer_id == null){
        this.salesLeadModel.new_check =true;
        this.CustomerDisable = false;
      }else{
        this.salesLeadModel.new_check = false;
        this.CustomerDisable = true; 
      }
    }));

    this.subscription.push(this.salesLeadService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));

    this.subscription.push(this.commonService.isSystemAdmin.subscribe(data=>{
      this.statusDisable = !data;
    }));
  }

  async ngOnInit() {
    this.customerMasterService.getAreaList().then((res: any[]) => {
      this.AreaList = res;
    });
    this.CustomerList = await this.tagMasterService.GetCustomerList(1); 
    this.SalesManList = await this.tagMasterService.GetSalesManList(1); 
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesLeadService.disableGrid.next(false);
    this.salesLeadModel = new SalesLeadModel();
    this.salesLeadService.disabledItems.next(false);
    this.salesLeadService.btnClick.next('');
    this.salesLeadService.ControlsEnableAndDisable.next(true);
    this.isCustomer = false;
    this.isEmployee = false;
    this.isModel = false;
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.salesLeadTemp = {...this.salesLeadModel};
    if(x =='N'){
      this.salesLeadModel = new SalesLeadModel();
      this.salesLeadModel.voucherDate = new Date();
      this.salesLeadModel.voucher_date = new Date();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable =false;
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable =false;
    }else if(x =='D'){
      this.onDelete();
    }
  }

  onDateSelected(date: Date | string | null | undefined): void {
    if (!date) {
      return;
    }
    this.salesLeadModel.voucher_date = date;
  }

  formatToDateInput(value: string): void {
    this.salesLeadModel.voucher_date = value;
  }

  async onSubmit(Form:any){
    const isValid = await this.validateForm(this.salesLeadModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }
    await this.AssignValues();

    this.salesLeadService.SaveSalesLead(this.salesLeadSaveModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.salesLeadService.getSalesLeadList(2);
        let item: SalesLeadModel | undefined = this.salesLeadService.mainList.find(item => item.area_id === response.area_id);
        if (item) {
          await this.salesLeadService.loadList.next(this.salesLeadService.mainList);
          this.salesLeadService.clickedSalesLead.next(item); // pass single object
        }
        this.salesLeadService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.salesLeadService.disabledItems.next(false);
        this.salesLeadService.disableGrid.next(false);
        this.salesLeadService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.salesLeadService.btnClick.next('');
      }
    });
  }

  async validateForm(model: SalesLeadModel): Promise<boolean> {
    // Reset validation flags
    this.isCustomer = !model.customer_name || model.customer_name.trim() === '';
    this.isEmployee = !model.employee_id;
    this.isModel = !model.new_machine_model;
    const isValid = !(this.isCustomer || this.isEmployee || this.isModel );
    return isValid;
  }

  async AssignValues(){
    // Header Details
    var id = await this.commonService.GetGuid();
    this.salesLeadSaveModel = {
      register_code: 74,
      customer_id: this.salesLeadModel.customer_id??null,
      customer_name: this.salesLeadModel.customer_name,
      contact_name: this.salesLeadModel.contact_name,
      contact_no: this.salesLeadModel.contact_no,
      area_id: this.salesLeadModel.area_id,
      employee_id: this.salesLeadModel.employee_id,
      eng_mobile: this.salesLeadModel.eng_mobile,
      new_machine_model: this.salesLeadModel.new_machine_model,
      new_machine_type: this.salesLeadModel.new_machine_type,
      monthly_volume: this.salesLeadModel.monthly_volume,
      price: this.salesLeadModel.price,
      trade_in_model: this.salesLeadModel.trade_in_model,
      tag_no: this.salesLeadModel.tag_no,
      trade_in_type: this.salesLeadModel.trade_in_type,
      condition: this.salesLeadModel.condition,
      salesman_id: this.salesLeadModel.salesman_id,
      sales_manager_id: this.salesLeadModel.sales_manager_id,
      comments: this.salesLeadModel.comments,
      companycode: this.endPointService.companycode,
      ...(this.btnType === 'N'
      ? {
          Id: id,
          document_number: '',
          created_by: localStorage.getItem('user_id'),
          modified_by: null,
          modified_on: null,
          status : 'PENDING',
          createdt :null,
          voucher_date: this.convertToSqlDateTime(this.salesLeadModel.voucher_date)
        }
      : {
          Id: this.salesLeadModel.id,
          document_number: this.salesLeadModel.document_number,
          created_by: this.salesLeadModel.created_by,
          modified_by: localStorage.getItem('user_id'),
          modified_on: null,
          voucher_date: this.convertToSqlDateTime(this.salesLeadModel.voucher_date),
          status: this.salesLeadModel.status,
          createdt: this.salesLeadModel.createdt,
        })
    };
  }

  convertToSqlDateTime(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  NewChange(event:any){
    if(event.target.checked){
      this.CustomerDisable = false;
      this.salesLeadModel.customer_id = null;
      this.salesLeadModel.customer_name = null;
    }else{
      this.CustomerDisable = true;
      this.salesLeadModel.customer_name = null;
    }
  }

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.salesLeadService.disableGrid.next(false);
    this.salesLeadModel = {...this.salesLeadTemp};
    this.salesLeadService.disabledItems.next(false);
    this.salesLeadService.btnClick.next('');
    this.salesLeadService.ControlsEnableAndDisable.next(true);
    this.isCustomer = false;
    this.isEmployee = false;
    this.isModel = false;
    if(this.salesLeadModel.customer_id == null){
      this.salesLeadModel.new_check =true;
      this.CustomerDisable = false;
    }else{
      this.salesLeadModel.new_check = false;
      this.CustomerDisable = true; 
    }
  }

  CustomerChange(cust_code :any){
    var match = this.CustomerList.find(y => y.creditcustomerid == cust_code);
    this.salesLeadModel.customer_name = match.name;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.salesLeadService.DeleteSalesLead(this.salesLeadModel.id)
    .subscribe(
      (updatedList: any[]) => {
        this.salesLeadService.getSalesLeadList(1);
        this.salesLeadService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.salesLeadService.btnClick.next('')
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


import { Component } from '@angular/core';
import { CustomerMasterModel, CustomerMasterSave } from '../../../../Model/CustomerMaster/customer-master.model';
import { CustomerMasterService } from '../../../../Service/CustomerMasterService/customer-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { Subscription } from 'rxjs';
import { SupplierMasterService } from '../../../../Service/SupplierMasterService/supplier-master-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'customer-master-details',
  standalone: false,
  templateUrl: './customer-master-details.html',
  styleUrls: ['./customer-master-details.css','../../../common.css']
})
export class CustomerMasterDetails {
  customerMasterModel: CustomerMasterModel = new CustomerMasterModel();
  customerMasterTemp: CustomerMasterModel = new CustomerMasterModel();
  customerMasterSave: CustomerMasterSave = new CustomerMasterSave();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  priorityDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  blackListDisable: boolean = true;
  AccDisable: boolean = true
  MarketList : any[] = [];
  AreaList : any[] = [];
  SubGroupList : any[] = [];
  CollectorList : any[] = [];
  btnType: string = '';
  isMarketChannelInvalid: boolean = false;
  isAreaNameInvalid: boolean = false;
  isEmailInvalid: boolean = false;
  isCollectorInvalid: boolean = false;
  isNameInvalid: boolean = false;
  isArabicNameInvalid: boolean = false;
  ReasonDisable: boolean = true;

  constructor(private supplierMasterService: SupplierMasterService, private customerMasterService: CustomerMasterService, public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService) {

    this.subscription.push(this.customerMasterService.clickedCustomer.subscribe(async x=>{
      if(!x){
        this.customerMasterModel =  new CustomerMasterModel();
        return;
      }
      this.customerMasterService.ControlsEnableAndDisable.next(true);
      this.customerMasterModel = {...x};
    }));

    this.subscription.push(this.customerMasterService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  ngOnInit(): void {
    this.customerMasterService.getMarketList().then((res: any[]) => {
      this.MarketList = res;
      this.customerMasterService.MarketList = res;
    });
    this.customerMasterService.getAreaList().then((res: any[]) => {
      this.AreaList = res;
    });
    this.supplierMasterService.GetSubListByMainCode('83').then((res:any)=>{
      this.SubGroupList = res;
    });
    this.customerMasterService.GetCollectorList().then((res: any[]) => {
      this.CollectorList = res;
      this.customerMasterService.CollectorList = res;
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.priorityDisable = true;
    this.blackListDisable = true;
    this.ReasonDisable = true;
    this.AccDisable = true;
    this.customerMasterService.disableGrid.next(false);
    this.customerMasterService.disabledItems.next(false);
    this.customerMasterService.btnClick.next('');
    this.customerMasterModel = new CustomerMasterModel(); 
    this.customerMasterTemp = new CustomerMasterModel();
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.customerMasterTemp = {...this.customerMasterModel};
    this.priorityDisable = !this.commonService.isTagAdmin.value;
    this.itemDisable = this.commonService.isAccAdmin.value;
    this.blackListDisable = this.commonService.isAccAdmin.value;
    this.ReasonDisable = this.commonService.isAccAdmin.value;
    this.AccDisable = false;
    if(x =='N'){
      this.customerMasterModel = new CustomerMasterModel();
      this.saveDisable = false;
      this.cancelDisable = false;
    }else if(x =='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
    }else if(x =='D'){
      this.onDelete();
    }
  }

  onAreaChange(event: any) {
    if(event){
      this.customerMasterModel.area_code = event.area_code || '';  
    }else{
      this.customerMasterModel.area_code = null;
    }
  }

  async onSubmit(Form:any){
    const isValid = await this.validateForm(this.customerMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    await this.AssignValues();

    this.customerMasterService.SaveCustomerMaster(this.customerMasterSave).then(async (res: any) => {
      if(this.btnType == 'N'){
        this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
      }else{
        this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
      }
      await this.customerMasterService.getCustomerMasterList(2);
      let item: CustomerMasterModel | undefined = this.customerMasterService.mainList.find(item => item.cardno === res.cardno);
      if (item) {
        await this.customerMasterService.loadList.next(this.customerMasterService.mainList);
        this.customerMasterService.clickedCustomer.next(item); // pass single object
      }
      this.customerMasterService.btnClick.next('');
      this.saveDisable = true;
      this.cancelDisable = true;
      this.itemDisable = true;
      this.ReasonDisable = true;
      this.priorityDisable = true;
      this.blackListDisable = true;
      this.AccDisable = true;
      this.customerMasterService.disabledItems.next(false);
      this.customerMasterService.disableGrid.next(false);
      this.customerMasterService.ControlsEnableAndDisable.next(true);
    }).catch(error => {
      console.error('SaveCustomerMaster error:', error);
      this.alertService.triggerAlert('Failed to save customer master. Please try again.', 4000, 'error');
      this.customerMasterService.btnClick.next('');
    });
  }

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.priorityDisable = true;
    this.blackListDisable = true;
    this.AccDisable = true;
    this.customerMasterService.disableGrid.next(false);
    this.customerMasterModel = {...this.customerMasterTemp};
    this.customerMasterService.disabledItems.next(false);
    this.customerMasterService.btnClick.next('');
    this.customerMasterService.ControlsEnableAndDisable.next(true);
    this.isAreaNameInvalid = false;
    this.isEmailInvalid = false;
    this.isCollectorInvalid = false;
    this.isMarketChannelInvalid = false;
    this.isNameInvalid = false;
    this.isArabicNameInvalid  = false;
    this.ReasonDisable = true;
  }

  async validateForm(model: CustomerMasterModel): Promise<boolean> {
    // Reset validation flags
    this.isMarketChannelInvalid = !model.market_channel_name || model.market_channel_name.trim() === '';
    this.isAreaNameInvalid = !model.area_id;
    this.isEmailInvalid = !model.email_id;
    this.isCollectorInvalid = !model.collector_id;
    this.isNameInvalid = !model.name;
    const containsGovt = model.market_channel_name?model.market_channel_name.toLowerCase().includes('govt'):false;
    if(containsGovt){
      this.isArabicNameInvalid = !model.arabic_name;
    }else{
      this.isArabicNameInvalid = false;
    }
    
    const isValid = !this.isMarketChannelInvalid && !this.isAreaNameInvalid && !this.isEmailInvalid && !this.isCollectorInvalid && !this.isNameInvalid && !this.isArabicNameInvalid;
    return isValid;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.customerMasterService.deleteCustomerMaster(this.customerMasterModel.creditcustomerid,this.customerMasterModel.accountcode)
    .subscribe(
      (updatedList: any[]) => {
        this.customerMasterService.getCustomerMasterList(1);
        this.customerMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.customerMasterService.btnClick.next('')
      }
    );
  }

  async AssignValues(){
    this.customerMasterSave = {
      creditcustomerid:this.customerMasterModel.creditcustomerid??0,
      cardno: this.customerMasterModel.cardno??'null',
      name: this.customerMasterModel.name,
      arabic_name: this.customerMasterModel.arabic_name,
      market_channel_name: this.customerMasterModel.market_channel_name,
      accountcode: this.customerMasterModel.accountcode,
      main_group_code: this.customerMasterModel.main_group_code,
      sub_group_code: this.customerMasterModel.sub_group_code,
      mobileno: this.customerMasterModel.mobileno,
      telephone: this.customerMasterModel.telephone,
      contact_person: this.customerMasterModel.contact_person,
      title: this.customerMasterModel.title,
      department: this.customerMasterModel.department,
      area_id: this.customerMasterModel.area_id,
      house_no: this.customerMasterModel.house_no,
      street: this.customerMasterModel.street,
      building_no: this.customerMasterModel.building_no,
      building_name: this.customerMasterModel.building_name,
      block_no: this.customerMasterModel.block_no,
      floor_no: this.customerMasterModel.floor_no,
      flat_no: this.customerMasterModel.flat_no,
      email_id: this.customerMasterModel.email_id,
      address: this.customerMasterModel.address,
      fax_no: this.customerMasterModel.fax_no,
      paci_no: this.customerMasterModel.paci_no,
      collector_id: this.customerMasterModel.collector_id,
      contract_cust: this.customerMasterModel.contract_cust??false,
      accrued_rev: this.customerMasterModel.accrued_rev??false,
      major_customer: this.customerMasterModel.major_customer??false,
      blacklist: this.customerMasterModel.blacklist??false,
      blacklist_reason: this.customerMasterModel.blacklist_reason??"",
      companycode: this.endPointService.companycode,
      user_id: localStorage.getItem('user_id') || '',
      createdt: this.customerMasterModel.createdt??null
    };
  }

  onBlacklistChange(event: any) {
    if(event.target.checked){
      this.ReasonDisable = false;
    }else{
      this.ReasonDisable = true;
      this.customerMasterModel.blacklist_reason = '';
    }
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

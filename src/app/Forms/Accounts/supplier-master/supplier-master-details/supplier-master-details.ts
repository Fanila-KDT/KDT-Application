import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SupplierAddressModel, SupplierMasterModel, SupplierMasterModelSave } from '../../../../Model/SupplierMaster/supplier-master.model';
import { SupplierMasterService } from '../../../../Service/SupplierMasterService/supplier-master-service';
import { EndPointService } from '../../../../Service/end-point.services';
import { AlertService } from '../../../../shared/alert/alert.service';
import Swal from 'sweetalert2';
import { AccountMasterService } from '../../../../Service/AccountMasterService/account-master-service';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'supplier-master-details',
  standalone: false,
  templateUrl: './supplier-master-details.html',
  styleUrls: ['./supplier-master-details.css','../../../common.css']
})
export class SupplierMasterDetails {
  subscription: Subscription[];
  supplierMasterModel: SupplierMasterModel;
  supplierMasterModelTemp: SupplierMasterModel;
  supplierMasterModelSave: SupplierMasterModelSave;
  supplierAddressModel:SupplierAddressModel;
  supplierAddressModelTemp:SupplierAddressModel;
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  isSupNameInvalid: boolean = false;
  btnType: string="";
  subList: any[] = [];
  curList: any[] = []; 
  constructor(public supplierMasterService:SupplierMasterService,private alertService: AlertService,public endPointService:EndPointService,
              private accountMasterService:AccountMasterService,public userAccessService:UserAccessService) {
    this.supplierMasterModel = new SupplierMasterModel();
    this.supplierMasterModelSave = new SupplierMasterModelSave();
    this.supplierMasterModelTemp = new SupplierMasterModel();
    this.supplierAddressModel = new SupplierAddressModel();
    this.supplierAddressModelTemp = new SupplierAddressModel();
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.supplierMasterService.clickedSupplier.subscribe(data=>{
      if(!data){
        this.supplierAddressModel =  new SupplierAddressModel();
        return;
      }
      this.supplierMasterModel={...data}
      this.supplierAddressModel.address = data.address;
      this.supplierAddressModel.address1 = data.address1;
      this.supplierAddressModel.address2 = data.address2;
      this.supplierAddressModel.telephone1 = data.telephone1;
      this.supplierAddressModel.telephone2 = data.telephone2;
      this.supplierAddressModel.concerned_person = data.concerned_person;
      this.supplierMasterService.selectedSupNo = this.supplierMasterModel.account_code;
      this.supplierMasterService.selectedSupName = this.supplierMasterModel.account_name;
    }));

    this.subscription.push(this.supplierMasterService.btnClick.subscribe(data=>{
     this.btnClickFunction(data);
    }));

    this.subscription.push(this.supplierMasterService.cancelClick.subscribe(x=>{
      if(x){
        this.cancelClickMethod();
      }
    }));
  }

  ngOnInit() {
    this.supplierMasterService.GetSubListByMainCode('51').then((res:any)=>{
      this.subList = res;
    });
    this.supplierMasterService.GetForeignCurrency().then((res:any)=>{
      this.curList = res;
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  async onSubmit(SupplierasterForm:any){
    const isValid = await this.validateForm(this.supplierMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }

    const { group_name,cur_name,address,address1,address2,telephone1,telephone2,concerned_person, ...rest } = this.supplierMasterModel;
    this.supplierMasterModelSave = { ...rest };

    var response = false;
    if(this.btnType === 'N'){
      response = await this.accountMasterService.accNameCheck(this.supplierMasterModel.account_name);
      this.supplierMasterModelSave.company_code = this.endPointService.companycode;
    }else{
      if(this.supplierMasterModel.account_name != this.supplierMasterService.selectedSupName){
        response = await this.accountMasterService.accNameCheck(this.supplierMasterModel.account_name);
      }
    }

    if(response == false){
      this.supplierMasterService.SaveSupplierMaster(this.supplierMasterModelSave, this.supplierAddressModel).then((res: any) => {
        if(this.btnType === 'N'){
          this.supplierMasterService.addRowAfterSave.next(res.header);
          this.alertService.triggerAlert('Saved Successfully.', 4000, 'success');
        }
        if(this.btnType === 'M'){
          this.supplierMasterService.addRowAfterModify.next(res.header);
          this.alertService.triggerAlert('Modified Successfully.', 4000, 'success');
        }
        this.supplierMasterModel = {...res.header};
        this.supplierAddressModel= {...res.address};
        this.itemDisable = true;
        this.saveDisable = true;
        this.cancelDisable = true;
        this.supplierMasterService.disableGrid.next(false);
        this.supplierMasterService.disabledItems.next(false);
        this.supplierMasterService.btnClick.next('');
        this.userAccessService.CheckUserAccess(this.supplierMasterService.FormName,this.supplierMasterService);
      }).catch(error => {
          console.error('SaveSupplierMaster error:', error);
          this.alertService.triggerAlert('Failed to save account. Please try again.', 4000, 'error');
          this.supplierMasterService.btnClick.next('');
      });
    }else{
      this.alertService.triggerAlert('Supplier Name is already exists. Please try again.', 4000, 'error');
    }
    
  }

  async validateForm(model: SupplierMasterModel): Promise<boolean> {
    // Reset all flags
    this.isSupNameInvalid = !model.account_name?.trim();
        // Final validity check
    const isValid = !(
      this.isSupNameInvalid 
    );

    return isValid;
  }

  cancelClickMethod(){
    this.supplierMasterService.disableGrid.next(false);
    this.supplierMasterModel = {...this.supplierMasterModelTemp};
    this.supplierAddressModel = {...this.supplierAddressModelTemp};
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.supplierMasterService.disabledItems.next(false);
    this.isSupNameInvalid = false;
    this.supplierMasterService.btnClick.next('');
    this.userAccessService.CheckUserAccess(this.supplierMasterService.FormName,this.supplierMasterService);
  }

  btnClickFunction(x: string) {
    this.btnType = x;
    this.supplierMasterModelTemp = {...this.supplierMasterModel};
    this.supplierAddressModelTemp = {...this.supplierAddressModel};
    if(x =='N'){
      this.supplierMasterModel = new SupplierMasterModel();
      this.supplierAddressModel = new SupplierAddressModel();
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='M'){
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='D'){
      this.onDelete()
    }
  }

  async onDelete() {
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.supplierMasterService.deleteSupplierMaster(this.supplierMasterModel.account_code)
    .subscribe(
      (updatedList: any[]) => {
        this.supplierMasterService.loadList.next(updatedList);
        this.supplierMasterService.clickedSupplier.next(updatedList[0]);
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'success');
        this.supplierMasterService.btnClick.next('')
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.supplierMasterService.btnClick.next('')
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
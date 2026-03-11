import { Component } from '@angular/core';
import { AccountMasterModel, AccountMasterModelSave } from '../../../../Model/AccountMaster/account-master.model';
import { AccountMasterService } from '../../../../Service/AccountMasterService/account-master-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { Subscription } from 'rxjs';
import { EndPointService } from '../../../../Service/end-point.services';
import Swal from 'sweetalert2';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';

@Component({
  selector: 'account-master-details',
  standalone: false,
  templateUrl: './account-master-details.html',
  styleUrls: ['./account-master-details.css','../../../common.css']
})
export class AccountMasterDetails {

  accountMasterModel: AccountMasterModel;
  accountMasterModelTemp: AccountMasterModel;
  accountMasterModelSave: AccountMasterModelSave;
  itemDisable: boolean = true;
  subscription: Subscription[];
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  isMainGrpInvalid: boolean = false;
  isAccNameInvalid: boolean = false;
  btnType: string="";
  mainList: any[] = [];
  subList: any[] = [];
  subListTemp: any[]= [];

  constructor(public accountMasterService:AccountMasterService,private alertService: AlertService,public endPointService:EndPointService,public userAccessService:UserAccessService) {
    this.accountMasterModel = new AccountMasterModel();
    this.accountMasterModelSave = new AccountMasterModelSave();
    this.accountMasterModelTemp = new AccountMasterModel();
    this.subscription = new Array<Subscription>();

    this.subscription.push(this.accountMasterService.clickedAccount.subscribe(x=>{
      if(!x){
        this.accountMasterModel =  new AccountMasterModel();
        return;
      }
      this.accountMasterModel={...x}
      this.accountMasterService.selectedAccNo = this.accountMasterModel.account_code;
      this.accountMasterService.selectedAccName = this.accountMasterModel.account_name;
    }));

    this.subscription.push(this.accountMasterService.btnClick.subscribe(x=>{
     this.btnClickFunction(x);
    }));

    this.subscription.push(this.accountMasterService.cancelClick.subscribe(x=>{
      if(x){
        this.cancelClickMethod();
      }
    }));
  }

  ngOnInit() {
    this.accountMasterService.GetAccountMainList().then((res: any[]) => {
      this.mainList = res.filter(item => item.main_group_code !== 51 && item.main_group_code !== 83);
    });
    
    this.accountMasterService.GetAccountSubList().then((res:any)=>{
      this.subList = res;
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  btnClickFunction(x: string) {
    this.btnType = x;
    this.accountMasterModelTemp = {...this.accountMasterModel};
    this.subListTemp = [...this.subList];
    if(x =='N'){
      this.accountMasterModel = new AccountMasterModel();
      this.subList = [];
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='M'){
      this.mainGroupChangeFirst(this.accountMasterModel.main_group_code);
      this.saveDisable = false;
      this.cancelDisable = false;
      this.itemDisable = false;
    }else if(x=='D'){
      this.onDelete()
    }
  }

  cancelClickMethod(){
    this.accountMasterService.disableGrid.next(false);
    this.accountMasterModel = {...this.accountMasterModelTemp};
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.accountMasterService.disabledItems.next(false);
    this.subList = [...this.subListTemp];
    this.isMainGrpInvalid = false;
    this.isAccNameInvalid = false;
    this.accountMasterService.btnClick.next('');
    this.userAccessService.CheckUserAccess(this.accountMasterService.FormName,this.accountMasterService);
  }

  async onSubmit(acctForm:any){
    const isValid = await this.validateForm(this.accountMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }
    this.accountMasterModelSave =this.accountMasterModel;
    var response = false;
    if(this.btnType === 'N'){
      response = await this.accountMasterService.accNameCheck(encodeURIComponent(this.accountMasterModel.account_name));
      this.accountMasterModelSave.company_code = this.endPointService.companycode;
    }else{
      if(this.accountMasterModel.account_name != this.accountMasterService.selectedAccName){
        response = await this.accountMasterService.accNameCheck(encodeURIComponent(this.accountMasterModel.account_name));
      }
    }

    if(response == false){
      this.accountMasterService.SaveAccountMaster(this.accountMasterModelSave).then((res: any) => {
        if(this.btnType === 'N'){
          this.accountMasterService.addRowAfterSave.next(res);
          this.alertService.triggerAlert('Saved Successfully...', 4000, 'success');
        }
        if(this.btnType === 'M'){
          this.accountMasterService.addRowAfterModify.next(res);
          this.alertService.triggerAlert('Modified Successfully...', 4000, 'success');
        }
        this.accountMasterModel = {...res};
        this.itemDisable = true;
        this.saveDisable = true;
        this.cancelDisable = true;
        this.accountMasterService.disableGrid.next(false);
        this.accountMasterService.disabledItems.next(false);
        this.subList = [...this.subListTemp];
        this.accountMasterService.btnClick.next('');
        this.userAccessService.CheckUserAccess(this.accountMasterService.FormName,this.accountMasterService);
      }).catch(error => {
        console.error('SaveAccountMaster error:', error);
        this.alertService.triggerAlert('Failed to save account. Please try again.', 4000, 'error');
        this.accountMasterService.btnClick.next('');
      });
    }else{
      this.alertService.triggerAlert('Account Name is already exists. Please try again.', 4000, 'error');
    }
  }

  async validateForm(model: AccountMasterModel): Promise<boolean> {
    // Reset all flags
    this.isAccNameInvalid = !model.account_name?.trim();
    this.isMainGrpInvalid = !model.main_group_code;
        // Final validity check
    const isValid = !(
      this.isAccNameInvalid ||
      this.isMainGrpInvalid 
    );

    return isValid;
  }
  

  mainGroupChange(event:any){
    let main_group_code = event.target.value;
    this.accountMasterService.GetSubListByMainCode(main_group_code).then((res:any)=>{
      this.subList = res;
    });
  }

  mainGroupChangeFirst(main_group_code:any){
    this.accountMasterService.GetSubListByMainCode(main_group_code).then((res:any)=>{
      this.subList = res;
    });
  }


  async onDelete() {
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.accountMasterService.deleteAccountMaster(this.accountMasterModel.account_code)
    .subscribe(
      (updatedList: any[]) => {
        this.accountMasterService.loadList.next(updatedList);
        this.accountMasterService.clickedAccount.next(updatedList[0]);
        this.alertService.triggerAlert('Row deleted successfully...', 4000, 'success');
        this.accountMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.accountMasterService.btnClick.next('');
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
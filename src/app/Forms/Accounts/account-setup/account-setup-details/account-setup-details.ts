import { Component } from '@angular/core';
import { AccountSetupModel } from '../../../../Model/AccountSetup/account-setup.model';
import { AccountSetupService } from '../../../../Service/AccountSetupService/account-setup-service';
import { ExpenseEntryService } from '../../../../Service/ExpenseEntryService/expense-entry-service';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../shared/alert/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'account-setup-details',
  standalone: false,
  templateUrl: './account-setup-details.html',
  styleUrls: ['./account-setup-details.css','../../../common.css']
})
export class AccountSetupDetails {
  accountSetupModel: AccountSetupModel = new AccountSetupModel(); 
  accountSetupTemp: AccountSetupModel = new AccountSetupModel();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  AccountList: any[] = [];
  public activeTabName: string = 'Main Accounts';
  btnType: string = '';

  constructor( private accountSetupService: AccountSetupService,private expenseEntryService:ExpenseEntryService,public alertService:AlertService){
    this.subscription.push(this.accountSetupService.clickedAccount.subscribe(async x=>{
      if(!x){
        this.accountSetupModel =  new AccountSetupModel();
        return;
      }
      this.accountSetupService.ControlsEnableAndDisable.next(true);
      this.accountSetupModel = {...x};
    }));

    this.subscription.push(this.accountSetupService.btnClick.subscribe(async x=>{
      if(x !==''){
        if(x != ''){
          this.btnClickFunction(x);
        }
      }
    }));
  }

  async ngOnInit() {
    await this.expenseEntryService.getAccountList().then((res: any[]) => {
      this.AccountList = res;
    });
  }

  setActiveTab(name: string) {
    this.activeTabName = name;
  }

  async onSubmit(Form:any){
    let xx = this.accountSetupModel
    this.accountSetupService.SaveAccountSetup(this.accountSetupModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.accountSetupService.GetAccountSetupList(2);
        let item: AccountSetupModel | undefined = this.accountSetupService.mainList.find(item => item.companY_CODE === response.companY_CODE);
        if (item) {
          await this.accountSetupService.loadList.next(this.accountSetupService.mainList);
          this.accountSetupService.clickedAccount.next(item); // pass single object
        }
        this.accountSetupService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.accountSetupService.disabledItems.next(false);
        this.accountSetupService.disableGrid.next(false);
        this.accountSetupService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.accountSetupService.btnClick.next('');
      }
    });
  }

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.accountSetupService.disableGrid.next(false);
    this.accountSetupModel = {...this.accountSetupTemp};
    this.accountSetupService.disabledItems.next(false);
    this.accountSetupService.btnClick.next('');
    this.accountSetupService.ControlsEnableAndDisable.next(true);
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.accountSetupTemp = {...this.accountSetupModel};
    if(x =='N'){
      this.accountSetupModel = new AccountSetupModel();
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

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.accountSetupService.DeleteAccountSetup(this.accountSetupModel.companY_CODE)
    .subscribe(
      (updatedList: any[]) => {
        this.accountSetupService.GetAccountSetupList(1);
        this.accountSetupService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.accountSetupService.btnClick.next('')
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



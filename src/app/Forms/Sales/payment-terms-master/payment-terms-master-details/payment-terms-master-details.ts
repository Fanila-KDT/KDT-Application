import { Component } from '@angular/core';
import { PaymentTermsMasterModel } from '../../../../Model/PaymentTerms/payment-terms.model';
import { Subscription } from 'rxjs';
import { PaymentTermsMasterService } from '../../../../Service/PaymentTermsMasterService/payment-terms-service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CommonService } from '../../../../Service/CommonService/common-service';
import { EndPointService } from '../../../../Service/end-point.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'payment-terms-master-details',
  standalone: false,
  templateUrl: './payment-terms-master-details.html',
  styleUrls: ['./payment-terms-master-details.css','../../../common.css']
})
export class PaymentTermsMasterDetails {
  paymentTermsMasterModel: PaymentTermsMasterModel = new PaymentTermsMasterModel();
  paymentTermsMasterTemp: PaymentTermsMasterModel = new PaymentTermsMasterModel();
  subscription: Subscription[] = new Array<Subscription>();
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  btnType: string = '';
  isPaymentTermsInvalid: boolean = false;

  constructor( private paymentTermsMasterService: PaymentTermsMasterService, public alertService: AlertService, public commonService: CommonService, public endPointService: EndPointService) {
  
    this.subscription.push(this.paymentTermsMasterService.clickedPaymentTerms.subscribe(async x=>{
      if(!x){
        this.paymentTermsMasterModel =  new PaymentTermsMasterModel();
        return;
      }
      this.paymentTermsMasterService.ControlsEnableAndDisable.next(true);
      this.paymentTermsMasterModel = {...x};
    }));

    this.subscription.push(this.paymentTermsMasterService.btnClick.subscribe(async x=>{
        if(x != ''){
        this.btnClickFunction(x);
     }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.paymentTermsMasterService.disableGrid.next(false);
    this.paymentTermsMasterModel = new PaymentTermsMasterModel();
    this.paymentTermsMasterService.disabledItems.next(false);
    this.paymentTermsMasterService.btnClick.next('');
    this.paymentTermsMasterService.ControlsEnableAndDisable.next(true);
  }

  async btnClickFunction(x: string) {
    this.btnType = x;
    this.paymentTermsMasterTemp = {...this.paymentTermsMasterModel};
    if(x =='N'){
      this.paymentTermsMasterModel = new PaymentTermsMasterModel();
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

  async onSubmit(Form:any){
    const isValid = await this.validateForm(this.paymentTermsMasterModel);
    if (!isValid) {
      this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
      return;
    }
    this.paymentTermsMasterModel.companycode = this .endPointService.companycode;
    this.paymentTermsMasterService.SavePaymentTerms(this.paymentTermsMasterModel)
    .subscribe({
      next: async (response: any) => {
        if(this.btnType == 'N'){
          this.alertService.triggerAlert('Row saved successfully...', 4000, 'success');
        }else{
          this.alertService.triggerAlert('Row modified successfully...', 4000, 'success');
        }
        await this.paymentTermsMasterService.getPaymentTermsMasterList(2);
        let item: PaymentTermsMasterModel | undefined = this.paymentTermsMasterService.mainList.find(item => item.payterm_id === response.payterm_id);
        if (item) {
          await this.paymentTermsMasterService.loadList.next(this.paymentTermsMasterService.mainList);
          this.paymentTermsMasterService.clickedPaymentTerms.next(item); // pass single object
        }
        this.paymentTermsMasterService.btnClick.next('');
        this.saveDisable = true;
        this.cancelDisable = true;
        this.itemDisable = true;
        this.paymentTermsMasterService.disabledItems.next(false);
        this.paymentTermsMasterService.disableGrid.next(false);
        this.paymentTermsMasterService.ControlsEnableAndDisable.next(true);
      },
      error: (err) => {
        this.alertService.triggerAlert(err.error.message,4000, 'error');
        this.paymentTermsMasterService.btnClick.next('');
      }
    });
  }

  async validateForm(model: PaymentTermsMasterModel): Promise<boolean> {
    // Reset validation flags
    this.isPaymentTermsInvalid = !model.pay_term;
    const isValid = !(this.isPaymentTermsInvalid );
    return isValid;
  }

  cancelClickMethod(){
    this.itemDisable = true;
    this.saveDisable = true;
    this.cancelDisable = true;
    this.paymentTermsMasterService.disableGrid.next(false);
    this.paymentTermsMasterModel = {...this.paymentTermsMasterTemp};
    this.paymentTermsMasterService.disabledItems.next(false);
    this.paymentTermsMasterService.btnClick.next('');
    this.paymentTermsMasterService.ControlsEnableAndDisable.next(true);
    this.isPaymentTermsInvalid = false;
  }

  async onDelete(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;

    this.paymentTermsMasterService.DeletePaymentTerms(this.paymentTermsMasterModel.payterm_id)
    .subscribe(
      (updatedList: any[]) => {
        this.paymentTermsMasterService.getPaymentTermsMasterList(1);
        this.paymentTermsMasterService.btnClick.next('');
      },
      (error) => {
        this.alertService.triggerAlert('Failed to delete the Row...', 4000, 'error');
        this.paymentTermsMasterService.btnClick.next('')
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


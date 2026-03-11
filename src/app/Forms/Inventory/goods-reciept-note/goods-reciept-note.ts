import { ChangeDetectorRef, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { GRNModel, GRNModelModalSearch } from '../../../Model/RecieptEnry/reciept-enry.model';
import { App } from '../../../app';
import { RecieptEntryService } from '../../../Service/RecieptEntryService/reciept-entry-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../../Service/PurchaseOrderService/purchase-order-service';
import { EndPointService } from '../../../Service/end-point.services';
import { CommonService } from '../../../Service/CommonService/common-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-goods-reciept-note',
  standalone: false,
  templateUrl: './goods-reciept-note.html',
  styleUrls: ['./goods-reciept-note.css','../../common.css']
})
export class GoodsRecieptNote {
  yearDisable: boolean = false;
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  SVDisabled: boolean = false;
  subscription: Subscription[];
  showModalSearch: boolean = false;
  grnModelModalSearch:GRNModelModalSearch;
  years: any[] = [];
  year: number = new Date().getFullYear();
  ItemList: any[] = [];
  registerList: any[] = [];
  refNoList: any[] = [];
  localPoNoList: any[] = [];
  foreignPoNoList: any[] = [];
  gridDisabled: boolean = false;
  
  constructor(public app:App,public grnModelService:RecieptEntryService,public endPointService:EndPointService,private cdRef: ChangeDetectorRef,public alertService:AlertService,
    private purchaseOrderService:PurchaseOrderService,private accessService: UserAccessService, private commonService: CommonService) {
    this.subscription = new Array<Subscription>();
    this.grnModelModalSearch =  new GRNModelModalSearch();
    
    this.subscription.push(this.grnModelService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
      this.SVDisabled = data;
    }));

    const subs = [
      { obs: this.grnModelService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.grnModelService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.grnModelService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val },
      { obs: this.grnModelService.SVDisabled, setter: (val: boolean) => this.SVDisabled = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });

    this.getYear();

    this.subscription.push(this.grnModelService.registerList.subscribe(data=>{
      if(data != null){
        this.registerList = data;
      }
    }));

    this.subscription.push(this.grnModelService.refNoList.subscribe(data=>{
      if(data.length != 0){
        this.localPoNoList = data.filter((v:any) => v.register_code == 31);
        this.foreignPoNoList = data.filter((v:any) => v.register_code == 151);
      }
    }));
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  yearChange(event:any){
    sessionStorage.setItem('year',event);

    const match = this.years.find(y => y.period_id == event);
      if (match) {
        this.year = match.period_id; 
        sessionStorage.setItem('year',this.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
        sessionStorage.setItem('period_status',match.period_status.toString());
        sessionStorage.setItem('data_entry_status',match.data_entry_status.toString());
      }
    if(this.grnModelService.btnClick.value == ''){
      this.grnModelService.getGoodsRecieptList(event);
      this.cdRef.markForCheck();
      this.grnModelService
      .getRefNoListFull(this.endPointService.companycode, this.year)
      .then((response: any[]) => {
        this.grnModelService.refNoList.next(response);
      });

      this.cdRef.markForCheck();  
    }
  }

  getYear(){
    this.commonService.getYears().then(async(res: any) => {
      this.years = res;
      const currentYear = new Date().getFullYear();
      const match = this.years.find(y => y.period_name === currentYear);
      if (match) {
        this.year = match.period_id; // set to the matching GUID
        sessionStorage.setItem('year',this.year.toString());
        sessionStorage.setItem('period_from',match.period_from.toString());
        sessionStorage.setItem('period_to',match.period_to.toString());
        sessionStorage.setItem('currentYear',this.year.toString());
        sessionStorage.setItem('period_status',match.period_status.toString());
        sessionStorage.setItem('data_entry_status',match.data_entry_status.toString());
      }
    });
  }

  buttonClick(type: 'N' | 'M' | 'D') {
    if(type != 'D'){
      this.newDisable = true;
      this.modifyDisable = true;
      this.deleteDisable = true;
      this.searchDisable = true;
      this.yearDisable = true;
      this.SVDisabled = true;
      this.grnModelService.disableGrid.next(true);
    }
    this.grnModelService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true; 
  }

  modalCancel(){
    this.showModalSearch = false;
    this.grnModelModalSearch.register_code = null; 
    this.grnModelModalSearch.document_number = null;
  }

  modalSearch() {
     const model = {
      register_code: this.grnModelModalSearch.register_code,
      document_number: this.grnModelModalSearch.document_number,
      ref_grn_id: this.grnModelModalSearch.ref_grn_id
    };

    this.grnModelService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.grnModelModalSearch.register_code = null;
      this.grnModelModalSearch.document_number = null;
      this.grnModelModalSearch.ref_grn_id = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  onRegisterChange(register_code: any) {
    if(register_code == 31){
      this.refNoList = this.localPoNoList;
    } else if(register_code == 151){
      this.refNoList = this.foreignPoNoList;
    } 
  }

  Refresh(){
    this.grnModelService.ngOnInit.next(true);
    this.getYear();
  }

  StockVarification() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to send for stock verification?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, send it',
      cancelButtonText: 'No, cancel',
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false // important: prevents SweetAlert2 from overriding Bootstrap styles
    }).then((result) => {
      if (result.isConfirmed) {
        this.grnModelService.sendForStockVerification(this.grnModelService.selectedGRN).then(() => {
         this.alertService.triggerAlert('Sent for stock verification', 4000, 'success');
         this.grnModelService.approvalStatus.next('Stock Checking');
        }
        ).catch((error) => {
          console.error('Error while sending for stock verification:', error);
        });
      } 
    });
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.grnModelService.disableGrid.next(this.gridDisabled);
  }
}

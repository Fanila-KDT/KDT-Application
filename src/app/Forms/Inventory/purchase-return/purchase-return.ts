import { ChangeDetectorRef, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import {  GRNModelModalSearch } from '../../../Model/PurchaseReturn/purchase-return.model';
import { App } from '../../../app';
import { PurchaseReturnService } from '../../../Service/PurchaseReturnService/purchase-return-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { UserAccessService } from '../../../Service/AuthenticationService/user-access';
import { Router } from '@angular/router';
import { EndPointService } from '../../../Service/end-point.services';
import { CommonService } from '../../../Service/CommonService/common-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'purchase-return',
  standalone: false,
  templateUrl: './purchase-return.html',
  styleUrls: ['./purchase-return.css','../../common.css']
})
export class PurchaseReturn {
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
  grnNoList: any[] = [];
  localgrnNoList: any[] = [];
  foreigngrnNoList: any[] = [];
  gridDisabled: boolean = false; 
  showModalPrint: boolean = false;
  reportType: any = '2';
  
  constructor(private router: Router,public app:App,public purchasereturnModelService:PurchaseReturnService,public endPointService:EndPointService,private cdRef: ChangeDetectorRef,public alertService:AlertService,
    private accessService: UserAccessService, private commonService: CommonService) {
    this.subscription = new Array<Subscription>();
    this.grnModelModalSearch =  new GRNModelModalSearch();
    
    this.subscription.push(this.purchasereturnModelService.disabledItems.subscribe(data=>{
      this.newDisable = data;
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.searchDisable = data;
      this.yearDisable = data;
      this.SVDisabled = data;
    }));

    const subs = [
      { obs: this.purchasereturnModelService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.purchasereturnModelService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.purchasereturnModelService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val },
      { obs: this.purchasereturnModelService.SVDisabled, setter: (val: boolean) => this.SVDisabled = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });

    this.getYear();

    this.subscription.push(this.purchasereturnModelService.registerList.subscribe(data=>{
      if(data != null){
        this.registerList = data;
      }
    }));

    this.subscription.push(this.purchasereturnModelService.grnNoList.subscribe(data=>{
      if(data.length != 0){
        this.localgrnNoList = data.filter((v:any) => v.register_code == 31);
        this.foreigngrnNoList = data.filter((v:any) => v.register_code == 151);
      }
    }));
    this.cdRef.markForCheck();
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
    if(this.purchasereturnModelService.btnClick.value == ''){
      this.purchasereturnModelService.getPurchaseReturnList(event);
      this.cdRef.markForCheck();
      this.purchasereturnModelService
      .getGRNNoList(this.endPointService.companycode,0, this.year)
      .then((response: any[]) => {
        this.purchasereturnModelService.grnNoList.next(response);
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
      this.purchasereturnModelService.disableGrid.next(true);
    }
    this.purchasereturnModelService.btnClick.next(type);
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
      counter_vid: this.grnModelModalSearch.counter_vid
    };

    this.purchasereturnModelService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.grnModelModalSearch.register_code = null;
      this.grnModelModalSearch.document_number = null;
      this.grnModelModalSearch.counter_vid = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  onRegisterChange(register_code: any) {
    if(register_code == 41){
      this.grnNoList = this.localgrnNoList;
    } else if(register_code == 181){
      this.grnNoList = this.foreigngrnNoList;
    } 
  }

  Refresh(){
    this.purchasereturnModelService.ngOnInit.next(true);
    this.getYear();
  }

  print(){
    this.showModalPrint = true;
  }

  printReport(){
    const sID = this.router.routerState.root.firstChild?.snapshot.data['screenId']; //17
    let apiHostingURL = this.endPointService.ReportURL + 'Inventory?sID='+sID;
    let params = new URLSearchParams();

    params.append("reportType", this.reportType);
    params.append("voucher_id", this.purchasereturnModelService.item.voucher_id?? null);
    params.append("kdt_logo",  this.endPointService.Report_logo);

    const finalUrl = apiHostingURL + "&" + params.toString();
    window.open(finalUrl, "_blank");
    this.showModalPrint = false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.purchasereturnModelService.disableGrid.next(this.gridDisabled);
  }
}

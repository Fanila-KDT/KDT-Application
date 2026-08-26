import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomerMasterSearch } from '../../../Model/CustomerMaster/customer-master.model';
import { CustomerMasterService } from '../../../Service/CustomerMasterService/customer-master-service';
import { CommonService } from '../../../Service/CommonService/common-service';
import { AlertService } from '../../../shared/alert/alert.service';
import { App } from '../../../app';
import { Attachment } from '../../../Model/ReportModel/report-model.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'customer-master',
  standalone: false,
  templateUrl: './customer-master.html',
  styleUrls: ['./customer-master.css','../../common.css']
})
export class CustomerMaster {
  newDisable: boolean = false;
  modifyDisable: boolean = false;
  deleteDisable: boolean = false;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  customerMasterSearch:CustomerMasterSearch = new CustomerMasterSearch();
  subscription: Subscription[]= new Array<Subscription>();
  MarketList:any[]=[];
  CollectorList:any[]=[];
  AttachmentList: Attachment[] = [];

  constructor(public app:App,public customerMasterService:CustomerMasterService,private alertService:AlertService,public commonService:CommonService) {
      this.subscription.push(this.customerMasterService.disabledItems.subscribe(data=>{
      this.modifyDisable = data;
      this.deleteDisable = data;
      this.newDisable = data;
      this.searchDisable = data;
      this.refreshDisable = data;
    }));

    const subs = [
      { obs: this.customerMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.customerMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.customerMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  buttonClick(type: 'M' |'D'|'N') {
    if(type != 'D'){
      this.modifyDisable = true;
      this.searchDisable = true;
      this.deleteDisable = true;
      this.newDisable = true;
      this.refreshDisable = true;
      this.customerMasterService.disableGrid.next(true);
    }
    this.customerMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
    this.MarketList = this.customerMasterService.MarketList;
    this.CollectorList = this.customerMasterService.CollectorList;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.customerMasterSearch.cardno = null; 
    this.customerMasterSearch.name = null;
    this.customerMasterSearch.market_channel_name = null;
    this.customerMasterSearch.blacklist = null;
    this.customerMasterSearch.major_customer = null;
    this.customerMasterSearch.collector_id = null;
  }

  modalSearch(){
     const model = {
      cardno: this.customerMasterSearch.cardno,
      name: this.customerMasterSearch.name,
      market_channel_name: this.customerMasterSearch.market_channel_name,
      blacklist: this.customerMasterSearch.blacklist,
      major_customer: this.customerMasterSearch.major_customer,
      collector_id: this.customerMasterSearch.collector_id
    };

    this.customerMasterService.SearchList(model)
    .then(() => {
      this.showModalSearch = false;
      this.customerMasterSearch.cardno = null; 
      this.customerMasterSearch.name = null;
      this.customerMasterSearch.market_channel_name = null;
      this.customerMasterSearch.blacklist = null;
      this.customerMasterSearch.major_customer = null;
      this.customerMasterSearch.collector_id = null;
    })
    .catch(error => {
      console.error('Error while searching:', error);
    });
  }

  Refresh(){
    this.customerMasterService.ngOnInit.next(true);
    this.searchDisable =  false;
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.customerMasterService.disableGrid.next(this.gridDisabled);
  }

  previewUrls: { url: string | ArrayBuffer | null, type: string, name: string }[] = [];
  files: File[] = [];

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.files = Array.from(input.files);
    this.previewUrls = [];

    this.files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrls.push({ url: reader.result, type: file.type.split('/')[0], name: file.name });
      };
      reader.readAsDataURL(file);
    });
  }

 
}

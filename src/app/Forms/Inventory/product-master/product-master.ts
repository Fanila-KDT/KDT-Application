import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductMasterModelSearch } from '../../../Model/ProductMaster/product-master.model';
import { AlertService } from '../../../shared/alert/alert.service';
import { EndPointService } from '../../../Service/end-point.services';
import { PrevCodeSave } from '../../../Model/ProductMaster/product-master-save.model';
import { HttpResponse } from '@angular/common/http';
import { ProductMasterService } from '../../../Service/ProductMasterService/product-master-service';
import { App } from '../../../app';


@Component({
  selector: 'app-product-master-copy',
  standalone: false,
  templateUrl: './product-master.html',
  styleUrls: ['./product-master.css', '../../common.css']
})
export class ProductMaster {
 newDisable: boolean = true;
  modifyDisable: boolean = true;
  deleteDisable: boolean = true;
  searchDisable: boolean = false;
  refreshDisable: boolean = false;
  addPrevCodeDisable: boolean = false;
  AddPrevCodeList: boolean = false;
  showModalSearch: boolean = false;
  gridDisabled: boolean = false;
  gridDisable: boolean = true;
  showlist: boolean = false;
  ItemCode: string = '';
  NewItemCode: string = '';
  subscription: Subscription[];
  productMasterModelSearch:ProductMasterModelSearch;
  prevCodeSave:PrevCodeSave = new PrevCodeSave();

  constructor(public app:App,public productMasterService:ProductMasterService,private alertService:AlertService ,public endPointService:EndPointService) {
    this.productMasterModelSearch = new ProductMasterModelSearch();
    this.subscription = new Array<Subscription>();
    this.subscription.push(this.productMasterService.disabledItems.subscribe(data=>{
      this.newDisable = false;
      this.modifyDisable = false;
      this.deleteDisable = false;
      this.searchDisable = false;
      this.gridDisable = false;
    }));

     const subs = [
      { obs: this.productMasterService.newDisabled, setter: (val: boolean) => this.newDisable = val },
      { obs: this.productMasterService.editDisabled, setter: (val: boolean) => this.modifyDisable = val },
      { obs: this.productMasterService.deleteDisabled, setter: (val: boolean) => this.deleteDisable = val }
    ];

    subs.forEach(s => {
      this.subscription.push(s.obs.subscribe(s.setter));
    });
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  buttonClick(type: 'N' | 'M' | 'D') {
    if(type != 'D'){
      this.newDisable = true;
      this.modifyDisable = true;
      this.deleteDisable = true;
      this.searchDisable = true;
      this.gridDisable = true;
      this.productMasterService.disableGrid.next(true);
    }
    this.productMasterService.btnClick.next(type);
  }

  Search(){
    this.showModalSearch = true;
  }

  modalCancel(){
    this.showModalSearch = false;
    this.productMasterModelSearch.item_code = null; 
    this.productMasterModelSearch.item_name = null; 
    this.productMasterModelSearch.item_name_abbr = null; 
    this.productMasterModelSearch.category_name = null; 
    this.productMasterModelSearch.product_type = null; 
    this.productMasterModelSearch.brand_name = null; 
  }

  modalSearch(){
    try{
      this.productMasterService.SearchList(this.productMasterModelSearch)
      this.showModalSearch = false;
      this.productMasterModelSearch.item_code = null; 
      this.productMasterModelSearch.item_name = null; 
      this.productMasterModelSearch.item_name_abbr = null; 
      this.productMasterModelSearch.category_name = null; 
      this.productMasterModelSearch.product_type = null; 
      this.productMasterModelSearch.brand_name = null;
    }catch (error) {
      console.error('Error while search Item:', error);
      this.alertService.triggerAlert('Something went wrong while fetching Searching...',4000, 'error');
    }
  }

  Refresh(){
    this.productMasterService.ngOnInit.next(true); 
  }

  AddPrevCode(){
    this.prevCodeSave.prev_code=this.productMasterService.selectedItemCode;
    this.AddPrevCodeList = true;
  }

  PrevCodeListCancel(){
    this.AddPrevCodeList = false;
    this.NewItemCode='';
  }

  async PrevCodeListOk(){
    this.prevCodeSave.item_no = this.productMasterService.selectedItemNo;
    this.productMasterService.NewItemCode = this.NewItemCode;
    try{
      var response = await this.productMasterService.itemCodeCheck( this.NewItemCode);
      if(response == false){
        const prevCode = <HttpResponse<Object>>await this.productMasterService.prevCodeListSave(this.prevCodeSave,this.NewItemCode);
        const body = prevCode.body as PrevCodeSave | null;
        if (body) {
          this.productMasterService.pushprevCode.next(body);
          this.alertService.triggerAlert('Item Code Changed Successfully',3000,'success');
        }
        this.AddPrevCodeList = false;
        this.NewItemCode='';
      }else{
       this.alertService.triggerAlert('Item code is already exists. Please try again.', 4000, 'error');
      }
    }catch(error){
      console.error('Error while Changing Prev Code :', error);
      this.alertService.triggerAlert('Something went wrong . Please try again.',3000,'error');
    }
  }

  ShowList(){
    this.showlist = true;
  }

  accessorySearch(){
    try{
      var response = this.productMasterService.PendingAccessoryList(this.ItemCode);  
      this.showlist = false;  
      this.ItemCode='';
    }catch (error) {
      console.error('Error while Search Accessories:', error);
      this.alertService.triggerAlert('Error while Search Accessories',4000, 'error');
    }
  }

  accessorySearchCancel(){
    this.showlist = false;
    this.ItemCode='';
  }

  toggleValue(){
    this.gridDisabled = !this.gridDisabled; 
    this.productMasterService.disableGrid.next(this.gridDisabled);
  }
}

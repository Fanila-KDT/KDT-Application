import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MachineFeaturesList, ProductMasterModel } from '../../../../Model/ProductMaster/product-master.model';
import { Subscription } from 'rxjs';
import { EndPointService } from '../../../../Service/end-point.services';
import { AlertService } from '../../../../shared/alert/alert.service';
import { ProductMasterService } from '../../../../Service/ProductMasterService/product-master-service';
import { AccessoriesSave, BrandItems, ConsumableSave, PrevCodeSave, ProductClassItems, productMasterModelSave } from '../../../../Model/ProductMaster/product-master-save.model';
import { SelectionType } from '@swimlane/ngx-datatable';
import { HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { UserAccessService } from '../../../../Service/AuthenticationService/user-access';
  

@Component({
  selector: 'product-master-details',
  standalone: false,
  templateUrl: './product-master-details.html',
  styleUrls: ['./product-master-details.css','../../../common.css']
})
export class ProductMasterDetails{

  productMasterModel: ProductMasterModel;
  productMasterModelTemp:ProductMasterModel= new ProductMasterModel();
  machineFeaturesList: MachineFeaturesList = new MachineFeaturesList();
  productMasterModelSave: productMasterModelSave= new productMasterModelSave();
  machineFeaturesListTemp: MachineFeaturesList = new MachineFeaturesList();
  prevCodeSave: PrevCodeSave[] = [];
  prevCodeSaveTemp: PrevCodeSave[] = [];
  productClassItems:ProductClassItems= new ProductClassItems();
  brandItems:BrandItems= new BrandItems();
  subscription: Subscription[];
  SelectionType = SelectionType;
  itemDisable: boolean = true;
  saveDisable: boolean = true;
  cancelDisable: boolean = true;
  ShowProductClass: boolean = false;
  ShowAddBrand: boolean = false;
  showModalAccessory: boolean = false;
  showModalConsumable: boolean = false;
  scroll: boolean = true;
  reorderable = true;
  isEditable: boolean = true;
  isModelNameInvalid: boolean = false;
  isDescriptionInvalid: boolean = false;
  isProductClassInvalid: boolean = false;
  isWarrantyInvalid: boolean = false;
  isRetailRateInvalid: boolean = false;
  isFinalRateInvalid: boolean = false;
  isUnitInvalid: boolean = false;
  isProductColourInvalid: boolean = false;
  isProductYeildInvalid: boolean = false;
  isBinLocationInvalid: boolean = false;
  btnType: string='';
  filterText: string = '';
  public activeTabName: string = 'Product Details';
  GridHeight:number=384;
  controls = {
    pageSize:50
  };
  productClassList: any[] = [];
  departmentList: any[] = [];
  productColorList: any[] = [];
  brandList: any[] = [];
  unitList: any[] = [];
  productTypeList: string[] = [ 'OP', 'RGC'];
  AccessoryRows: any[] = []; 
  ConsumableRows: any[] = []; 
  AcessoryList:any[]=[];
  selected: any[] = [];
  accessory:AccessoriesSave[]=[];
  consumable:ConsumableSave[]=[];
  accessoryCompareArray:any[]=[];
  consumableCompareArray:any[]=[];
  modalListAccessory: any[] = [];
  modalListConsumable: any[] = [];
  itemCtegory: any;
  MainCategory: any;

  constructor(public productMasterService:ProductMasterService,public userAccessService:UserAccessService,private alertService: AlertService, 
              private cdRef: ChangeDetectorRef,public endPointService:EndPointService,private cdr: ChangeDetectorRef) {
    this.subscription = new Array<Subscription>();
    this.productMasterModel = new ProductMasterModel();

    this.subscription.push(this.productMasterService.clickedProduct.subscribe(async x=>{
      if (!x) {
        this.productMasterModel = new ProductMasterModel();
        this.machineFeaturesList = new MachineFeaturesList();
        this.AccessoryRows = [];
        this.ConsumableRows = [];
        this.prevCodeSave = [];
        this.cdRef.markForCheck();
        return;
      }
      this.productMasterService.selectedItemNo = x.item_no;
      this.productMasterService.selectedItemCode = x.item_code;
      await this.fetchingData(x);
    }));

    this.subscription.push(this.productMasterService.btnClick.subscribe(data => {
      if(data){
        this.productMasterModelTemp = {...this.productMasterModel};
        this.machineFeaturesListTemp = {...this.machineFeaturesList};
        this.prevCodeSaveTemp = [...this.prevCodeSave];
        if(data!='D'){
          this.btnType = data;
          this.itemDisable =false;
          this.isEditable = false;
          this.saveDisable =false;
          this.cancelDisable = false;
        }
        if(data=='N'){
          this.alertService.triggerAlert('Please ensure that the item does not already exist in the system before adding it.',7000, 'info');
          this.productMasterModel = new ProductMasterModel();
          this.machineFeaturesList = new MachineFeaturesList();
          this.prevCodeSave = [];
          this.AccessoryRows =  [];
          this.ConsumableRows =  [];
        }else if(data=='D'){
          this.DeleteMethod();
        }
      }
    }));

    this.subscription.push(this.productMasterService.pushprevCode.subscribe(data => {
      if(data.item_no){
        this.prevCodeSave.push(data);
        this.productMasterModel.item_code = this.productMasterService.NewItemCode;
      }
    }));

    this.subscription.push(this.productMasterService.cancelClick.subscribe(x=>{
      if(x){
        this.cancelClickMethod();
      }
    }));
  }


  async fetchingData(x: ProductMasterModel) {
    this.productMasterModel = { ...x };

    const result = await this.productMasterService.getMachineFeatureList(x.item_no);
    this.machineFeaturesList = (result && result.length > 0) ? result[0] : new MachineFeaturesList();

    const accresult = await this.productMasterService.getAssoceries(x.item_no);
    if (accresult && accresult.length > 0) {
      await this.AssignGrid(accresult);
    } else {
      this.AccessoryRows = [];
      this.ConsumableRows = [];
    }

    const prevresult = await this.productMasterService.getPrevCodeList(x.item_no);
    this.prevCodeSave = (prevresult && prevresult.length > 0) ? prevresult : [];
    
    this.cdRef.markForCheck(); // ✅ ensure UI refresh

  }


  async ngOnInit() {
    try {
      this.productClassList = await this.productMasterService.GetproductClassList();
      this.productColorList = await this.productMasterService.GetproductColorList(); 
      this.brandList = await this.productMasterService.GetBrandList();  
      this.unitList = await this.productMasterService.GetUnitList();  
    } catch (error) {
      console.error('Error while fetching Product Class List:', error);
      this.alertService.triggerAlert('Something went wrong while fetching Product Class List...',4000, 'error');
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  onRowSelectAcc(event: any) {
    console.log('Selected rows:', event.selected);
  }

  async onAddProductClass() {
    try {
      this.departmentList = await this.productMasterService.GetDepartmentList();
      this.ShowProductClass = true;
    } catch (error) {
      console.error('Error while fetching Department List:', error);
      this.alertService.triggerAlert('Error while fetching Department List. Please try again.', 3000, 'error');
    }
  }

  addProductClassCancel(){
    this.ShowProductClass = false;
    this.productClassItems.category_name = '';
    this.productClassItems.deptno = '';
  }

  addProductClassOk(){
    try{
      this.productClassItems.company_code=this.endPointService.companycode;
      var response = this.productMasterService.AddProductClass(this.productClassItems);  
      this.ShowProductClass = false;
      this.productClassItems.category_name = '';
      this.productClassItems.deptno = '';
      this.alertService.triggerAlert('New Product Class added successfully', 3000, 'success');
    }catch (error) {
      console.error('Error while Adding New Product Class:', error);
      this.alertService.triggerAlert('Error while Adding New Product Class',4000, 'error');
    }
  }

  onAddBrand(){
    this.ShowAddBrand = true;
  }

  addBrandCancel(){
    this.ShowAddBrand = false;
    this.brandItems.brand_name='';
  }

  addBrandOk(){
    try{
      this.brandItems.companycode = this.endPointService.companycode;
      var response = this.productMasterService.AddBrand(this.brandItems);  
      this.ShowAddBrand = false;  
      this.brandItems.brand_name=''; 
       this.alertService.triggerAlert('New Brand added successfully',4000, 'success');
    }catch (error) {
      console.error('Error while Adding New Brand:', error);
      this.alertService.triggerAlert('Error while Adding New Brand',4000, 'error');
    }
  }

  AssignGrid(data:any){
    let firstObj = data;
    let secondObj = this.productMasterService.mainList;
    const secondMap = Object.fromEntries(
      secondObj.map(item => [item.item_no, item])
    );
    // Merge and build thirdObj
    const thirdObj = firstObj.map((item:any, index:any) => {
      const match = secondMap[item.item_no] || {};
      return {
        ...item,
        item_code: match.item_code || null,
        item_name: match.item_name || null,
        item_no: match.item_no || null
      };
    });

    this.accessory = thirdObj
      .filter((item: any) => item.item_type === 'ACCESSORY')
      .map((item: any) => ({ ...item}));

    this.consumable = thirdObj
      .filter((item: any) => item.item_type === 'CONSUMABLE')
      .map((item: any) => ({ ...item}));

    this.accessoryCompareArray=[...this.accessory];
    this.AccessoryRows = [...this.accessory];
    this.consumableCompareArray=[...this.consumable];
    this.ConsumableRows = [...this.consumable];
  } 

  setActiveTab(name: string) {
    this.activeTabName = name;
    if(this.activeTabName=='Accessories'){
      this.AccessoryRows = [...this.AccessoryRows];
      this.selected = [this.AccessoryRows[0]];
    }else{
      this.ConsumableRows = [...this.ConsumableRows];
      this.selected = [this.ConsumableRows[0]];
    }
  }

  addRowAcc() {
  const mainList = (this.productMasterService.mainList || []).filter(item => item.item_category === 'ACCESSORY');
  const selectedItemNo = this.productMasterModel?.item_no;
  const existingItemNos = new Set(this.AccessoryRows.map(r => r.item_no));
  let modalItems: any[] = [];

  if (this.btnType === 'N') {
    modalItems = mainList.map(item => ({
      ...item,
      selected: existingItemNos.has(item.item_no) // pre-check if already in AccessoryRows
    }));
  } else if (this.btnType === 'M') {
    modalItems = mainList
      .filter(item => !existingItemNos.has(item.item_no) && item.item_no !== selectedItemNo)
      .map(item => ({
        ...item,
        selected: existingItemNos.has(item.item_no) // probably false due to filter but keep for safety
      }));
  }

  this.modalListAccessory = modalItems;
  this.showModalAccessory = true;
}


  modalOkAcc() {
    // Just close the modal, since AccessoryRows is already updated live
    this.showModalAccessory = false;
    this.filterText = '';
  }

  onCheckboxChangeAcc(item: any, event: any) {
    const checked = !!event.target.checked;
    item.selected = checked;

    if (checked) {
      // Add to AccessoryRows if not already exist
      const exists = this.AccessoryRows.some(r => r.item_no === item.item_no);
      if (!exists) {
        const newEntry = {
          item_no: item.item_no,
          quantity: 1,
          compulsory: false,
          m_item_no: item.m_item_no,
          item_type: 'ACCESSORY',
          item_name: item.item_name,
          item_code: item.item_code
        } as any;
        this.AccessoryRows.push(newEntry);

        // push a shallow copy to avoid binding original modal object accidentally
      }
    } else {
      // Remove from AccessoryRows when unchecked
      this.AccessoryRows = this.AccessoryRows.filter(r => r.item_no !== item.item_no);
    }
  }

  deleteRowAcc(index: number): void {
    const confirmed = confirm('Are you sure you want to delete this row?');
    if (!confirmed) return;
    const deletedItem = this.AccessoryRows[index];

    const exists = this.AccessoryRows.some(item => item.item_code === deletedItem.item_code);
    if (exists) {
      this.AccessoryRows.splice(index, 1);
    }
  }

  get filteredListAcc() {
    const list = Array.isArray(this.modalListAccessory) ? this.modalListAccessory : [];
    const q = (this.filterText || '').toString().trim().toLowerCase();

    if (!q) return list;

    return list.filter(item => {
      const code = (item?.item_code || '').toString().toLowerCase();
      const name = (item?.item_name || '').toString().toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }

  get selectedCountAcc(): number {
    return this.filteredListAcc.filter(item => !!item.selected).length;
  }

  addRowCon() {
    const mainList = (this.productMasterService.mainList || []).filter(item => item.item_category === 'CONSUMABLE');
    const selectedItemNo = this.productMasterModel?.item_no;
    const existingItemNos = new Set(this.ConsumableRows.map(r => r.item_no));
    let modalItems: any[] = [];

    if (this.btnType === 'N') {
      modalItems = mainList.map(item => ({
        ...item,
        selected: existingItemNos.has(item.item_no)
      }));
    } else if (this.btnType === 'M') {
      modalItems = mainList
        .filter(item => !existingItemNos.has(item.item_no) && item.item_no !== selectedItemNo)
        .map(item => ({
          ...item,
          selected: existingItemNos.has(item.item_no)
        }));
    }

    this.modalListConsumable = modalItems;
    this.showModalConsumable = true;
  }


  modalOkCon() {
    // Just close the modal, since ConsumableRows is already updated live
    this.showModalConsumable = false;
    this.filterText = '';
  }

  onCheckboxChangeCon(item: any, event: any) {
    const checked = !!event.target.checked;
    item.selected = checked;

    if (checked) {
      // Add to ConsumableRows if not already exist
      const exists = this.ConsumableRows.some(r => r.item_no === item.item_no);
      if (!exists) {
        const newEntry = {
          item_no: item.item_no,
          quantity: 1,
          compulsory: false,
          m_item_no: item.m_item_no,
          item_type: 'CONSUMABLE',
          item_name: item.item_name,
          item_code: item.item_code
        } as any;
        this.ConsumableRows.push(newEntry);

        // push a shallow copy to avoid binding original modal object accidentally
      }
    } else {
      // Remove from ConsumableRows when unchecked
      this.ConsumableRows = this.ConsumableRows.filter(r => r.item_no !== item.item_no);
    }
  }

  deleteRowCon(index: number): void {
    const confirmed = confirm('Are you sure you want to delete this row?');
    if (!confirmed) return;
    const deletedItem = this.ConsumableRows[index];

    const exists = this.ConsumableRows.some(item => item.item_code === deletedItem.item_code);
    if (exists) {
      this.ConsumableRows.splice(index, 1);
    }
  }

  get filteredListCon() {
    const list = Array.isArray(this.modalListConsumable) ? this.modalListConsumable : [];
    const q = (this.filterText || '').toString().trim().toLowerCase();

    if (!q) return list;

    return list.filter(item => {
      const code = (item?.item_code || '').toString().toLowerCase();
      const name = (item?.item_name || '').toString().toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }

  get selectedCountCon(): number {
    return this.filteredListCon.filter(item => !!item.selected).length;
  }

  onScrollChange(event: WheelEvent): void {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const fieldName = target.name; // or use target.id
    const step = 1;
    if(this.itemDisable == false){
      switch (fieldName) {
      case 'warranty':
        this.productMasterModel.warranty += event.deltaY < 0 ? step : -step;
        break;
      case 'retail_rate':
        this.productMasterModel.retail_rate += event.deltaY < 0 ? step : -step;
        break;
      case 'final_rate':
        this.productMasterModel.final_rate += event.deltaY < 0 ? step : -step;
        break;
      case 'product_yield':
        this.productMasterModel.product_yield += event.deltaY < 0 ? step : -step;
        break;
      case 'cost_price':
        this.productMasterModel.cost_price += event.deltaY < 0 ? step : -step;
        break;
      case 'avG_COST':
        this.productMasterModel.avG_COST += event.deltaY < 0 ? step : -step;
        break;
      case 'cpP_Bw':
        this.productMasterModel.cpP_Bw += event.deltaY < 0 ? step : -step;
        break;
      case 'cpP_Clr':
        this.productMasterModel.cpP_Clr += event.deltaY < 0 ? step : -step;
        break;
      case 'last_pur_rate':
        this.productMasterModel.last_pur_rate += event.deltaY < 0 ? step : -step;
        break;
      case 'fgn_last_pur_rate':
        this.productMasterModel.fgn_last_pur_rate += event.deltaY < 0 ? step : -step;
        break;
      case 'cpP_Bw_woc':
        this.productMasterModel.cpP_Bw_woc += event.deltaY < 0 ? step : -step;
        break;
      case 'cpP_Clr_woc':
        this.productMasterModel.cpP_Clr_woc += event.deltaY < 0 ? step : -step;
        break;
      }
      if (this.productMasterModel.warranty < 0) this.productMasterModel.warranty = 0;
      if (this.productMasterModel.retail_rate < 0) this.productMasterModel.retail_rate = 0;
      if (this.productMasterModel.final_rate < 0) this.productMasterModel.final_rate = 0;
      if (this.productMasterModel.product_yield < 0) this.productMasterModel.product_yield = 0;
      if (this.productMasterModel.cost_price < 0) this.productMasterModel.cost_price = 0;
      if (this.productMasterModel.avG_COST < 0) this.productMasterModel.avG_COST = 0;
      if (this.productMasterModel.cpP_Bw < 0) this.productMasterModel.cpP_Bw = 0;
      if (this.productMasterModel.cpP_Clr < 0) this.productMasterModel.cpP_Clr = 0;
      if (this.productMasterModel.last_pur_rate < 0) this.productMasterModel.last_pur_rate = 0;
      if (this.productMasterModel.fgn_last_pur_rate < 0) this.productMasterModel.fgn_last_pur_rate = 0;
      if (this.productMasterModel.cpP_Bw_woc < 0) this.productMasterModel.cpP_Bw_woc = 0;
      if (this.productMasterModel.cpP_Clr_woc < 0) this.productMasterModel.cpP_Clr_woc = 0;
    }
  }

  cancelClickMethod(){
    this.itemDisable =true;
    this.isEditable = true;
    this.saveDisable =true;
    this.cancelDisable = true;
    this.productMasterService.disableGrid.next(false);
    this.productMasterService.disabledItems.next(false);
    this.productMasterModel = {...this.productMasterModelTemp}
    this.machineFeaturesList = {...this.machineFeaturesListTemp}
    this.AccessoryRows = [...this.accessoryCompareArray];
    this.ConsumableRows = [...this.consumableCompareArray];
    this.prevCodeSave = [...this.prevCodeSaveTemp];
    this.btnType = 'C';
    this.isModelNameInvalid = false;
    this.isDescriptionInvalid = false;
    this.isProductClassInvalid = false;
    this.isWarrantyInvalid = false;
    this.isRetailRateInvalid = false;
    this.isFinalRateInvalid = false;
    this.isUnitInvalid = false;
    this.isProductColourInvalid = false;
    this.isProductYeildInvalid = false;
    this.isBinLocationInvalid = false;
    this.productMasterService.btnClick.next('');
    this.userAccessService.CheckUserAccess(this.productMasterService.FormName,this.productMasterService);
  }
  
  async onSubmit(ProductMasterForm:any){
    var response = false;
    if(this.productMasterModel.item_code != ''){
      if(this.btnType === 'N'){
        response = await this.productMasterService.itemCodeCheck(this.productMasterModel.item_code);
        this.productMasterModelSave.company_code = this.endPointService.companycode;
      }
      else{
        if(this.productMasterModel.item_code != this.productMasterService.selectedItemCode){
        response = await this.productMasterService.itemCodeCheck(this.productMasterModel.item_code);
        }
      }
    }

    if(response == false){
      const isValid = await this.validateForm(this.productMasterModel);
      if (!isValid) {
        this.alertService.triggerAlert('Please fill all required fields.', 4000, 'error');
        return;
      }
      this.AssignValueProductMaster();
      if(this.btnType === 'N')
      {
        const item_No = await this.productMasterService.getItemNo();
        this.productMasterModelSave.item_no = item_No.value;
        this.machineFeaturesList.item_no = item_No.value;
        this.AcessoryList.forEach(item => {
          item.m_item_no = item_No.value;
        });
      
      }if(this.btnType === 'M'){
        this.machineFeaturesList.item_no = this.productMasterModelSave.item_no;
        this.AcessoryList.forEach(item => {
          item.m_item_no = this.productMasterModelSave.item_no;
        });
      }
    
      this.productMasterService.SaveProductMaster(this.productMasterModelSave,this.machineFeaturesList,this.AcessoryList).then((res: any) => {
        if (res && res.productMaster) {
          if(this.btnType === 'N'){
            this.productMasterService.addRowAfterSave.next(res.productMaster);
            this.alertService.triggerAlert('Item Saved Successfully.', 4000, 'success');
          }
          if(this.btnType === 'M'){
            this.productMasterService.addRowAfterModify.next(res.productMaster);
            this.alertService.triggerAlert('Item Modified Successfully.', 4000, 'success');
          }
          this.productMasterModel = {...res.productMaster};
          this.machineFeaturesList = {...res.machineFeatures};
          this.AssignGrid(res.accessoryList);
        }
        this.itemDisable = true;
        this.saveDisable = true;
        this.cancelDisable = true;
        this.isEditable = true;
        this.productMasterService.disableGrid.next(false);
        this.productMasterService.disabledItems.next(false);
        this.productMasterService.btnClick.next('');
        this.userAccessService.CheckUserAccess(this.productMasterService.FormName,this.productMasterService);
      }).catch(error => {
        console.error('SaveAccountMaster error:', error);
        this.alertService.triggerAlert('Failed to save account. Please try again.', 4000, 'error');
        this.productMasterService.btnClick.next('')
      });
    }else{
       this.alertService.triggerAlert('Item code is already exists. Please try again.', 4000, 'error');
    }
  }

  AssignValueProductMaster(){
    const { category_name,brand_name, ...rest } = this.productMasterModel;
    this.productMasterModelSave = { ...rest };
    this.productMasterModelSave.item_category = this.itemCtegory;
    this.AcessoryList = [...this.AccessoryRows,...this.ConsumableRows];
  }

  async DeleteMethod(){
    const confirmed = await showconfirm("Are you sure you want to delete this item?");
    if(!confirmed)return;
    try{
      var response = await this.productMasterService.deleteCheck(this.productMasterModel.item_no);
      if(response==false){
        await this.productMasterService.deleteProductMasterDetails(this.productMasterModel);
        this.productMasterService.getProductMasterList();
        this.alertService.triggerAlert('Item deleted Successfully',6000, 'success');
        this.productMasterService.btnClick.next('')
      }else{
        this.alertService.triggerAlert('Action Blocked! Product is assigned as an accessory to other items',6000, 'error');
        this.productMasterService.btnClick.next('')
      }
     
    } catch (error) {
      console.error('Error while deleting Item:', error);
      this.alertService.triggerAlert('Something went wrong while Deleting...',4000, 'error');
      this.productMasterService.btnClick.next('')
    }
    
  }

  async validateForm(model: ProductMasterModel): Promise<boolean> {
    // Reset all flags
    this.isModelNameInvalid = !model.item_name_abbr?.trim();
    this.isDescriptionInvalid = !model.item_name?.trim();
    this.isProductClassInvalid = !model.category_code;
    this.isUnitInvalid = !model.unitid;

    // Conditional flags based on tag_item
    this.isWarrantyInvalid = false;
    this.isRetailRateInvalid = false;
    this.isFinalRateInvalid = false;

    if (model.tag_item) {
      this.isWarrantyInvalid = !model.warranty;
      this.isRetailRateInvalid = !model.retail_rate;
      this.isFinalRateInvalid = !model.final_rate;
    }

    // Category-based validations
    this.isProductColourInvalid = false;
    this.isProductYeildInvalid = false;
    this.isBinLocationInvalid = false;

    if (model.category_code) {
      try {
        const res = await this.productMasterService.getItemCategory(model.category_code, model.tag_item);
        this.itemCtegory = res.itemCategory;
        this.MainCategory = res.mainCategory;

        if (['CONSUMABLE', 'SERVICE CONSUMABLES'].includes(this.itemCtegory)) {
          this.isProductColourInvalid = !model.type_id;
          this.isProductYeildInvalid = !model.product_yield;
        }

        if (this.itemCtegory === 'SPARE PARTS') {
          this.isBinLocationInvalid = !model.bin_location?.trim();
        }

        if (this.MainCategory === 'OIL & GAS' && model.service_item === 0) {
          this.isProductYeildInvalid = !model.product_yield;
        }
      } catch (error) {
        console.error('Error fetching category details:', error);
        return false;
      }
    }

    // Final validity check
    const isValid = !(
      this.isModelNameInvalid ||
      this.isDescriptionInvalid ||
      this.isProductClassInvalid ||
      this.isUnitInvalid ||
      this.isWarrantyInvalid ||
      this.isRetailRateInvalid ||
      this.isFinalRateInvalid ||
      this.isProductColourInvalid ||
      this.isProductYeildInvalid ||
      this.isBinLocationInvalid
    );

    return isValid;
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

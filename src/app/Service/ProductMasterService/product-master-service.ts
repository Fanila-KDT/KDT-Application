import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { BrandList, departmentList, MachineFeaturesList, ProductClassList, ProductColorList, ProductMasterModel, ProductMasterModelSearch, UnitList } from '../../Model/ProductMaster/product-master.model';
import { ProductMasterEndpointService } from './product-master.end-point.service';
import { AccessoriesSave, BrandItems, PrevCodeSave, ProductClassItems, productMasterModelSave } from '../../Model/ProductMaster/product-master-save.model';

@Injectable({
  providedIn: 'root'
})
export class ProductMasterService {
  public clickedProduct = new BehaviorSubject<ProductMasterModel>(new ProductMasterModel()) ;
  public addRowAfterSave = new BehaviorSubject<ProductMasterModel>(new ProductMasterModel()) ;
  public addRowAfterModify = new BehaviorSubject<ProductMasterModel>(new ProductMasterModel()) ;
  
  public pushprevCode= new BehaviorSubject<PrevCodeSave>(new PrevCodeSave()) ;
  public loadList = new BehaviorSubject<ProductMasterModel[]>([]);
  public productClassList = new BehaviorSubject<ProductClassList[]>([]);
  public mainList:ProductMasterModel[]=[];    

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(true);
  public isLoading = new BehaviorSubject<boolean>(false);
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');

  selectedItemNo:string="";
  selectedItemCode:string="";
  NewItemCode: string='';
  FormName='PRODUCT_MASTER';
  constructor(private httpClient:HttpClient, private endpointService: ProductMasterEndpointService,private alertService:AlertService) { }

  async getProductMasterList(){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<ProductMasterModel[]>(this.endpointService.getList)
      );
      this.mainList = res;
      this.loadList.next(res);
      this.clickedProduct.next(res[0]);

      return res; // ✅ Return the response
    } catch (error) {
      console.error('getParametersList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

  async GetproductClassList(): Promise<ProductClassList[]> {
    const message = 'Something went wrong while getting Product Class List. Please try again.';
    try {
      return await lastValueFrom(
        this.httpClient.get<ProductClassList[]>(this.endpointService.getproductClassList)
      );
    } catch (error) {
      console.error('GetproductClassList:', error);
      this.alertService.triggerAlert(message, 4000, 'error');
      throw error; // rethrow so component can handle it
    }
  }

  async GetproductColorList(): Promise<ProductColorList[]> {
    const message = 'Something went wrong while getting Product Colour List. Please try again.';
    try {
      return await lastValueFrom(
        this.httpClient.get<ProductColorList[]>(this.endpointService.getproductColorList)
      );
    } catch (error) {
      console.error('GetproductColorList:', error);
      this.alertService.triggerAlert(message, 4000, 'error');
      throw error; // rethrow so component can handle it
    }
  }

  async GetBrandList(): Promise<BrandList[]> {
    let message='Something went wrong while Getting Brand List. Please try again.';
    try{
       return await lastValueFrom(
        this.httpClient.get<BrandList[]>(this.endpointService.getBrandList)
      );
    }catch (error) {
      console.error('GetBrandList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async GetUnitList(): Promise<UnitList[]>{
    let message='Something went wrong while Getting Unit List. Please try again.';
    try{
       return await lastValueFrom(
        this.httpClient.get<UnitList[]>(this.endpointService.getUnitList)
      );
    }catch (error) {
      console.error('GetUnitList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async GetDepartmentList(): Promise<departmentList[]> {
    const message = 'Something went wrong while getting Department List. Please try again.';
    
    try {
      const res = await lastValueFrom(
        this.httpClient.get<departmentList[]>(this.endpointService.GetDepartmentList)
      );
      return res;
    } catch (error) {
      console.error('GetDepartmentList:', error);
      this.alertService.triggerAlert(message, 4000, 'error');
      throw error; // rethrow so component can handle it
    }
  }

  async AddProductClass(productClassItems:ProductClassItems){
  try{
      const response = await this.httpClient
      .post<ProductClassItems>(this.endpointService.AddProductClass ,productClassItems, { observe: 'response' })
      .toPromise();
      if (!response) {
        throw new Error('No response received from server');
      }
      let message='Product Class added successfully...';
      this.alertService.triggerAlert(message,4000, 'success');
      return response;
    }catch (error) {
      console.error('AddProductClass : ', error);
      let message='Something went wrong while  Adding New Product Class. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
      return null;
    }
  }

  async AddBrand(brandItems:BrandItems){
  try{
      const response = await this.httpClient
      .post<BrandItems>(this.endpointService.AddBrand ,brandItems, { observe: 'response' })
      .toPromise();
      if (!response) {
        throw new Error('No response received from server');
      }
      let message='Brand added successfully...';
      this.alertService.triggerAlert(message,4000, 'success');
      return response;
    }catch (error) {
      console.error('AddBrand : ', error);
      let message='Something went wrong while  Adding New Brand. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
      return null;
    }
  }

  async getMachineFeatureList(item_no: any): Promise<MachineFeaturesList[]> {
    if(item_no != ''){
      try {
        const url = `${this.endpointService.getMachinefeatureList}/${item_no}`;
        return await firstValueFrom(this.httpClient.get<MachineFeaturesList[]>(url));
      } catch (error: any) {
        console.error('getMachineFeatureList:', error);
        const message = error?.error?.text || 'Something went wrong while fetching machine features. Please try again.';
        this.alertService.triggerAlert(message, 4000, 'error');
        return []; // Return empty object to maintain type
      }
    }
    return [];
  }

  async getAssoceries(item_no: any): Promise<AccessoriesSave[]>  {
    if(item_no != ''){
      try {
        const url = `${this.endpointService.getAssoceriesList}/${item_no}`;
        return await firstValueFrom(this.httpClient.get<AccessoriesSave[]>(url));
      } catch (error: any) {
        console.error('getAssoceries:', error);
        const message = error?.error?.text || 'Something went wrong while fetching Accessories/Consumable Data. Please try again.';
        this.alertService.triggerAlert(message, 4000, 'error');
        return []; // Return empty object to maintain type
      }
    }
    return [];
  }

    async getPrevCodeList(item_no: any): Promise<PrevCodeSave[]>  {
    if(item_no != ''){
      try {
        const url = `${this.endpointService.getPrevCodeList}/${item_no}`;
        return await firstValueFrom(this.httpClient.get<PrevCodeSave[]>(url));
      } catch (error: any) {
        console.error('getPrevCodeList:', error);
        const message = error?.error?.text || 'Something went wrong while fetching Previous Code Data. Please try again.';
        this.alertService.triggerAlert(message, 4000, 'error');
        return []; // Return empty object to maintain type
      }
    }
    return [];
  }

  async prevCodeListSave(prevCodeSave: PrevCodeSave,newitemcode:any): Promise<HttpResponse<PrevCodeSave>|null> {
    try{
      const response = await this.httpClient
      .put<PrevCodeSave>(this.endpointService.prevCodeListSave +'/'+ newitemcode, prevCodeSave, { observe: 'response' })
      .toPromise();
      if (!response) {
        throw new Error('No response received from server');
      }
      return response;
    }catch (error) {
      console.error('prevCodeListSave : ', error);
      let message='Something went wrong while Changing ItemCode. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
      return null;
    }
  }
  
  async PendingAccessoryList(item_code:any){
    try{
      this.httpClient.get<ProductMasterModel[]>(this.endpointService.pendingAccessoryList +'/'+item_code).subscribe({
      next: res => {
        //this.mainList =res;
        this.loadList.next(res);
        this.clickedProduct.next(res[0]);
      },
      error: err =>{
        console.log(err);
          this.alertService.triggerAlert(err.error.text,4000, 'error');
      } 
      });
    }catch (error) {
      console.error('PendingAccessoryList : ', error);
      let message='Something went wrong while Fetching Master Items. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  SearchList(searchList: ProductMasterModelSearch) {
    let message='Something went wrong while Fetching Search Items. Please try again.';
    try{
      const params = new HttpParams({ fromObject: { ...searchList } });
      this.httpClient.get<ProductMasterModel[]>(this.endpointService.getSearchList, { params }).subscribe({
        next: res => {
        this.mainList =res;
        this.loadList.next(res);
        this.clickedProduct.next(res[0]);
        },
        error: err =>{ console.log(err), this.alertService.triggerAlert(message,4000, 'error');}
      });
    }catch (error) {
      console.error('SearchList : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async getItemNo(): Promise<any> {
    try{
      const itemNo = await this.httpClient.get<any>(this.endpointService.getItemNo).toPromise();
      return itemNo; 
    }catch (error) {
      console.error('getItemNo : ', error);
      let message='Something went wrong while Get ItemNo. Please try again';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async getItemCategory(category_code: any, tag_item: any): Promise<any> {
    let message='Something went wrong while Fetching Item Category. Please try again.';
    try {
      const params = {
        category_code: category_code,
        tag_item: tag_item
      };
       const itemNo =  this.httpClient.get<any>(this.endpointService.getItemCategory, { params }).toPromise();
        return itemNo; 
       
    } catch (error) {
      console.error('getItemCategory : ', error);
      const message = 'Something went wrong while getting ItemCategory. Please try again';
      this.alertService.triggerAlert(message, 4000, 'error');
    }
  }

  async SaveProductMaster(productMasterModelSave: productMasterModelSave,machineFeaturesList:MachineFeaturesList,AcessoryList:any): Promise<any> {  
    try {
      const payload = {
        ProductMasterSave: productMasterModelSave,
        MachineFeatures: machineFeaturesList,
        AccessoryList:AcessoryList,
      };
      const res = await firstValueFrom(
        this.httpClient.post<any>(this.endpointService.SaveProductMaster, payload)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('SaveProductMaster : ', error);
      const message = 'Something went wrong while Saving Product Master. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return null; // Return null on error
    }   
  }

  async itemCodeCheck(item_no:any): Promise<any> {
    try{
      const ranNo = await this.httpClient.get<any>(this.endpointService.itemCodeCheck+'/'+ item_no).toPromise();
      return ranNo;
    }catch (error) {
      console.error('itemCodeCheck : ', error);
      let message='Item code already present. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async deleteCheck(item_no:any): Promise<any> {
    try{
      const ranNo = await this.httpClient.get<any>(this.endpointService.deleteCheck+'/'+ item_no).toPromise();
      return ranNo;
    }catch (error) {
      console.error('deleteCheck : ', error);
      let message='Something went wrong while Check Accessory/consumable item. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async deleteProductMasterDetails(productMasterModel:  ProductMasterModel){
    try{
    const response = await this.httpClient.delete<any>(this.endpointService.Delete +'/'+ productMasterModel.item_no).toPromise();
      if (!response) {
        throw new Error('No response received from server');
      }
      return response;      
    }catch (error) {
      console.error('deleteProductMasterDetails : ', error);
      let message='Something went wrong while Deleting. Please try again.';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }
}

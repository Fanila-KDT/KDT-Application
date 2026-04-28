import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { CommonEndpointService } from './common-end-point.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  username: string = '';
  ItemList: any[] = [];
  ItemListNew: any[] = [];

  public isSystemAdmin = new BehaviorSubject<boolean>(false);
  constructor(private httpClient:HttpClient, public endpointService: CommonEndpointService,private alertService:AlertService) { }

  async GetGuid(): Promise<any> {
    try{
      const itemNo = await this.httpClient.get<any>(this.endpointService.GetGuid).toPromise();
      return itemNo; 
    }catch (error) {
      console.error('GetGuid : ', error);
      let message='Something went wrong while Get ItemNo. Please try again';
      this.alertService.triggerAlert(message,4000, 'error');
    }
  }

  async getYears(): Promise<any[]>{
    let message='Something went wrong while Getting Years List. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetYears)
      );
    }catch (error) {
      console.error('GetYears : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async getFullWarehouseList(companycode: number): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetFullWarehouseList +'/'+ companycode)
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('GetFullWarehouseList : ', error);
      const message = 'Something went wrong while Fetching Full Warehouse List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getItemList(): Promise<any[]>{
    let message='Something went wrong while Getting Item List. Please try again.';
    try{
        const res = await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetItemList)
      );
      // Save ItemList to sessionStorage
      sessionStorage.setItem('ItemList', JSON.stringify(res));

      this.ItemList = res;
      return res;
    }catch (error) {
      console.error('GetItemList : ', error);
      //this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }

  async getItemListNew(): Promise<any[]>{
    let message='Something went wrong while Getting Item List. Please try again.';
    try{
        const res =  await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getItemListNew)
      );
      sessionStorage.setItem('ItemListNew', JSON.stringify(res));
      this.ItemListNew = res;
      return res;
    }catch (error) {
      console.error('getItemListNew : ', error);
      //this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }


  
}

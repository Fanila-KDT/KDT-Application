import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import { ReportEndpointService } from './report.end-point.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  FormName='WAREHOUSE_MASTER';

  constructor(private httpClient:HttpClient, private endpointService: ReportEndpointService,private alertService:AlertService) { }

  async getMainCategoryList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getMainCategoryList )
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getMainCategoryList : ', error);
      const message = 'Something went wrong while Fetching Full Main Category List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getRegisterList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getRegisterList )
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getRegisterList : ', error);
      const message = 'Something went wrong while Fetching Full Register List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getVendorList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getVendorList )
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getVendorList : ', error);
      const message = 'Something went wrong while Fetching Full Vendor List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }

  async getSubCategoryList(main_category_codes: string[]): Promise<any[]> {
    try {
      const params = { ids: main_category_codes };
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getSubCategoryList, { params })
      );
      return res;
    } catch (error) {
      console.error('getSubCategoryList : ', error);
      this.alertService.triggerAlert('Something went wrong while Fetching Sub category List. Please try again.', 4000, 'error');
      return [];
    }
  }

  async getCategoryList(deptno: string[]): Promise<any[]> {
    try {
      const params = { ids: deptno };
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getCategoryList, { params })
      );
      return res;
    } catch (error) {
      console.error('getCategoryList : ', error);
      this.alertService.triggerAlert('Something went wrong while Fetching Category List. Please try again.', 4000, 'error');
      return [];
    }
  }
  
 async getBrandList(): Promise<any[]> {
    try {
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.getBrandList )
      );
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getBrandList : ', error);
      const message = 'Something went wrong while Fetching Full Main Category List. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    } 
  }
}

import { Injectable } from "@angular/core";
import { DeliveryNoteModel,DeliveryNoteSearch } from "../../Model/DeliveryNote/delivery-note.model";
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AlertService } from "../../shared/alert/alert.service";
import { DateModelSales } from "../../Model/CommonModel";
import { DeliveryNoteEndpointService } from "./delivery-note.end-point.service";

@Injectable({
  providedIn: 'root'
})
export class DeliveryNoteService {
  public mainList:DeliveryNoteModel[]=[];  
  public loadList = new BehaviorSubject<DeliveryNoteModel[]>([]);

  public clickedDeliveryNote = new BehaviorSubject<DeliveryNoteModel>(new DeliveryNoteModel()) ;  

  public disableGrid = new BehaviorSubject<boolean>(false);
  public disabledItems = new BehaviorSubject<boolean>(false);
  public isLoading = new BehaviorSubject<boolean>(false);
  public btnClick = new BehaviorSubject<string>('');
  public ngOnInit = new BehaviorSubject<boolean>(false);
  public cancelClick = new BehaviorSubject<boolean>(false);
  public newDisabled = new BehaviorSubject<boolean>(false);
  public editDisabled = new BehaviorSubject<boolean>(false);
  public deleteDisabled = new BehaviorSubject<boolean>(false);
  public changeStatus = new BehaviorSubject<boolean>(false);
  public ControlsEnableAndDisable = new BehaviorSubject<boolean>(false);
  public Status = new BehaviorSubject<[string, string]>(['', '']);
  FormName='DELIVERY_NOTE';
  PaymentTypeList: any[] =[];
  Approved:any;
  voucher_id:any;
  approval_status:any;
  
  constructor(private httpClient:HttpClient, private endpointService: DeliveryNoteEndpointService,private alertService:AlertService) { }
  
  async getDeliveryNoteList(year:any,status:any){
    try {
      const res = await firstValueFrom(
        this.httpClient.get<DeliveryNoteModel[]>(this.endpointService.GetDeliveryNoteList + '/' + year )
      );
      this.mainList = res;
      if(status == 1){
        this.loadList.next(res);
        this.clickedDeliveryNote.next(res[0]); 
      }
      return res; // ✅ Return the response
    } catch (error) {
      console.error('getDeliveryNoteList : ', error);
      const message = 'Something went wrong while Fetching Main Grid Items. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Return empty array on error
    }
  }

    async GetDeliveryNoteDetails(voucher_id: any): Promise<any[]> {
    try {
      if (!voucher_id) {
        return []; // Return empty array if voucher_id is not provided
      }
      const res = await firstValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetDeliveryNoteDetails +'/'+voucher_id)
      );
      return res;
    } catch (error: any) {
      console.error('GetDeliveryNoteDetails : ', error);
      const message = 'Something went wrong while Fetching Delivery Note Details. Please try again.';
      this.alertService.triggerAlert(message, 4000, 'error');
      return []; // Ensure function always returns an array
    }
  }

  async GetTagDetails(): Promise<any[]> {
    let message='Something went wrong while Getting Tag Details. Please try again.';
    try{
        return await lastValueFrom(
        this.httpClient.get<any[]>(this.endpointService.GetTagDetails)
      );
    }catch (error) {
      console.error('GetTagDetails : ', error);
      this.alertService.triggerAlert(message,4000, 'error');
      throw error;
    }
  }
}

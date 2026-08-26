import { Injectable } from '@angular/core';
import { EndPointService } from '../end-point.services';

@Injectable({
  providedIn: 'root'
})
export class DeliveryNoteEndpointService {
  GetDeliveryNoteList
  GetDeliveryNoteDetails
  GetTagDetails

  constructor(endpoint: EndPointService) {
    //Basic URL
    let apiHostingURL = endpoint.apiHostingURL+ "api/DeliveryNote";
    
    this.GetDeliveryNoteList = apiHostingURL+ "/GetDeliveryNoteList";
    this.GetDeliveryNoteDetails = apiHostingURL+ "/GetDeliveryNoteDetails";
    this.GetTagDetails = apiHostingURL+ "/GetTagDetails";
  }
}
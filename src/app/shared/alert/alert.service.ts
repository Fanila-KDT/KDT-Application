import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  public alertSubject = new BehaviorSubject<any>("");

  constructor() {}

  triggerAlert(message: string,duration:number, type: 'success' | 'error' | 'info' = 'info') {
    this.alertSubject.next([message,duration,type]);
  }
}

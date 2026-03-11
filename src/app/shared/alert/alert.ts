import { Component, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from './alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.html',
  styleUrl: './alert.css',
  encapsulation: ViewEncapsulation.None
})
export class Alert {

 subscription: Subscription[];

  constructor(private snackBar: MatSnackBar,private alertService:AlertService) {
    this.subscription = new Array<Subscription>();
    this.subscription.push(this.alertService.alertSubject.subscribe(message => {
      if(message){
      this.showAlert(message[0],message[1],message[2]);
      }
    }));
  }

  showAlert(message: string, duration: number = 3000, type: 'success' | 'error' | 'info' = 'info') {
    this.snackBar.open(message, '✖', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`custom-snackbar`, `snackbar-${type}`]
    });
  }
}
//this.alertService.triggerAlert('Saved successfully!', 3000, 'success'); -- for Sucess
//this.alertService.triggerAlert('Something went wrong!', 4000, 'error'); -- for error
//this.alertService.triggerAlert('Send for approval', 4000, 'info'); -- for normal

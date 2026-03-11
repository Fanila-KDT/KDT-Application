import {Injectable} from '@angular/core';

declare var $: any;

@Injectable()
export class NotificationService {

  constructor() {
  }

  smallBox(data:any, cb?:any) {
    $.smallBox(data, cb)
  }

  bigBox(data:any, cb?:any) {
    $.bigBox(data, cb)
  }

  smartMessageBox(data:any, cb?:any) {
    $.SmartMessageBox(data, cb)
  }

    
  smallMessageBox(title: string, msg: string, Success: boolean) {
    let msgColor = "";
    let iconText = "";

    if (Success) {
      msgColor = "#659265";
     iconText = "fa fa-check fa-2x fadeInRight animate";

    } else {
      msgColor = "#C46A69";
      iconText="fa fa-times fa-2x fadeInRight animated";
    }

    let data = {
      title: title,
      content: "<i class='fa fa-clock-o'></i> <i>" + msg + "</i>",
      color: msgColor,
      iconSmall: iconText,
      timeout: 4000
    }
    this.smallBox(data);
  }

  SmallNotification(title: string, msg: string, Success: boolean, time: number) {
    let msgColor = "";
    let iconText = "";
    
    if (Success) {
      msgColor = "#659265";
      iconText = "fa fa-check fa-2x fadeInRight animate";
    } else {
      msgColor = "#C46A69";
      iconText="fa fa-times fa-2x fadeInRight animated";
    }

    let data = { title: title,
      content: "<i class='fa fa-clock-o'></i> <i>" + msg + "</i>",
      color: msgColor, iconSmall: iconText, timeout: time
    }

    this.smallBox(data);
  }
  
 /**/
 MessageBox(title: string, content: string, buttons: string, cb?:any) {
  let data = {title: title, content: content, buttons: buttons }
  this.smartMessageBox(data, cb);
}



 /* New Smart notofication */
  NotifySuccess(msg: string, msg2: string = " ", title: string = "Success", time: number=1000) {  
    const msgColor = "#659265";
    const iconText = "fa fa-check fa-2x fadeInRight animate";
     let data = { title: title,
       content: "<i class='fa fa-clock-o'></i> <i>" + msg + "</i><br>" + msg2,
       color: msgColor, iconSmall: iconText, timeout: time
     }
     this.smallBox(data);
   }
 
  NotifyWarning(msg: string, msg2: string=" ", title: string="Warning", time: number=1500) {  
    const msgColor = "#c79121";
    const iconText = "fa fa-check fa-2x fadeInRight animate";
     let data = { title: title,
       content: "<i class='fa fa-clock-o'></i> <i>" + msg + "</i><br>" + msg2,
       color: msgColor, iconSmall: iconText, timeout: time
     }
     this.smallBox(data);
  }

  NotifyError(msg: string, msg2: string=" ", title: string="Error", time: number=4000) {  
     const msgColor = "#C46A69";
     const iconText = "fa fa-check fa-2x fadeInRight animate";
      let data = { title: title,
        content: "<i class='fa fa-clock-o'></i> <i>" + msg + "</i><br>" + msg2,
        color: msgColor, iconSmall: iconText, timeout: time
      }
      this.smallBox(data);
   }

  NotifyNoItemFound(msg2: string=" ", time: number=1000) {  
    const msgColor = "#C46A69";
    const iconText = "fa fa-check fa-2x fadeInRight animate";
     let data = { title: "Error",
       content: "<i class='fa fa-clock-o'></i> <i>No Item Found...</i><br>" + msg2,
       color: msgColor, iconSmall: iconText, timeout: time
     }
     this.smallBox(data);
  }

  NotifyCancelled(msg: string = "You Cancelled this Operation...", time: number=1500) {  
    const msgColor = "#17a2b8";
    const iconText = "fa fa-check fa-2x fadeInRight animate";
     let data = { title: "Cancelled",
       content: "<i class='fa fa-clock-o'></i> <i>" + msg + "</i>",
       color: msgColor, iconSmall: iconText, timeout: time
     }
     this.smallBox(data);
  }


}

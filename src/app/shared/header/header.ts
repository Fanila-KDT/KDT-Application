import { Component } from '@angular/core';
import { UserAccessService } from '../../Service/AuthenticationService/user-access';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: false
})
export class Header {
  activeHeader: string = 'dashboard'; 
  subscription: Subscription[] = new Array<Subscription>();
  username: string = '';

  constructor(private userAccessService: UserAccessService, private router: Router) {
    
    this.subscription.push(this.userAccessService.username.subscribe(data=>{
      this.username = data;
    }));

  }
  setActiveHeader(section: string): void {
    this.activeHeader = section;
    localStorage.setItem('activeHeader', section);
    sessionStorage.setItem('HeaderName',section);
    this.userAccessService.HeaderName.next(section);
    this.router.navigate(['/dashboard']);
  }

  logout(){
    this.userAccessService.logout.next(true);
  }
}

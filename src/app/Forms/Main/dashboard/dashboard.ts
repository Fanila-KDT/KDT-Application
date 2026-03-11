import { Component } from '@angular/core';
import { App } from '../../../app';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(public app:App){}
  ngOnInit() {
  }
}

import { Component } from '@angular/core';
import { RecieptEntryService } from '../../../Service/RecieptEntryService/reciept-entry-service';
import { Router } from '@angular/router';

@Component({
  selector: 'inventory-dashboard',
  standalone: false,
  templateUrl: './inventory-dashboard.html',
  styleUrl: './inventory-dashboard.css'
})
export class InventoryDashboard {
  localList:any[]=[];
  ForeignList:any[]=[];
  localPOsCount:number=0;
  foreignPOsCount:number=0;
  constructor(private recieptEntryService:RecieptEntryService, private router: Router,) { }

  async ngOnInit() {
    this.localList =await this.recieptEntryService.getPendingPOList(32);
    this.ForeignList = await this.recieptEntryService.getPendingPOList(182);
    this.localPOsCount=this.localList.length;
    this.foreignPOsCount=this.ForeignList.length;
  }

  onLocalClick(){
    sessionStorage.setItem('List', JSON.stringify(this.localList)); 
    sessionStorage.setItem('Heading', 'Local Po'); 
    this.router.navigate(['/Forms/inventory-pending-reciepts']);
  }

  onForeignClick(){
    sessionStorage.setItem('List', JSON.stringify(this.ForeignList)); 
    sessionStorage.setItem('Heading', 'Foreign Po'); 
    this.router.navigate(['/Forms/inventory-pending-reciepts']); 
  }
}

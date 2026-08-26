import { ChangeDetectorRef, Component } from '@angular/core';
import { RecieptEntryService } from '../../../Service/RecieptEntryService/reciept-entry-service';
import { ActivatedRoute, Router } from '@angular/router';
import { EndPointService } from '../../../Service/end-point.services';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'inventory-dashboard',
  standalone: false,
  templateUrl: './inventory-dashboard.html',
  styleUrl: './inventory-dashboard.css'
})
export class InventoryDashboard {
  localList:any[]=[];
  ForeignList:any[]=[];
  localPOsCount:number = 0;
  foreignPOsCount:number = 0;
  TotalCount:number = 0;
  constructor(private recieptEntryService:RecieptEntryService,private httpClient:HttpClient, private router: Router,
    private route: ActivatedRoute,private cdRef: ChangeDetectorRef,public endpointService:EndPointService) { }

  async ngOnInit() {
    this.localList =await this.recieptEntryService.getPendingPOList(32);
    this.cdRef.markForCheck();
    this.ForeignList = await this.recieptEntryService.getPendingPOList(182);
    this.cdRef.markForCheck();
    this.localPOsCount = this.localList.length;
    this.foreignPOsCount = this.ForeignList.length;
    this.TotalCount = this.localPOsCount + this.foreignPOsCount;
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

  print(){
  let apiHostingURL = this.endpointService.ReportURL+ 'ItemDetails?sID='+1;
    var url = apiHostingURL + '&item_code='+'123456789';
    window.open(url, '_blank')
  }
}

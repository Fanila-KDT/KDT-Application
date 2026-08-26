import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  exports: [
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    // add all Material modules you use
  ]
})
export class SharedMaterialModule {}

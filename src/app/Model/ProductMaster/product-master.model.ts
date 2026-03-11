export class ProductMasterModel {
    item_no :string="";
    item_code :string="";
    item_name:any="";
    item_name_abbr:any="";
    category_code:string="";
    brand_id:any;
    bin_location:string="";
    retail_rate:number=0;
    unitid:number=0;
    product_type:string="";
    final_rate:number=0;
    product_yield:number=0;
    warranty:number=0;
    type_id:any;
    company_code:number=0;
    cost_price :number=0;
    avG_COST :number=0;
    cpP_Bw :number=0;
    cpP_Clr :number=0;
    last_pur_rate :number=0;
    fgn_last_pur_rate :number=0;
    cpP_Bw_woc :number=0;
    cpP_Clr_woc :number=0;  
    createdt: any;  
    tag_item:any=false; 
    service_item:any=false; 
    inactive_item:any=false; 
    category_name :string="";
    brand_name :string="";
    item_category :string="";
    prev_pur: string="0";
    last_invoice:any;
}

export class MachineFeaturesList{
     // Values for Machine feature Tab
    item_no :any;  
    general_features :string="";
    copier_features :string="";
    printer_features :string="";
    scanner_features :string="";
    paper_handling :string="";
}


export class ProductMasterModelSearch {
    item_code :any = null;
    item_name :any = null;
    item_name_abbr :any = null;
    category_name :any = null;
    product_type :any = null;
    brand_name :any = null;
}

export class ProductClassList {
    category_code :any = 0;
    category_name :string="";
}

export class ProductColorList {
    type_id :number=0;
    item_type :string="";
}

export class BrandList {
    brand_id :any = 0;;
    brand_name :string="";
}

export class UnitList {
    unit_id :number=0;
    unit_name :string="";
}

export class departmentList {
    deptno :number=0;
    deptname :string="";
}
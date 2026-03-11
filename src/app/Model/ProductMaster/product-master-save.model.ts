export class productMasterModelSave {
    item_no :string="";
    item_code :string="";
    item_name:string="";
    item_name_abbr:string="";
    category_code:string="";
    brand_id:any;
    bin_location:string="";
    retail_rate:number=0;
    unitid:number=0;
    product_type:string="";
    final_rate:number=0;
    product_yield:number=0;
    warranty:number=0;
    type_id:number=0;
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
    item_category:any;
}

export class AccessoriesSave {
    item_no :any;
    quantity :any;
    compulsory :any;
    m_item_no :any;
    item_type :any="Accessory";
    item_name :any;
    item_code:any
}

export class ConsumableSave {
     // Values for Accessories Tab  
    item_no :any;
    quantity :any;
    compulsory :any;
    m_item_no :any;
    item_type :any="Consumable";
    item_name :any;
    item_code:any
}

export class PrevCodeSave {
    item_no :any;
    prev_code :any;
    updated_date :any;
}

export class BrandItems {
    brand_id :any;
    brand_name :any;
    createdt:any;
    companycode:any=0;
}

export class UnitItems{
    unit_id :any;
    unit_name :any;
    company_code:any;
}

export class ProductClassItems{
    category_code: any;
    company_code: any;
    category_name: any;
    deptno: any;
    createdt: any;
}
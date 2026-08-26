export class StockReportModel {
    // Check Boxes
    bal_col_only: any = false;
    show_transfer: any = false;
    show_only_zero_cost: any = false;
    hide_zero_stock: any = false;
    hardware: any = false;
    accessories: any = false;
    costing: any = false;
    godown_code: any = '';
    godownName: any = '';
    main_category_code: any = '';
    deptno: any = '';
    category_code: any = '';
    product_type: any = '';
    brand_id: any = '';
    item_no: any = '';
    merge_main_store: any = true;
    hide_items: any = true;
    godown_code_loc: any = '';
    main_category_code_loc: any = '';
    deptno_loc: any = '';
    category_code_loc: any = '';
    fromDate: any = '';
    toDate: any = '';
    year: any ;
}

export class TransactionReportModel {
    register_code: any[] = [];
    fromDate: any = '';
    toDate: any = '';
    godown_code: any = '';
    category_name: any = '';
    deptname: any = '';
    item_no: any = '';
    product_type: any = '';
    godownName: any = '';
    reason: any = '';
    account_name: any = '';
    transfer_godown_name: any = '';
}

export class POReportModel {
    register_code: any;
    fromDate: any = '';
    toDate: any = '';
    category_name: any = '';
    deptname: any = '';
    item_no: any = '';
    product_type: any = '';
    account_name: any = '';
    pending_reciept: any = false;
    year: any;
}

export class InventoryAgingReportModel{
    agingAsOf: any = '';
    deptname: any = '';
    category_name: any = '';
    product_type: any = '';
    aboveDays: any = 0;
    item_no: any = '';
} 

export class ItemMovementReportModel{
    months: any = 1;
    deptname: any = ''
    category_name: any = '';
    product_type: any = '';
}

export class Attachment{
    RefNo :string="";
    FileName :string="";
    FilePath :string="";
    FileFlag :string="";
    PreparedBy :string="";
    UpdatedBy :string="";
}
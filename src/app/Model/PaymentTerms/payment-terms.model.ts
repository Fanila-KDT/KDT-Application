export class PaymentTermsMasterModel {
    payterm_id: any = 0;
    pay_term: any;
    companycode: any;
    createdt: any;
    no_days: any;
    purchase: any = false;
    contract_invoice: any = false;
    sales_order: any = false;
}

export class PaymentTermsMasterSearch{
    purchase: any = false;
    contract_invoice: any = false;
    sales_order: any = false;
}
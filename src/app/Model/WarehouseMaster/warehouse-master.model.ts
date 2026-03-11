export class WarehouseMasterModel {
    godown_code: any;
    godown_name: any;
    godown_name_abbr: any;
    createdt: any;
    company_code: any;
    centercode: any;
    centername: any;
    frq: any = false;
    invoice: any = false;
    inhouse: any = false;
    purchase: any = false;
    virtual_store: any = false;
}

export class WarehouseMasterModelSave {
    godown_code: any;
    godown_name: any;
    godown_name_abbr: any;
    createdt: any;
    company_code: any;
    centercode: any;
    frq: any = false;
    invoice: any = false;
    inhouse: any = false;
    purchase: any = false;
    virtual_store: any = false;
}

export class WarehouseMasterModalSearch {
    godown_name: any;
    godown_name_abbr: any;
}

export class WarehouseDeatailsModel {
    godowN_CODE: any;
    paY_CODE: any;
    accounT_CODE: any;
    adjustmenT_CODE: any;
    advancE_AC_CODE: any;
    consumablE_EXP_AC_CODE: any;
    cS_AC_CODE: any;
    gifT_AC_CODE: any;
    inventorY_AC_CODE: any;
    saleS_AC_CODE: any;
    saleS_DISC_CODE: any;
    servicE_AC_CODE: any;
    warR_EXP_AC_CODE: any;
}

export class PayCodeList {
    account_code: any;
    account_name: any;
}

export class AccountList {
    account_code: any;
    account_name: any;
}
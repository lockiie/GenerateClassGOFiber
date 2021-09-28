const fs = require('fs');
const { dirModels } = require('./main');
const utlls = require('./utills');


exports.generateModels = async(tbl, columns) => {
    const tableName = utlls.formatStructName(tbl.TABLE_NAME)

    let modelClass = `package models \n\n`;

    modelClass += `//${tableName} \n struct { \n`;

    modelClass += `type ${tableName} models \n\n`;

    for (let i = 0, n = columns.length; i < n; i++) {
        console.log(columns[i])
            //console.log(utlls.formatStructAtr(columns[i].COLUMN_NAME));
    }

}

function getTypeAtrAnd(column) {
    let resultStr = "";
    switch (column.DATA_TYPE) {
        case "NUMBER":



            resultStr += ""
            return typeNumber(pression, scale);
        case "VARCHAR":
        case "VARCHAR2":
            return typeString(length);
        case "DATE":
            return typeDate(length);
    }
}

function typeNumber(column) {

    if (scale === 0) {
        const cColumnName = column.COLUMN_NAME.toUpperCase();
        if (cColumnName.indexOf("STATUS") > -1 && column.DATA_PRECISION === 1) { //se comter status ´[e bem provavel que é booleano

            if (column.NULLABLE === 'Y') { //se póde ser nulo é um ponteiro
                return "*bool";
            } else {
                return "bool";
            }
        }

        if (cColumnName.indexOf("ID") > -1) {
            if (column.DATA_PRECISION <= 1) {
                return "uint8";
            } else if (column.DATA_PRECISION <= 4) {
                return "uint16";
            } else if (column.DATA_PRECISION <= 9) {
                return "uint32";
            } else {
                return "uint64";
            }
        } else {
            if (column.DATA_PRECISION <= 1) {
                return "int8";
            } else if (column.DATA_PRECISION <= 4) {
                return "int16";
            } else if (column.DATA_PRECISION <= 9) {
                return "int32";
            } else {
                return "int64";
            }
        }
    }
    //se tiver decimais

    /////////////////////auqi
}

function typeString() {

}

function typeDate() {

}
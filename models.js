const fs = require('fs');
const { dirModels } = require('./main');
const utlls = require('./utills');
const db = require('./dbConfig/db');


exports.generateModels = async(tbl, columns) => {
    const tableName = utlls.formatStructName(tbl.TABLE_NAME)

    let modelClass = `package models \n\n`;

    modelClass += `type ${tableName} struct { \n`;

    for (let i = 0, n = columns.length; i < n; i++) {
        const bookmarks = await generateValidators(columns[i]);
        modelClass += `    ${utlls.formatStructAtr(columns[i].COLUMN_NAME)} ${getType(columns[i])}  ${bookmarks}\n`;
        //console.log(bookmarks)

    }

    modelClass += `} \n\n`;

    console.log(modelClass)

}

async function generateValidators(column) {
    function isRequired() {
        if (column.NULLABLE === 'N') {
            return "required"
        }
        return ""
    }

    function LessThanEqual() {
        function return0() {
            let result = ""
            for (let i = 0; i < column.DATA_PRECISION; i++) {
                result += "0";
            }
            return result;
        }
        let valid = isRequired();
        if (column.DATA_TYPE === 'DATE') {
            return valid;
        }
        if (valid !== "") {
            valid += ","
        }
        if (column.DATA_TYPE === 'VARCHAR2' || column.DATA_TYPE === 'VARCHAR') {
            return valid += 'lte=' + column.DATA_LENGTH;
        } else if (column.DATA_TYPE === 'NUMBER') {
            return valid += "lte=1" + return0();
        }
    }

    function getJsonStr() {
        if (column.NULLABLE === 'N') {
            return colDictionary.CDY_JSON;
        }
        return colDictionary.CDY_JSON + ',omitempty';
    }

    const colDictionary = await db.getColDictionary(column.COLUMN_NAME);
    return ' `db:"' + column.COLUMN_NAME + '" json:"' + colDictionary.CDY_JSON + '" validate:"' + LessThanEqual() + '"`';
}

function getType(column) {
    switch (column.DATA_TYPE) {
        case "NUMBER":
            return typeNumber(column);
        case "VARCHAR":
        case "VARCHAR2":
            return "string";
        case "DATE":
            return "time.Time";
    }
}

function typeNumber(column) {

    if (column.DATA_SCALE === 0) {
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
    if (column.DATA_PRECISION + column.DATA_SCALE < 7) {
        return "float32";
    }
    if (column.DATA_PRECISION + column.DATA_SCALE < 14) {
        return "float64";
    }

    if (column.DATA_PRECISION + column.DATA_SCALE < 21) {
        return "complex64";
    }

    if (column.DATA_PRECISION + column.DATA_SCALE > 21) {
        return "complex128";
    }
    //se tiver decimais

    /////////////////////auqi
}
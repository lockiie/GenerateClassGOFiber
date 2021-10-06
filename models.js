const fs = require('fs');
const { dirModels } = require('./main');
const utlls = require('./utills');
const db = require('./dbConfig/db');


exports.generateModels = async(tbl, columns) => {
    const structName = utlls.formatStructName(tbl.TABLE_NAME)

    let modelClass = `package models \n\n import ( \n "database/sql" \n ) \n\n`;

    modelClass += `type ${structName} struct { \n`;

    for (let i = 0, n = columns.length; i < n; i++) {
        const infosFK = await db.getInfoColumnOfDatabaseDictionaryFK(columns[i].COLUMN_NAME, tbl.TABLE_NAME);
        const bookmarks = await generateValidators(columns[i], infosFK, tbl.TABLE_NAME);
        modelClass += `    ${utlls.formatStructAtr(columns[i].COLUMN_NAME)} ${getType(columns[i])}  ${bookmarks} ${nickNameInfoColumnOfDatabaseDictionaryFK(infosFK)}\n`;
    }

    modelClass += `} \n\n`;

    //adionar a validação
    const firstLetter = structName[0].toLowerCase();
    modelClass += `func (${firstLetter} *${structName}) Validators() error { \n err := validate.Struct(${firstLetter}) \n return err \n }`;
    const fileModel = dirModels + `/${structName}.go`
    fs.writeFileSync(fileModel, modelClass, { encoding: 'utf8' })
}

async function generateValidators(column, infosFK, tbl) {
    async function isAutoIncrementAndPK() {
        if (process.env.AUTO_INCREMENT == 'Y') {
            const infoPK = await db.getInfoColumnOfDatabaseDictionaryPK(tbl);
            if (infoPK.length !== 0) {
                if (infoPK[0].COLUMN_NAME === column.COLUMN_NAME) {
                    return true;
                }
            }
        }
        return false;
    }

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
        if (column.DATA_TYPE === 'VARCHAR2' || column.DATA_TYPE === 'VARCHAR' || column.DATA_TYPE === 'CHAR') {
            return valid += 'lte=' + column.DATA_LENGTH;
        } else if (column.DATA_TYPE === 'NUMBER') {
            return valid += "lt=1" + return0();
        }
    }

    function getJsonStr() {
        //check if you have FK if yes put by FK name
        function tratJson() {
            if (infosFK.length > 0) {
                const stuctName = utlls.formatStructName(infosFK[0].TABLE_ORIGIN)
                return `${stuctName[0].toLowerCase()}${stuctName.substr(1)}_id`
            }
            return colDictionary.CDY_JSON;
        }

        if (column.NULLABLE === 'N' && infosFK.length === 0) {
            return tratJson();
        }
        return tratJson() + ',omitempty';
    }
    const colDictionary = await db.getColDictionary(column.COLUMN_NAME);
    let validate = LessThanEqual()
    const isValidators = await isAutoIncrementAndPK();
    if (isValidators || column.DATA_DEFAULT != null) {
        validate = ""
    }
    //console.log(column.DATA_DEFAULT)
    return ' `db:"' + column.COLUMN_NAME + '" json:"' + getJsonStr() + '" validate:"' + validate + '"`';
}

//It will be used to get information from the table to see if the field is FK and which table it references

function nickNameInfoColumnOfDatabaseDictionaryFK(infosFK) {
    if (infosFK.length > 0) {
        return `// ${infosFK[0].TABLE_ORIGIN}`
    }
    return ""

}


function getType(column) {
    switch (column.DATA_TYPE) {
        case "NUMBER":
            return typeNumber(column);
        case "VARCHAR":
        case "VARCHAR2":
        case "CHAR":
            if (column.NULLABLE === 'Y')
                return "string" //para oracle string nula e string vazia é a mesma coisa -->sql.NullString
            return "string";
        case "DATE":
            if (column.NULLABLE === 'Y' || (column.DATA_DEFAULT != null && column.NULLABLE === 'N'))
                return "sql.NullTime"
            return "time.Time";
    }
}

function typeNumber(column) {

    if (column.DATA_SCALE === 0) {
        const cColumnName = column.COLUMN_NAME.toUpperCase();
        if (cColumnName.indexOf("STATUS") > -1 && column.DATA_PRECISION === 1) { //se comter status ´[e bem provavel que é booleano

            if (column.NULLABLE === 'Y') { //se póde ser nulo é um ponteiro
                return "sql.NullBool";
            } else {
                return "bool";
            }
        }

        if (cColumnName.indexOf("ID") > -1) {
            if (column.DATA_PRECISION <= 1) {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt32"
                return "uint8";
            } else if (column.DATA_PRECISION <= 4) {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt32"
                return "uint16";
            } else if (column.DATA_PRECISION <= 9) {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt32"
                return "uint32";
            } else {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt64"
                return "uint64";
            }
        } else {
            if (column.DATA_PRECISION <= 1) {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt32"
                return "int8";
            } else if (column.DATA_PRECISION <= 4) {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt32"
                return "int16";
            } else if (column.DATA_PRECISION <= 9) {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt32"
                return "int32";
            } else {
                if (column.NULLABLE === 'Y')
                    return "sql.NullInt64"
                return "int64";
            }
        }
    }
    if (column.DATA_PRECISION + column.DATA_SCALE < 7) {
        if (column.NULLABLE === 'Y')
            return "sql.NullFloat32"
        return "float32";
    }
    if (column.DATA_PRECISION + column.DATA_SCALE < 14) {
        if (column.NULLABLE === 'Y')
            return "sql.NullFloat64"
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
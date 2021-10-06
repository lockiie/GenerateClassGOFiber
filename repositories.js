const fs = require('fs');
const { dirRepositories } = require('./main');
const utlls = require('./utills');
const db = require('./dbConfig/db');

const repo = 'Repo';


exports.generateRepositories = async(tbl, columns) => {
    const pk = await db.getInfoColumnOfDatabaseDictionaryPK(tbl.TABLE_NAME);
    //console.log(generateUpdate(tbl.TABLE_NAME, columns, pk[0]))
    console.log(generateInsert(tbl.TABLE_NAME, columns, pk[0]));
    //console.log(generateQueryByID(tbl.TABLE_NAME, columns, pk[0]));

}

function generateInsert(tblName, columns, pk) {
    let funcInsert = `func (db ${repo}${utlls.formatStructName(tblName)}) Insert(${utlls.formatNickName(tblName)} *models.${utlls.formatStructName(tblName)}) error {\n`;
    funcInsert += `_, err := db.tx.ExecContext(\n`;
    funcInsert += `*db.ctx,\n`;
    let sqlMetadate = `INSERT INTO ${tblName}(`;
    let sqlValues = `VALUES(`;
    let valuesFunc = ""
    const lengthMetadate = sqlMetadate.length;
    const lengthValues = sqlValues.length;
    let countValues = 0;
    if (process.env.AUTO_INCREMENT !== 'Y') {
        sqlMetadate += pk.COLUMN_NAME;
        sqlValues += ':0'
        countValues += 1;
    }
    let lengthColumn = 0;
    for (let i = 0, n = columns.length; i < n; i++) {
        if ((columns[i].COLUMN_NAME.indexOf("_UPDATE") > -1 || columns[i].COLUMN_NAME.indexOf("_REGISTER") > -1) && columns[i].DATA_DEFAULT != null) {
            continue;
        }
        if (columns[i].COLUMN_NAME !== pk.COLUMN_NAME) {
            if (countValues !== 0) {
                sqlMetadate += ',';
                sqlValues += ',';
            }

            if (lengthColumn > 38) {
                sqlMetadate += '\n' + lpad(lengthMetadate);
                sqlValues += '\n' + lpad(lengthValues);
                lengthColumn = 0;
            }
            sqlMetadate += columns[i].COLUMN_NAME;
            sqlValues += ':' + String(countValues);
            countValues += 1;
        }
        if (i + 1 === n) {
            sqlMetadate += ')';
            sqlValues += ')';
        }
        lengthColumn += columns[i].COLUMN_NAME.length;
    }
    funcInsert += '`' + sqlMetadate + '\n' + sqlValues + '`';
    funcInsert += `) \n return err \n }`
    return funcInsert;
}


function lpad(count) {
    let result = ""
    for (let i = 0; i < count; i++) {
        result += ' ';
    }
    return result;

}

function generateUpdate(tblName, columns, pk) {
    let sqlUpdate = `UPDATE ${tblName} SET `;

    let countValues = 0;
    let countLengthUpdate = sqlUpdate.length;
    let lengthColumn = 0;
    for (let i = 0, n = columns.length; i < n; i++) {
        if ((columns[i].COLUMN_NAME.indexOf("_REGISTER") > -1)) {
            continue;
        }
        let columnValue = "";
        if (columns[i].COLUMN_NAME !== pk.COLUMN_NAME) {
            if (countValues > 0)
                columnValue += ','
            if (lengthColumn > 38) {
                columnValue += '\n' + lpad(countLengthUpdate);
                lengthColumn = 0;
            }
            columnValue += columns[i].COLUMN_NAME + ' = ';
            if (columns[i].COLUMN_NAME.indexOf("_UPDATE") > -1)
                columnValue += 'SYSDATE'
            else
                columnValue += ':' + String(countValues);
            countValues += 1;
        }
        if (i + 1 === n) {
            columnValue += `\nWHERE ${pk.COLUMN_NAME} = :${String(countValues)}`;

        }
        sqlUpdate += columnValue;
        lengthColumn += columns[i].COLUMN_NAME.length;
    }
    return sqlUpdate;

}

function generateDelete(tblName, pk) {
    let sqlDelete = `DELETE FROM ${tblName} \n`
    sqlDelete += `WHERE ${pk.COLUMN_NAME} = :0`;

}

function getColumn(columns) {
    sqlResult = "";
    let lengthColumn = 0;
    for (let i = 0, n = columns.length; i < n; i++) {
        if (lengthColumn > 38) {
            sqlResult += '\n' + lpad(8);
            lengthColumn = 0;
        }
        sqlResult += columns[i].COLUMN_NAME;
        if (i + 1 !== n)
            sqlResult += ', ';
        lengthColumn += columns[i].COLUMN_NAME.length;
    }
    return sqlResult;

}

function generateQuery(tblName, columns, pk) {
    return `SELECT ${getColumn(columns)}\nFROM ${tblName}`;

}

function generateQueryByID(tblName, columns, pk) {
    return `SELECT ${getColumn(columns)}\nFROM ${tblName}\nWHERE ${pk.COLUMN_NAME} = :0`;
}
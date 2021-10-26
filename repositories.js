const fs = require('fs');
const { dirRepositories, dirControllers } = require('./main');
const utlls = require('./utills');
const db = require('./dbConfig/db');

const repo = 'Repo';


exports.generateRepositories = async(tbl, columns) => {
    let code = `package repositories \n import ( \n "context" \n "database/sql" \n "eco/src/functions" \n "eco/src/models" \n
    \n "eco/src/types" \n "errors" \n "strconv" \n ) \n`;
    // const pk = await db.getInfoColumnOfDatabaseDictionaryPK(tbl.TABLE_NAME);

    // let code = `package repositories \n import ( \n "context" \n "database/sql" \n "errors" \n "fmt" \n "strconv" ) \n\n`;

    code += `type ${repo}${utlls.formatStructName(tbl.TABLE_NAME)} struct { \n`;
    code += `tx   *sql.Tx \n ctx  *context.Context \n conn *sql.Conn \n  } \n \n`;
    code += `func New${repo}${utlls.formatStructName(tbl.TABLE_NAME)} (tx *sql.Tx, ctx *context.Context, conn *sql.Conn) *${repo}${utlls.formatStructName(tbl.TABLE_NAME)} { \n`;
    code += ` return &${repo}${utlls.formatStructName(tbl.TABLE_NAME)}{tx, ctx, conn} \n } \n \n // \n`;
    const pk = await db.getInfoColumnOfDatabaseDictionaryPK(tbl.TABLE_NAME);
    code += generateInsert(tbl.TABLE_NAME, columns, pk[0]);
    code += `\n`;
    code += generateUpdate(tbl.TABLE_NAME, columns, pk[0]);
    code += `\n`;
    code += generateDelete(tbl.TABLE_NAME, pk[0]);
    code += `\n`;
    code += generateQuery(tbl.TABLE_NAME, columns, pk[0]);
    code += `\n`;
    code += generateQueryByID(tbl.TABLE_NAME, columns, pk[0]);
    const structName = utlls.formatStructName(tbl.TABLE_NAME)
    const fileModel = dirControllers + `/${structName}.go`
    fs.writeFileSync(fileModel, code, { encoding: 'utf8' })
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
                valuesFunc += ',';
                sqlMetadate += ',';
                sqlValues += ',';
            }

            if (lengthColumn > 38) {
                sqlMetadate += '\n' + lpad(lengthMetadate);
                sqlValues += '\n' + lpad(lengthValues);
                valuesFunc += '\n' + lpad(lengthValues);
                lengthColumn = 0;
            }
            sqlMetadate += columns[i].COLUMN_NAME;
            sqlValues += ':' + String(countValues);
            valuesFunc += `${utlls.formatNickName(tblName)}.${utlls.formatStructAtr(columns[i].COLUMN_NAME)}`;
            countValues += 1;
        }
        if (i + 1 === n) {
            sqlMetadate += ')';
            sqlValues += ')';
            valuesFunc += ',';
        }
        lengthColumn += columns[i].COLUMN_NAME.length;
    }
    funcInsert += '`' + sqlMetadate + '\n' + sqlValues + '`, \n ' + valuesFunc;
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
    let code = `func (db ${repo}${utlls.formatStructName(tblName)} ) Update(${utlls.formatNickName(tblName)} *models.${utlls.formatStructName(tblName)}) error { \n`;
    code += `var res sql.Result \n var err error \n `;
    code += `res, err = db.tx.ExecContext( \n *db.ctx, \n `;
    let sqlUpdate = `UPDATE ${tblName} SET `;

    let countValues = 0;
    let countLengthUpdate = sqlUpdate.length;
    let lengthColumn = 0;
    let valuesFunc = "";
    for (let i = 0, n = columns.length; i < n; i++) {
        if ((columns[i].COLUMN_NAME.indexOf("_REGISTER") > -1)) {
            continue;
        }
        let columnValue = "";
        if (columns[i].COLUMN_NAME !== pk.COLUMN_NAME) {
            if (countValues > 0) {
                columnValue += ',';
                if (!(columns[i - 1].COLUMN_NAME.indexOf("_UPDATE") > -1))
                    valuesFunc += ','
            }
            if (lengthColumn > 38) {
                valuesFunc += '\n'
                columnValue += '\n' + lpad(countLengthUpdate);
                lengthColumn = 0;
            }
            columnValue += columns[i].COLUMN_NAME + ' = ';
            if (columns[i].COLUMN_NAME.indexOf("_UPDATE") > -1)
                columnValue += 'SYSDATE'
            else {
                columnValue += ':' + String(countValues);
                valuesFunc += ` ${utlls.formatNickName(tblName)}.${utlls.formatStructAtr(columns[i].COLUMN_NAME)}`;
            }
            countValues += 1;
        }
        if (i + 1 === n) {
            valuesFunc += ','
            columnValue += `\nWHERE ${pk.COLUMN_NAME} = :${String(countValues)}`;

        }
        sqlUpdate += columnValue;
        lengthColumn += columns[i].COLUMN_NAME.length;
    }
    sqlUpdate = '`' + sqlUpdate + '`';
    code += `${sqlUpdate}, \n ${valuesFunc} \n ) \n \n if err != nil { \n return err \n } \n affected, err := res.RowsAffected() \n`;
    code += `if affected == 0 { \n return errors.New(types.DBMsgNotUpdate) \n } \n return err \n }`;
    return code;

}

function generateDelete(tblName, pk) {
    let code = `func (db ${repo}${utlls.formatStructName(tblName)}) Delete(${utlls.formatStructAtr(pk.COLUMN_NAME)} uint32) error { \n`;
    code += `res, err := db.conn.ExecContext( \n`;
    code += `*db.ctx,\n`;
    let sqlDelete = `DELETE FROM ${tblName} \n`
    sqlDelete += `WHERE ${pk.COLUMN_NAME} = :0`;
    code += " `" + sqlDelete + "`,\n";
    code += `${utlls.formatStructAtr(pk.COLUMN_NAME)}, \n ) \n`;
    code += `if err != nil { \n return err \n } \n affected, err := res.RowsAffected() \n if affected == 0 { \n `;
    code += `return errors.New(types.DBMsgNotUpdate) \n } \n return err \n }`;
    return code;

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

function getColumnValue(columns) {
    sqlResult = "";
    let lengthColumn = 0;
    for (let i = 0, n = columns.length; i < n; i++) {
        if (lengthColumn > 38) {
            sqlResult += '\n' + lpad(8);
            lengthColumn = 0;
        }
        sqlResult += `${utlls.formatNickName(tblName)}.${utlls.formatStructAtr(columns[i].COLUMN_NAME)}`;
        if (i + 1 !== n)
            sqlResult += ', ';
        lengthColumn += columns[i].COLUMN_NAME.length;
    }
    return sqlResult;

}

function getColumnValueGolang(columns, varStr, tblName) {
    sqlResult = "";
    let lengthColumn = 0;

    for (let i = 0, n = columns.length; i < n; i++) {
        if (lengthColumn > 38) {
            sqlResult += '\n' + lpad(8);
            lengthColumn = 0;
        }
        sqlResult += `&${varStr}.${utlls.formatStructAtr(columns[i].COLUMN_NAME)}`;
        if (i + 1 !== n)
            sqlResult += ', ';

        lengthColumn += columns[i].COLUMN_NAME.length;
    }
    return sqlResult;

}

function generateQueryByID(tblName, columns, pk) {
    let code = `func (db ${repo}${utlls.formatStructName(tblName)}) QueryByID(code string) (*models.${utlls.formatStructName(tblName)}, error) { \n`;
    code += `var args []interface{} \n \n `;
    code += `args = append(args, code) \n`;
    code += `row:= db.conn.QueryRowContext( \n`;
    code += `*db.ctx, \n`;

    const sql = `SELECT ${getColumn(columns)}\nFROM ${tblName}\nWHERE ${pk.COLUMN_NAME} = :0`;
    code += "`" + sql + "`";
    code += `, args..., \n ) \n`;
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    code += `var ${varStr} models.${utlls.formatStructName(tblName)} \n \n`;
    code += `err := `;

    code += `row.Scan(`;

    code += getColumnValueGolang(columns, varStr, tblName);

    code += `) \n`;
    code += `${utlls.checkError()}  \n`;

    //code += `${utlls.formatStructName(tblName).toLowerCase()} = append(${utlls.formatStructName(tblName).toLowerCase()}, ${varStr})`;

    code += ` return &${varStr}, err \n }`;
    return code;
}

function generateQuery(tblName, columns, pk) {
    let code = `func (db ${repo}${utlls.formatStructName(tblName)}) Query(pag Pagination) (*[]models.${utlls.formatStructName(tblName)}, error) { \n`;
    code += `var args []interface{} \n \n `;
    code += `strpag, offSet, Limit := pag.pagBind() \n args = append(args, offSet, Limit) \n`;
    code += `rows, err := db.conn.QueryContext( \n`;
    code += `*db.ctx, \n`;

    const sql = `SELECT ${getColumn(columns)}\nFROM ${tblName}\nWHERE ${pk.COLUMN_NAME} = :0`;
    code += "`" + sql + "`";
    code += `, args..., \n ) \n`;
    code += `${utlls.checkError()} \n defer rows.Close() \n`;
    code += `var ${utlls.formatStructName(tblName).toLowerCase()} []models.${utlls.formatStructName(tblName)} \n \n`;
    code += `for rows.Next() { \n `;

    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    code += `var ${varStr} models.${utlls.formatStructName(tblName)} \n`;
    code += `rows.Scan(`;

    code += getColumnValueGolang(columns, varStr, tblName) + " + strpag";

    code += `) \n`;

    code += `${utlls.formatStructName(tblName).toLowerCase()} = append(${utlls.formatStructName(tblName).toLowerCase()}, ${varStr})`;

    code += `\n } \n  return &${utlls.formatStructName(tblName).toLowerCase()}, err \n }`;
    return code;
}
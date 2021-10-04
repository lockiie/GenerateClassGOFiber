const oracledb = require('oracledb')

let conn

async function OpenDB() {
    await oracledb.createPool({
        user: process.env.DB_NAME,
        password: process.env.PASSWORD,
        connectString: process.env.CONNECT_STRING,
    });
    conn = await oracledb.getConnection();
}

const sqlGetTables = `SELECT TABLE_NAME 
                      FROM USER_TABLES`;


exports.getTables = async() => {
    await OpenDB();
    const result = await conn.execute(sqlGetTables, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    return result.rows;
}

// SELECT C.COLUMN_NAME, C.DATA_TYPE, C.DATA_LENGTH, C.DATA_PRECISION, C.DATA_SCALE, C.NULLABLE
// FROM   USER_TAB_COLUMNS C, ALL_CONSTRAINSTS all_constraints
// WHERE  TABLE_NAME = 'TB_PRODUCTS'
// ORDER BY COLUMN_ID


/*
SELECT J.*, T.*, F.TABLE_NAME
FROM USER_CONS_COLUMNS J, USER_CONSTRAINTS T, USER_CONSTRAINTS F
WHERE J.CONSTRAINT_NAME = T.CONSTRAINT_NAME
  AND J.TABLE_NAME = T.TABLE_NAME
  AND J.TABLE_NAME = 'TBL_PRODUCTS'
  AND (F.CONSTRAINT_TYPE IS NULL OR F.CONSTRAINT_TYPE = 'P')
  AND T.R_CONSTRAINT_NAME = F.CONSTRAINT_NAME(+)
  --AND J.COLUMN_NAME = 'SUB_ID'
  AND T.CONSTRAINT_TYPE IN ('P', 'R')
  

SELECT J.*, T.*, F.TABLE_NAME
FROM USER_CONS_COLUMNS J, USER_CONSTRAINTS T, USER_CONSTRAINTS F
WHERE J.CONSTRAINT_NAME = T.CONSTRAINT_NAME
  AND J.TABLE_NAME = T.TABLE_NAME
  AND J.TABLE_NAME <> 'TBL_PRODUCTS'
  AND (F.CONSTRAINT_TYPE IS NULL OR F.CONSTRAINT_TYPE = 'P')
  AND T.R_CONSTRAINT_NAME = F.CONSTRAINT_NAME(+)
  AND J.COLUMN_NAME = 'PRO_ID'
  AND T.CONSTRAINT_TYPE IN ('R'



CREATE TABLE TB_COL_DICTIONARY
(
  CDY_ID    VARCHAR2(40 BYTE)                   NOT NULL,
  CDY_NAME  VARCHAR2(100 BYTE)                  NOT NULL,
  CDY_JSON  VARCHAR2(40)
);

ALTER TABLE TB_COL_DICTIONARY ADD (
  CONSTRAINT TB_COL_DICTIONARY_PK
  PRIMARY KEY
  (CDY_ID)
  ENABLE VALIDATE);


insert into TB_COL_DICTIONARY(CDY_ID, CDY_NAME, CDY_JSON)
SELECT COLUMN_NAME, SUBSTR(TABLE_NAME, 4), SUBSTR(TABLE_NAME, 4)
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME IN (SELECT TABLE_NAME FROM USER_TABLES)
GROUP BY COLUMN_NAME



*/

const sqlGetColumns = `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE, DATA_DEFAULT
                       FROM USER_TAB_COLUMNS
                       WHERE TABLE_NAME = :TABLE_NAME`;

exports.getColumns = async(tableName) => {
    const result = await conn.execute(sqlGetColumns, { TABLE_NAME: tableName }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    return result.rows;
}

const sqlColDictionary = `SELECT CDY_ID, CDY_NAME, CDY_JSON
                          FROM TB_COL_DICTIONARY
                         WHERE CDY_ID = :CDY_ID`;

exports.getColDictionary = async(col_name) => {
    const result = await conn.execute(sqlColDictionary, { CDY_ID: col_name }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    return result.rows[0];
}


const sqlInfoColumnOfDatabaseDictionary = `
SELECT J.CONSTRAINT_NAME, F.TABLE_NAME TABLE_ORIGIN, F.CONSTRAINT_NAME CONSTRAINT_NAME_ORIGIN, J.CONSTRAINT_NAME CONSTRAINT_NAME_DEST
FROM USER_CONS_COLUMNS J, USER_CONSTRAINTS T, USER_CONSTRAINTS F
WHERE J.CONSTRAINT_NAME = T.CONSTRAINT_NAME
  AND J.TABLE_NAME = T.TABLE_NAME
  AND J.TABLE_NAME = :TABLE_NAME
  AND (F.CONSTRAINT_TYPE IS NULL OR F.CONSTRAINT_TYPE = 'P')
  AND T.R_CONSTRAINT_NAME = F.CONSTRAINT_NAME(+)
  AND J.COLUMN_NAME = :COLUMN_NAME
  AND T.CONSTRAINT_TYPE IN ('R')`

exports.getInfoColumnOfDatabaseDictionaryFK = async(col_name, table_name) => {
    const result = await conn.execute(sqlInfoColumnOfDatabaseDictionary, { COLUMN_NAME: col_name, TABLE_NAME: table_name }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    return result.rows;
}



const sqlInfoColumnOfDatabaseDictionaryPK = `
SELECT J.COLUMN_NAME
FROM USER_CONS_COLUMNS J, USER_CONSTRAINTS T
WHERE J.TABLE_NAME = T.TABLE_NAME
  AND J.CONSTRAINT_NAME = T.CONSTRAINT_NAME
  AND J.TABLE_NAME = :TABLE_NAME
  AND T.CONSTRAINT_TYPE IN ('P')`

exports.getInfoColumnOfDatabaseDictionaryPK = async(table_name) => {
    const result = await conn.execute(sqlInfoColumnOfDatabaseDictionaryPK, { TABLE_NAME: table_name }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    return result.rows;
}




// const sqlGetInfoColumn = `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE
//                        FROM USER_TAB_COLUMNS
//                        WHERE TABLE_NAME = :TABLE_NAME`;

// exports.getColumns = async(tableName) => {
//     const result = await conn.execute(sqlGetColumns, { TABLE_NAME: tableName }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
//     return result.rows;
// }
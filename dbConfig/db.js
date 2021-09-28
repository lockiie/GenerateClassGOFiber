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
*/

const sqlGetColumns = `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE
                       FROM USER_TAB_COLUMNS
                       WHERE TABLE_NAME = :TABLE_NAME`;

exports.getColumns = async(tableName) => {
    const result = await conn.execute(sqlGetColumns, { TABLE_NAME: tableName }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
    return result.rows;
}

// const sqlGetInfoColumn = `SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE
//                        FROM USER_TAB_COLUMNS
//                        WHERE TABLE_NAME = :TABLE_NAME`;

// exports.getColumns = async(tableName) => {
//     const result = await conn.execute(sqlGetColumns, { TABLE_NAME: tableName }, { outFormat: oracledb.OUT_FORMAT_OBJECT })
//     return result.rows;
// }
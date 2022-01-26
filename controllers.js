const fs = require('fs');
const { dirControllers } = require('./main');
const utlls = require('./utills');
const db = require('./dbConfig/db');


exports.generateControllers = async(tbl, columns) => {
    const consts = `import (
        "context"
        "database/sql"
        "eco/src/db"
        f "eco/src/functions"
        "eco/src/models"
        "eco/src/repositories"
        t "eco/src/types"
        "encoding/json"
    
        "github.com/gofiber/fiber/v2"
    )\n\n`
    const structName = utlls.formatStructName(tbl.TABLE_NAME)

    const fileModel = dirControllers + `/${structName.toLowerCase()}.go`
    let result = consts + generateCreate(tbl.TABLE_NAME, columns) + generateUpdate(tbl.TABLE_NAME, columns) +
        generateDelete(tbl.TABLE_NAME, columns) + generateQuery(tbl.TABLE_NAME, columns) + generateQueryByID(tbl.TABLE_NAME, columns);
    fs.writeFileSync(fileModel, result, { encoding: 'utf8' })
}

function generateCreate(tblName, columns) {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Create${structName}(c *fiber.Ctx) error { \n`;
    strResult += `${varStr} := models.${structName} \n`;
    strResult += `err := json.Unmarshal(c.Body(), &${varStr}) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n\n`;

    strResult += `if err = ${varStr}.Validators(); err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n\n`;

    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += errInternalError;
    strResult += `defer conn.Close() \n\n`;

    strResult += `tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable}) \n`;
    strResult += errInternalError;
    strResult += `\n`;

    strResult += `${varStr}.UsrID = c.Locals(string(t.LC_UsrID)).(uint32) \n`;
    strResult += `${varStr}.ComID = c.Locals(string(t.LC_ComID)).(uint32) \n\n`;


    strResult += `repo${structName} := repositories.NewRepo${structName}(tx, &ctx, nil) \n`;
    strResult += `if err := repo${structName}.Insert(&${varStr}); err != nil {\n`;
    strResult += `errRequestError := err.(*models.ErrorsDB)\n\n`;
    strResult += `errRequestError.Message = "Erro ao inserir, " + errRequestError.Message \n`;
    strResult += `err = tx.Rollback() \n`;
    strResult += errInternalError;
    strResult += `return c.Status(errRequestError.StatusCode).JSON(errRequestError) \n`;

    strResult += `} \n\n`;
    strResult += `err = tx.Commit() \n`;
    strResult += errInternalError;

    strResult += `}\n\n`;
    return strResult
}

const errInternalError = `if err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(models.SendError(err.Error()))
             }\n`;


function generateUpdate(tblName, columns) {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Update${structName}(c *fiber.Ctx) error { \n`;
    strResult += `${varStr} := models.${structName} \n`;
    strResult += `err := json.Unmarshal(c.Body(), &${varStr}) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n\n`;

    strResult += `if err = ${varStr}.Validators(); err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n\n`;

    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += errInternalError;
    strResult += `defer conn.Close() \n\n`;

    strResult += `tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable}) \n`;
    strResult += errInternalError;


    strResult += `${varStr}.UsrID = c.Locals(string(t.LC_UsrID)).(uint32) \n`;
    strResult += `${varStr}.ComID = c.Locals(string(t.LC_ComID)).(uint32) \n\n`;


    strResult += `repo${structName} := repositories.NewRepo${structName}(tx, &ctx, nil) \n`;
    strResult += `if err := repo${structName}.Update(&${varStr} ); err != nil {\n`;
    strResult += `errRequestError := err.(*models.ErrorsDB)\n\n`;
    strResult += `errRequestError.Message = "Erro ao atualizar, " + errRequestError.Message \n`;
    strResult += `err = tx.Rollback() \n`;
    strResult += errInternalError;
    strResult += `return c.Status(errRequestError.StatusCode).JSON(errRequestError) \n`;

    strResult += `} \n\n`;
    strResult += `err = tx.Commit() \n`;
    strResult += errInternalError;

    strResult += `}\n\n`;
    return strResult

}


function generateDelete(tblName, columns) {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Delete${structName}(c *fiber.Ctx) error { \n`;
    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += errInternalError;
    strResult += `defer conn.Close() \n\n`;

    strResult += `tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable}) \n`;
    strResult += `${errInternalError} \n\n`;

    strResult += `comID := c.Locals(string(t.LC_ComID)).(uint32) \n`;

    strResult += `repo${structName} := repositories.NewRepo${structName}(tx, &ctx, nil) \n`;

    strResult += `if err := repo${structName}.Delete(c.Params(paramID), comID); err != nil { \n`;
    strResult += `errRequestError := err.(*models.ErrorsDB) \n`;
    strResult += `errRequestError.Message = "Erro ao excluir, " + errRequestError.Message \n`;

    strResult += `err = tx.Rollback() \n`;
    strResult += `${errInternalError} \n`;
    strResult += `return c.Status(errRequestError.StatusCode).JSON(errRequestError) \n } \n\n`;

    strResult += `err = tx.Commit() \n`;
    strResult += `${errInternalError} \n`;

    strResult += `return c.SendStatus(fiber.StatusNoContent) \n\n`;
    strResult += `} \n`;
    return strResult;
}


function generateQuery(tblName, columns) {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Query${structName}(c *fiber.Ctx) error { \n`;
    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += errInternalError;
    strResult += `defer conn.Close() \n\n`;

    strResult += `repo${structName} := repositories.NewRepo${structName}(nil, &ctx, conn) \n`;
    strResult += `var q f.Query \n\n`;

    strResult += `q.C = c \n`;

    strResult += `err = repo${structName}.Query(&q) \n`;

    strResult += `if err != nil { \n`;
    strResult += `errRequestError := err.(*models.ErrorsDB) \n`;
    strResult += `errRequestError.Message = "Erro ao buscar, " + errRequestError.Message \n`;

    strResult += `return c.Status(errRequestError.StatusCode).JSON(errRequestError) \n`;
    strResult += `} \n`;
    strResult += `return c.Status(fiber.StatusOK).JSON(q.Response) \n \n\n`;

    strResult += `} \n`;
    return strResult;

}

function generateQueryByID(tblName, columns) {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Query${structName}ByID(c *fiber.Ctx) error { \n`;
    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += errInternalError;
    strResult += `defer conn.Close() \n\n`;

    strResult += `comID := c.Locals(string(t.LC_ComID)).(uint32) \n`;
    strResult += `repo${structName} := repositories.NewRepo${structName}(nil, &ctx, conn) \n\n`;

    strResult += `${varStr}, err := repo${structName}.QueryByID(c.Params(paramID), comID) \n`;

    strResult += `if err != nil { \n`;

    strResult += `errRequestError := err.(*models.ErrorsDB) \n`;
    strResult += `errRequestError.Message = "Erro ao buscar, " + errRequestError.Message \n`;
    strResult += `	return c.Status(errRequestError.StatusCode).JSON(errRequestError) \n`;

    strResult += `} \n`;
    strResult += `return c.Status(fiber.StatusOK).JSON(${varStr}) \n \n\n`;

    strResult += `} \n`;
    return strResult;

}
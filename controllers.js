const fs = require('fs');
const { dirControllers } = require('./main');
const utlls = require('./utills');
const db = require('./dbConfig/db');


exports.generateControllers = async(tbl, columns) => {
    return ""
}

function generateCreate(tblName, columns) {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Create${structName}(c *fiber.Ctx) error { \n`;
    strResult += `${varStr} := models.${structName} \n`;
    strResult += `err := json.Unmarshal(c.Body(), &${varStr}) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n`;
    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n`;
    strResult += `defer conn.Close() \n\n`;
    strResult += `tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable}) \n`;
    strResult += `${errInternalError} \n`;
    strResult += `repo${structName} := repositories.NewRepo${structName}(tx, &ctx, nil) \n`;
    strResult += `${varStr}.UsrID, ${varStr}.ComID = services.ExtractUserAndCompany(c) \n`;
    strResult += `if err := repo${structName}.Insert(&b); err != nil { \n\n`;
    strResult += `tx.Rollback() \n`;
    strResult += `const errMessage = "Erro ao inserir _____, " \n`;
    strResult += `return tryErrorDB(c, errMessage, err.Error()) \n`;
    strResult += `} \n\n`;
    strResult += `tx.Commit() \n`;
    strResult += `return c.SendStatus(fiber.StatusNoContent) \n`;
    strResult += `}`;
}

const errInternalError = `if err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(models.SendError(err.Error()))
             }`;


function generateUpdate() {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Update${structName}(c *fiber.Ctx) error { \n`;
    strResult += `${varStr} := models.${structName}{} \n`;
    strResult += `err := json.Unmarshal(c.Body(), &${varStr}) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n\n`;
    strResult += `if err = ${varStr}.Validators(); err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n\n`;
    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n`;
    strResult += `defer conn.Close() \n\n`;
    strResult += `tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable}) \n`;
    strResult += `${errInternalError} \n\n`;
    strResult += `repo${structName} := repositories.NewRepo${structName}(tx, &ctx, nil) \n`;
    strResult += `${varStr}.UsrID, ${varStr}.ComID = services.ExtractUserAndCompany(c) \n\n`;
    strResult += `if err := repo${varStr}.Update(&b, c.Params(paramID)); err != nil { \n`;
    strResult += `tx.Rollback() \n`;
    strResult += `const errMessage = "Erro ao alterar ____, " \n`;
    strResult += `return tryErrorDB(c, errMessage, err.Error()) \n`;
    strResult += `} \n`;
    strResult += `tx.Commit() \n`;
    strResult += `return c.SendStatus(fiber.StatusNoContent) \n`;
    strResult += `} \n`;

}


function generateDelete() {
    const varStr = utlls.formatStructName(tblName).toLowerCase().substr(0, tblName.length - 4);
    const structName = utlls.formatStructName(tblName)
    let strResult = `func Delete${structName}(c *fiber.Ctx) error { \n`;
    strResult += `var ctx = context.Background() \n`;
    strResult += `conn, err := db.Pool.Conn(ctx) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n`;
    strResult += `defer conn.Close() \n`;
    strResult += `tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable}) \n`;
    strResult += `${errInternalError} \n\n`;
    strResult += `_, ComID := services.ExtractUserAndCompany(c) \n`;
    strResult += `repoBrands := repositories.NewRepoBrands(tx, &ctx, nil) \n`;
    strResult += `if err != nil { \n`;
    strResult += `return c.Status(fiber.StatusBadRequest).JSON(models.SendError(err.Error())) \n`;
    strResult += `} \n`;
    strResult += `defer conn.Close() \n\n`;
    strResult += `tx, err := conn.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable}) \n`;
    strResult += `${errInternalError} \n\n`;
    strResult += `repo${structName} := repositories.NewRepo${structName}(tx, &ctx, nil) \n`;
    strResult += `if err := repo${structName}.Delete(c.Params(paramID), ComID); err != nil { \n`;
    strResult += `tx.Rollback() \n`;
    strResult += `const errMessage = "Erro ao excluir ____, " \n`;
    strResult += `return tryErrorDB(c, errMessage, err.Error()) \n`;
    strResult += `} \n`;
    strResult += `tx.Commit() \n`;
    strResult += `return c.SendStatus(fiber.StatusNoContent) \n`;
    strResult += `} \n`;


}


function generateQuery() {

}

function generateQueryByID() {

}
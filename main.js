require('dotenv').config();
const fs = require('fs');

const dirMain = __dirname + '/src';
const dirModels = dirMain + '/models';
module.exports = {
    dirMain: dirMain,
    dirModels: dirModels
}

const db = require('./dbConfig/db');
const models = require('./models');

async function main() {
    //return tables for DB
    const tables = await db.getTables()

    createDirDefaults();

    //navigate colluns for table
    tables.forEach(async function(tbl) {
        //return collumns for table
        columns = await db.getColumns(tbl.TABLE_NAME);

        //generate Model for table
        models.generateModels(tbl, columns);
    });
}


//create the default directory
function createDirDefaults() {
    if (!fs.existsSync(dirMain)) {
        fs.mkdirSync(dirMain);
    }

    if (!fs.existsSync(dirModels)) {
        fs.mkdirSync(dirModels);
    }

}

main()
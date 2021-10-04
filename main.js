require('dotenv').config();
const fs = require('fs');

const dirMain = __dirname + '/prod';
const dirModels = dirMain + '/models';
const dirControllers = dirMain + '/controllers';
const dirRepositories = dirMain + '/repositories';
module.exports = {
    dirMain: dirMain,
    dirModels: dirModels,
    dirControllers: dirControllers,
    dirRepositories: dirRepositories
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

    if (fs.existsSync(dirMain)) {
        fs.rmdirSync(dirMain, { recursive: true });
    }
    fs.mkdirSync(dirMain);
    fs.mkdirSync(dirModels);
    fs.mkdirSync(dirControllers);
    fs.mkdirSync(dirRepositories);
}

main()
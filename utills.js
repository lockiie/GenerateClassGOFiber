exports.formatStructName = (tableName) => {
    return formatName(tableName, process.env.PREFIXE_TABLE_NAME.length)
}

function formatName(name, count) {
    let strResult = "";
    for (let i = count, n = name.length; i < n; i++) {
        let charName = name[i].toLowerCase();
        if (charName === '_') {
            i++
            charName = name[i].toUpperCase();
        }
        strResult += charName;
    }
    return strResult[0].toUpperCase() + strResult.substr(1);

}

exports.formatStructAtr = (columnName) => {
    return formatName(columnName, process.env.PREFIXE_COLLUMN);
}
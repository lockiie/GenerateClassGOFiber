exports.formatStructName = (tableName) => {
    return formatName(tableName, process.env.PREFIXE_TABLE_NAME.length)
}

function formatName(name, count) {
    let strResult = "";
    if (name.substr(count).toLowerCase() === 'id') {
        return (capitalize(name.substr(0, count)) + name.substr(count).toUpperCase()).replace('_', '');
    }
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

function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1).toLowerCase();
}

exports.formatNickName = (tableName, uppercase = false) => {
    if (uppercase)
        return tableName[0].toUpperCase()
    else
        return tableName[0].toLowerCase()
}
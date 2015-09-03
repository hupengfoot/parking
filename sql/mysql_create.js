var fileName = process.argv[2];
var fileNameNew = fileName.replace(".sql", "_new.sql");
console.log("sql file is " + fileName);
var fs = require('fs');
var tables = require("./mysql_define").tables;

/*
String.prototype.regexIndexOf = function(regex, startpos){
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
*/

var newSql = "";
var tableCount = tables.length;
console.log("config table is " + tableCount);
console.log(JSON.stringify(tables));

fs.readFile(fileName, function(err, data){
    data = data.toString();
    var totalLength = data.length;
    console.log("file size is " + data.length);
    var startIndex = 0;
    while(true){
        startIndex = data.indexOf("create table", startIndex);
        var endIndex = data.indexOf("create table", startIndex + 1);
        if(endIndex === 0 || endIndex == -1) endIndex = totalLength-1;
        var sql = data.substring(startIndex, endIndex);
        var tSql = sql.replace(" ", "");
        var finded = false;
        for(var i=0; i!=tableCount; ++i){
            if(tSql.indexOf(tables[i].table+"(") != -1){
                console.log("-------------------------");
                console.log(tables[i].table);
                console.log("-------------------------");
                finded = true;
                for(var j=0; j!=tables[i].count; ++j){
                    newSql += sql.replace(tables[i].table, tables[i].table + "_" + j);
                }
            }
        }
        if(!finded){
            newSql += sql;
        }
        startIndex = endIndex;
        if(endIndex >= totalLength-1) break;
    }
    fs.writeFileSync(fileNameNew, newSql);
    console.log("new file is " + fileNameNew);
});


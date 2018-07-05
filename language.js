const fs = require('fs');

function loadLanguages(){
    let languages = [];
    const files = fs.readdirSync(__dirname + '/languages');
    files.forEach(element => {
        const data = fs.readFileSync(__dirname + '/languages/' + element, "utf8");
        languages.push(JSON.parse(data));
    });
    console.log("Language is loaded");
    return languages;
}

module.exports = {
    loadLanguages
}
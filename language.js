const fs = require('fs');
const readline = require('readline');
const stream = require('stream');

function checkLanguage(sentence) {
    const arr = sentence.match(/\S+/g);
    let promises = [];
    if (arr){
        arr.forEach(elt => {
            const word = elt.toLowerCase();
            const letter = word.substring(0, 1);
            fs.readdirSync(`${__dirname}/lemmatization`).forEach(language => {
                const path = `${__dirname}/lemmatization/${language}/${letter}.txt`;
                if (fs.existsSync(path)){
                    const promise = checkWordLanguage(path, word, language);
                    promises.push(promise);
                }
            })
        });
        Promise.all(promises).then(values => {
            const langArray = Object.entries(createLangObject(values))
                                    .map(([key, value]) => ({key,value}))
            if (langArray.length > 0){
                const language = langArray.reduce((prev, current) => prev.value > current.value ? prev : current);
                console.log(`Detected language: ${language.key}`);
            }
            else
                console.log("Please check your spelling");
        });
    }
}

function createLangObject(values){
    let obj = {};
    values.forEach(element => {
        if (element != null)
            obj[element] = (obj[element] == null) ? 1 : obj[element] + 1;
    });
    return obj;
}

function checkWordLanguage(path, word, targetLang) {
    return new Promise((resolve) => {
        const instream = fs.createReadStream(path),
            outstream = new stream(),
            rl = readline.createInterface(instream, outstream);
        rl.on('line', line => {
            let arr = line.match(/\S+/g);
            if (arr[0] === word || arr[1] === word) {
                resolve(targetLang);
                rl.close();
            }
        });
        rl.on('close', () => {
            resolve();
        });
    })
}

module.exports = {
    checkLanguage
}
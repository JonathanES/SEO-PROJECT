const fs = require('fs');
const readline = require('readline');
const stream = require('stream');

function createDictionnary(language) {
    const   instream = fs.createReadStream(`${__dirname}/lemmatization-fr.txt`),
            outstream = new stream(),
            rl = readline.createInterface(instream, outstream);
    let counter = 0;
    rl.on('line', line => {
        console.log(`Processing element nb: ${counter}`);
        counter++;
        let letter = line.substring(0, 1);
        fs.appendFile(`${__dirname}/lemmatization/${language}/${letter}.txt`, `${line}\r\n`, function (err) {
            console.log(err);
        })
    });
    rl.on('close', function (line) {
        console.log(line);
        console.log('done reading file.');
    });
}

module.exports = {
    createDictionnary
}
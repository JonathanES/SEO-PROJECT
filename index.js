const fs = require('fs');

const files = fs.readdirSync(__dirname + '/files');
files.forEach(element => {
    fs.readFile(__dirname + '/files/' + element, "utf8", (err, data) => {
        if (err) throw err;
        console.log(data);
        const wordsRegexp = /[a-zA-Z']+/g;
        const words = new Map();
        data.replace(wordsRegexp, function (word) {
            const n = words.get(word);
            if (n) {
                words.set(word, 1 + n);
            } else {
                words.set(word, 1);
            }
        });
        console.log(words);
      });
});




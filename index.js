const fs = require('fs');

function generateNgrams(N, words) {
    return new Promise((resolve, reject) => {
        const ngramList = [];
        for (let k = 0; k < (words.length - N + 1); k++) {
            let s = "";
            const start = k;
            const end = k + N;
            for (let j = start; j < end; j++) {
                s = s + " " + words[j];
            }
            ngramList.push(s);
        }
        resolve(ngramList);
    });
}


const files = fs.readdirSync(__dirname + '/files');
files.forEach(element => {
    fs.readFile(__dirname + '/files/' + element, "utf8", (err, data) => {
        if (err) throw err;
        const N = [1, 2, 3, 4, 5]
        const wordsRegexp = /[a-zA-Z']+/g;
        const words = [];
        data.replace(wordsRegexp, function (word) {
            words.push(word);
        });
        N.forEach(element => {
            const promise = generateNgrams(element, words);
            promise.then(ngramList => {
                var counts = {};
                ngramList.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
                console.log("count ngram " + JSON.stringify(counts));
            })
        });

    });
});




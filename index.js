const fs = require('fs');
const math = require('mathjs')

function generateNgrams(N, words) {
    return new Promise((resolve, reject) => {
        const ngramList = [];
        for (let k = 0; k < (words.length - N + 1); k++) {
            let s = "";
            const start = k;
            const end = k + N;
            for (let j = start; j < end; j++) {
                if (j === start)
                    s += words[j];
                else
                    s = s + " " + words[j];
            }
            ngramList.push(s);
        }
        resolve(ngramList);
    });
}


/**
 * @param docs list of list of strings represents the dataset
 * @param term String represents a term
 * @return the inverse term frequency of term in documents
 */
function idf(docs, term) {
    return new Promise((resolve, reject) => {
        let n = 0;
        let count = 0;
        docs.forEach(doc => {
            doc.forEach(word => {
                if (term === word)
                    n++;
            });
            count++;
        });
        if (count === docs.length)
            resolve(math.log((docs.length / n)));
    });
}


function getDocuments() {
    return new Promise((resolve, reject) => {
        const files = fs.readdirSync(__dirname + '/files');
        const documents = [];
        files.forEach(element => {
            fs.readFile(__dirname + '/files/' + element, "utf8", (err, data) => {
                if (err) throw err;
                // const N = [1, 2, 3, 4, 5]
                const N = [1];
                const wordsRegexp = /[a-zA-Z']+/g;
                const words = [];
                data.replace(wordsRegexp, function (word) {
                    words.push(word);
                });
                N.forEach(element => {
                    const promise = generateNgrams(element, words);
                    promise.then(ngramList => {
                        documents.push(ngramList);
                        if (files.length === documents.length)
                            resolve(documents);
                    })
                });
            });
        });
    });
}

function tfIdf() {
    const promise = getDocuments();
    promise.then(documents => {
        const counts = {};
        documents[0].forEach(x => { counts[x] = ((counts[x] || 0) + 1) / documents[0].length; });
        // console.log("count ngram " + JSON.stringify(counts));
        const idfResult = idf(documents, "ipsum");
        idfResult.then(res => {
            console.log(counts.ipsum * res);
        })
    });
}
tfIdf();


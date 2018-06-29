const fs = require('fs');

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
    * @param doc  list of strings
    * @param term String represents a term
    * @return term frequency of term in document
    */
function tf(doc, term) {
    return new Promise((resolve, reject) => {
        let result = 0;
        doc.forEach(word => {
            if (word === term)
                result++;
        })
        result /= doc.length;
        resolve(result);
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
            for (word in doc) {
                if (term === doc[word]) {
                    n++;
                    break;
                }
            }
            count++;
        });
        if (count === docs.length)
            resolve(Math.log((docs.length / n)));
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
        documents.forEach(doc => {
            console.log("the document that we are gonna analyze " + doc);
            doc.forEach(word => {
                const idfResult = idf(documents, word);
                const tfResult = tf(doc, word);
                Promise.all([tfResult, idfResult]).then(values => {
                    console.log(word + " " + values[0] * values[1]);
                });
            });
            console.log("");
        });
    });
}
tfIdf();


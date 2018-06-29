const fs = require('fs');
const stdin = process.openStdin();

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
            for (word in doc)
                if (term === doc[word]) {
                    n++;
                    break;
                }
            count++;
        });
        if (count === docs.length)
            resolve(Math.log10((docs.length / n)));
    });
}

function readInput() {
    return new Promise((resolve, reject) => {
        console.log("Please enter a value for the n-grams (value between 1 and 5) : ")
        stdin.addListener("data", function (d) {
            const val = parseInt(d.toString().trim());
            console.log("you entered: [" +
            d.toString().trim() + "] which is in number " + val);
            if (val) {
                resolve(val);
                stdin.pause();
            }
            else
                readInput();
        });
    });
}

function getDocuments(input) {
    return new Promise((resolve, reject) => {
        const files = fs.readdirSync(__dirname + '/files');
        const documents = [];
        files.forEach(element => {
            fs.readFile(__dirname + '/files/' + element, "utf8", (err, data) => {
                if (err) throw err;
                // const N = [1, 2, 3, 4, 5]
                const N = [input];
                data = (data).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@?+'’]/g, " ");
                data = (data).replace(/\s{2,}/g, " ");
                let words = data.split(" ");
                words = words.filter(elt => elt.length > 0)
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
    const input = readInput();
    input.then(inputValue => {
        const promise = getDocuments(inputValue);
        promise.then(documents => {
            const arrayOfTfidfResult = [];
            let n = 0;
            documents.forEach(doc => {
                let x = 0;
                let tfidfResult = new Map();
                doc.forEach(word => {
                    const idfResult = idf(documents, word);
                    const tfResult = tf(doc, word);
                    Promise.all([tfResult, idfResult]).then(values => {
                        tfidfResult.set(word, values[0] * values[1]);
                        x++;
                        if (x === doc.length) {
                            arrayOfTfidfResult.push(tfidfResult);
                            n++;
                        }
                        if (n === documents.length)
                            console.log(arrayOfTfidfResult);
                    });
                });
            });
        });
    })
}
tfIdf();


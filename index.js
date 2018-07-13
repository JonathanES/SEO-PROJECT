const fs = require('fs');
const { detectLanguage } = require('./languageDetector');
const { loadLanguages } = require('./language');

const languages = loadLanguages();
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
            for (word in doc.ngram)
                if (term === doc.ngram[word]) {
                    n++;
                    break;
                }
            count++;
        });
        if (count === docs.length)
            resolve(Math.log10((docs.length / n)) + 1);
    });
}

function readInput() {
    return new Promise((resolve, reject) => {
        console.log("Please enter a value for the n-grams (value between 1 and 5) : ");
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
        files.forEach(name => {
            fs.readFile(__dirname + '/files/' + name, "utf8", (err, data) => {
                if (err) throw err;
                const N = [input];
                data = (data).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@?+'’»«]/g, " ");
                data = (data).replace(/\s{2,}/g, " ");
                data = data.toLowerCase();
                console.log(name);
                detectLanguage(data, languages);
                console.log();
                let words = data.split(" ");
                words = words.filter(elt => elt.length > 2)

                N.forEach(element => {
                    const promise = generateNgrams(element, words);
                    promise.then(ngramList => {
                        documents.push({
                            name: __dirname + '/files/' + name,
                            ngram: ngramList
                        });
                        if (files.length === documents.length)
                            resolve(documents);
                    })
                });
            });
        });
    });
}

function findKeyWords(array, documents) {
    const keywords = [];
    let n = 1;
    array.forEach(element => {
        let elementArray = [];
        element.result.forEach((value, key) => {
            elementArray.push({ name: key, value: value })
        }
        );
        const sorted = elementArray.sort(function (a, b) {
            return b.value - a.value;
        });

        console.log(element.name)
        if (sorted.length > 5)
            for (let i = 0; i < 5; i++)
                console.log(sorted[i]);
        else
            for (let i = 0; i < sorted.length; i++)
                console.log(sorted[i]);
        n++;
        console.log()
    });
}

function tfIdf() {
    const input = readInput();
    input.then(inputValue => {
        const promise = getDocuments(inputValue);
        promise.then(documents => {
            const arrayOfTfidfResult = [];
            let n = 0;
            documents.forEach(ngObj => {
                let x = 0;
                let tfidfResult = new Map();
                if (ngObj.ngram.length === 0) {
                    console.log(`${ngObj.name}: Ngramme trop grand`)
                    n++;
                }

                ngObj.ngram.forEach(word => {
                    const idfResult = idf(documents, word);
                    const tfResult = tf(ngObj.ngram, word);
                    Promise.all([tfResult, idfResult]).then(values => {
                        tfidfResult.set(word, values[0] * values[1]);
                        if (++x === ngObj.ngram.length) {
                            arrayOfTfidfResult.push({
                                name: ngObj.name,
                                result: tfidfResult
                            });
                            n++;
                        }

                        if (n === documents.length)
                            findKeyWords(arrayOfTfidfResult);
                    });
                });
            });
        });
    })
}

tfIdf();
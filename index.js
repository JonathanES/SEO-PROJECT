const fs = require('fs');
const {detectLanguage} = require('./languageDetector');
const {loadLanguages} = require('./language');

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
            for (word in doc)
                if (term === doc[word]) {
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
                data = (data).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@?+'’»«]/g, " ");
                data = (data).replace(/\s{2,}/g, " ");
                data = data.toLowerCase();
                let words = data.split(" ");
                words = words.filter(elt => elt.length > 2)
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

function findKeyWords(array) {
    const keywords = [];
    let n = 1;
    array.forEach(element => {
        let elementArray = [];
        element.forEach((value, key) => {
            elementArray.push({name: key, value: value})
          }
        );   
        const sorted = elementArray.sort(function(a, b) {
            return b.value - a.value;
          });
        for (let i = 0; i < 5; i++)     
            console.log(sorted[i]);
        console.log(n);
        n++;
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
                            findKeyWords(arrayOfTfidfResult);
                        //console.log(arrayOfTfidfResult);
                    });
                });
            });
        });
    })
}


// const bigFr = `C'est une sympathique fonctionnalité qu'inaugure Google pour Google Maps. En s'appuyant sur
// son imagerie Street View qui propose des vues à 360° au niveau du sol, Google propose de
// remonter le temps.
// Street-View-Freedom-TowerPlutôt bien vu de tirer ainsi parti de la colossale base de données
// Street View et pour laquelle on apprend par la même occasion que Google conserve les clichés
// remontant jusqu'en 2007, soit la date de lancement aux États-Unis.
// À travers les années, certains lieux ont eu droit à plusieurs passages des véhicules Street View.
// C'est ce qui permet aujourd'hui d'effectuer ce voyage dans le temps. Une telle fonctionnalité avait
// en tout cas fait l'objet de demandes fréquentes d'utilisateurs de Google Maps.
// Le cas échéant, soit lorsque d'anciennes photos sont disponibles, elle prend aujourd'hui la forme
// d'une horloge qui apparaît dans la partie supérieure gauche d'une image Street View. Un curseur
// permet d'affiner le voyage dans la nouvelle dimension temporelle.
// Cette fonctionnalité est accessible avec le nouveau Google Maps sur l'ordinateur et pas pour les
// applications mobiles. Tout le monde ne sera pas immédiatement servi. Le déploiement est en
// cours. En attendant d'être concerné, la vidéo ci-dessous fait les présentations :`;

// const bigEspagnol = `Por estas razones, la comunidad de Wikipedia en español ha decidido oscurecer todas 
// las páginas de la enciclopedia antes y durante la votación del texto, esto es, hasta las 10 h (UTC) del 5 de julio. 
// Queremos seguir ofreciendo una obra abierta, libre, colaborativa y gratuita con contenido verificable. 
// Llamamos a todos los miembros del Parlamento Europeo a votar en contra del texto actual, a abrirlo a discusión y a considerar
// las numerosas propuestas del movimiento Wikimedia para proteger el acceso al conocimiento; entre ellas, la eliminación de los artículos 11 y 13,
// la extensión de la libertad de panorama a toda la UE y la preservación del dominio público`;

// const bigGerman = `Außerdem gehören die im Mittelmeer gelegenen Balearen und die Kanaren im Atlantik sowie die an der nordafrikanischen Küste
//  gelegenen Städte Ceuta und Melilla zum Staatsgebiet. In Frankreich besitzt Spanien die Exklave Llívia. Weiter gehören Spanien mehrere unmittelbar 
//  vor der marokkanischen Küste gelegene Inseln: Islas Chafarinas, Peñón de Alhucemas, Isla del Perejil, dazu die Halbinsel Peñón de Vélez de la Gomera. 
//  Die Isla de Alborán liegt 50 Kilometer nördlich der marokkanischen Küste. Eine weitere Gruppe kleiner Inseln und Felsen, die Islas Columbretes, 
//  liegt etwa 55 Kilometer östlich von Castellón de la Plana, auf demselben Breitengrad wie Mallorca.`;


//  const bigJapan = `7世紀の後半の国際関係から生じた「日本」国号は、当時の国際的な読み（音読）で「ニッポン」（呉音）ないし「ジッポン」（漢音）と読まれたものと推測される[6]。いつ「ニホン」の読みが始まったか定かでない。仮名表記では「にほん」と表記された。平安時代には「ひのもと」とも和訓されるようになった。

//  室町時代の謡曲・狂言は、中国人に「ニッポン」と読ませ、日本人に「ニホン」と読ませている。安土桃山時代にポルトガル人が編纂した『日葡辞書』や『日本小文典』等には、「ニッポン」「ニホン」「ジッポン」の読みが見られ、その用例から判断すると、改まった場面・強調したい場合に「ニッポン」が使われ、日常の場面で「ニホン」が使われていた[7]。このことから小池清治は、中世の日本人が中国語的な語感のある「ジッポン」を使用したのは、中国人・西洋人など対外的な場面に限定されていて、日常だと「ニッポン」「ニホン」が用いられていたのでは、と推測している[8]。なお、現在に伝わっていない「ジッポン」音については、その他の言語も参照`


// detectLanguage(bigFr, languages);
// detectLanguage(bigEspagnol, languages);
// detectLanguage(bigGerman, languages);
// detectLanguage(bigJapan, languages);

//tfIdf();
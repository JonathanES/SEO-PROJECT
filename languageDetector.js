const {generateTrigrams} = require('./trigram');

function detectLanguage(input, languages){
    const triGrams = generateTrigrams(input);
    const result = {};
    for (let key in triGrams) {
        languages.forEach(language => {
            if (language.freq[key] != null){
                const nbLetters = key.length;
                const prob = language.freq[key] * triGrams[key] / language.n_words[nbLetters - 1];
                result[language.name] = result[language.name] ? result[language.name] + prob : prob;
            }
        });
    }
    let saveKey = null;
    for (let key in result){
        if (result[key] > (result[saveKey] || 0))
            saveKey = key
    }
    console.log("Your language is: " + saveKey);
    console.log("Finished processing");
}

module.exports = {
    detectLanguage
}
function generateTrigrams(input){
    input = input.replace(/\s/g, "_");
    let triGrams = {};
    for (let i = 0; i < input.length - 2; i++) {
        let subStr = input.substr(i, 3);
        if (subStr[1] != "_"){
            subStr = subStr.replace("_", "");
            triGrams[subStr] = triGrams[subStr] ? triGrams[subStr] + 1 : 1;
        }
    }
    return triGrams;
}

module.exports = {
    generateTrigrams
}
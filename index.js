const fs = require('fs');

const files = fs.readdirSync(__dirname + '/files');
files.forEach(element => {
    fs.readFile(__dirname + '/files/' + element, "utf8", (err, data) => {
        if (err) throw err;
        console.log(data);
      });
});




const express = require('express');
const fs = require('fs');

const app = express();

const routes = require('./backend/routes');
app.use('/', routes);

app.listen(8080);
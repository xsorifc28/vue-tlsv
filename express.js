const express = require('express');
const compression = require('compression');
const port = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(express.static('dist'));

app.listen(port, () => console.log(`App is listening on port ${port}.`));

app.get('/', function (req, res) {
  res.sendFile('dist/index.html');
});
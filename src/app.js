require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/Router');

require('./database/Index');

const server = express();
const PORT = process.env.PORT || 5555;

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(router);

server.listen(PORT, () => {
  console.log(`> Servidor rodando na porta: ${PORT}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = require("./app.js");
const config = require("../config.js");

const server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(
  `${config.baseUrl}`,
  express.static(path.join(__dirname, "/public"))
);

/**
 * Users are redirected here during installation on a workspace
 */
server.get(`${config.baseUrl}/install`, app.install);

/**
 * When a user types a /roulette command
 */
server.post(`${config.baseUrl}/command`, app.processCommand);

/**
 * When a user sends an action
 */
server.post(`${config.baseUrl}/action`, app.processAction);

server.listen(config.port, () =>
  console.log(`Review Roulette server is listening on port ${config.port}!`)
);

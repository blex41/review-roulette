/**
 * The './env.json' file should look like this (fake example):
{
  "client_id": "123456789012.123456789012",
  "client_secret": "0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
  "siteUrl": "https://example.com",
  "baseUrl": "/subfolder",
  "port": 80
}
 */
const appInfo = require("./env.json");

module.exports = {
  ...appInfo,
  // One of these will be displayed below a request for review
  gifs: [
    // Michael Scott
    "https://media.giphy.com/media/ui1hpJSyBDWlG/giphy.gif",
    // Dexter
    "https://media.giphy.com/media/S2u9Ldmx480O4/giphy.gif",
    // I'm watching you
    "https://media.giphy.com/media/BtedgmzGNCiuk/giphy.gif",
    // Judge Judy
    "https://media.giphy.com/media/Emg9qPKR5hquI/giphy.gif",
    // Boy meets world
    "https://media.giphy.com/media/SCRqBAU2nNUuQ/giphy.gif",
    // Dicaprio
    "https://media.giphy.com/media/Cj3Ce7e8h2EKY/giphy.gif",
    // Obama
    "https://media.giphy.com/media/l0ErBTfnwCom6mFPi/giphy.gif",
    // Robocop
    "https://media.giphy.com/media/U8bDgsXcnIEFy/giphy.gif"
  ]
};

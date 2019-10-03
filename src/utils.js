const fs = require("fs");
const path = require("path");
const axios = require("axios");
const _difference = require("lodash/difference");
const config = require("../config.js");

const dataFilePath = path.join(__dirname, "..", "data.json");

/**
 * Returns an array of user entities found in a string
 * @param {string} str
 */
const extractUserEntities = str => {
  const regex = /<@([^>\|]+)[^>]*>/g;
  let match,
    results = [];
  do {
    match = regex.exec(str);
    if (match) {
      results.push(match[1]);
    }
  } while (match !== null);
  return results;
};

/**
 * Returns an group found in a command
 * @param {string} str
 */
const extractGroup = str => {
  return str.replace(/<@.*>/g, '').trim().split(" ")[1];
};

/**
 * Loads the data file and returns its contents
 */
const loadData = () => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    return data;
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(
        "No data file was found. A new one will be created during the next backup."
      );
    } else {
      console.error("An error occurred during data loading.", e);
    }
    return { teams: {} };
  }
};

/**
 * Saves the given object into the data file
 */
const backupData = data => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, 0, 2));
  } catch (e) {
    console.error("An error occurred during data backup.", e);
  }
};

/**
 * Sends a delayed response to a user or a channel
 * @param {*} commandInfo
 * @param {*} response
 */
const sendDelayedResponse = async (commandInfo, response) => {
  try {
    await axios.post(commandInfo.response_url, response);
  } catch (e) {
    console.error("An error occured while sending the delayed response.", e);
  }
};

/**
 * Calls a Slack Web API method with the given data and options
 * @param {*} method
 * @param {*} data
 * @param {*} options
 */
const callSlackMethod = async (method, data, options = {}) => {
  return await axios({
    method: options.method || "POST",
    url: `https://slack.com/api/${method}`,
    data: data,
    headers: {
      ...(options.bearer ? { authorization: `Bearer ${options.bearer}` } : {})
    }
  });
};

/**
 * Randomly selects an item in an array not in the other array
 * @param {*} arrayToPick
 * @param {*} arrayToExclude
 */
const getRandomIn = (arrayToPick, arrayToExclude) => {
    if (!arrayToPick.length) {
      return undefined;
    } else {
      const chosenValues = _difference(arrayToPick, arrayToExclude);
      return chosenValues[Math.floor(Math.random() * chosenValues.length)];
    }
  };

/**
 * Returns a random Gif from the configuration file
 */
const getRandomGif = () => {
  return config.gifs.length ? config.gifs[Math.floor(Math.random() * config.gifs.length)] : null;
};

module.exports = {
  extractUserEntities,
  extractGroup,
  loadData,
  backupData,
  sendDelayedResponse,
  getRandomGif,
  getRandomIn,
  callSlackMethod
};

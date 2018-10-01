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
 * Randomly selects an item in an array,
 * making sure every item is only picked once per round
 */
const getRandomIn = (() => {
  const cachedArrays = [];
  const chosenValues = [];

  return arr => {
    let cachedArrayIndex = cachedArrays.findIndex(a => a === arr);
    let remainingChoices;
    if (cachedArrayIndex > -1) {
      if (chosenValues[cachedArrayIndex].length >= arr.length) {
        chosenValues[cachedArrayIndex] = [];
      }
      remainingChoices = _difference(arr, chosenValues[cachedArrayIndex]);
    } else {
      cachedArrayIndex = cachedArrays.length;
      cachedArrays.push(arr);
      chosenValues.push([]);
      remainingChoices = arr;
    }
    if (!remainingChoices.length) {
      return null;
    } else {
      const choice =
        remainingChoices[Math.floor(Math.random() * remainingChoices.length)];
      chosenValues[cachedArrayIndex].push(choice);
      return choice;
    }
  };
})();

/**
 * Returns a random Gif from the configuration file
 */
const getRandomGif = () => {
  return config.gifs.length ? getRandomIn(config.gifs) : null;
};

module.exports = {
  extractUserEntities,
  loadData,
  backupData,
  sendDelayedResponse,
  getRandomGif,
  getRandomIn,
  callSlackMethod
};

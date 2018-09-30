const _get = require("lodash/get");
const _set = require("lodash/set");
const _merge = require("lodash/merge");
const _uniq = require("lodash/uniq");
const _difference = require("lodash/difference");
const utils = require("./utils.js");

const roulette = {
  data: null,
  /**
   * Load previously saved data
   */
  init() {
    roulette.data = utils.loadData();
  },
  /**
   * Get review candidates in a channel
   * @param {string} teamId
   * @param {string} channelId
   */
  getCandidates(teamId, channelId) {
    return _get(roulette.getChannel(teamId, channelId), "candidates", []);
  },
  /**
   * Get the maximum number of candidates available for a user's review
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} askingUser
   */
  getMaxReviewers(teamId, channelId, askingUser) {
    const available = roulette.getAvailableReviewers(
      teamId,
      channelId,
      askingUser
    );
    return available.length;
  },
  /**
   * Get the candidates available for a user's review
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} askingUser
   */
  getAvailableReviewers(teamId, channelId, askingUser) {
    const all = roulette.getCandidates(teamId, channelId);
    return _difference(all, [askingUser]);
  },
  /**
   * Get local data about a channel
   * @param {string} teamId
   * @param {string} channelId
   */
  getChannel(teamId, channelId) {
    return _get(roulette.data, `teams[${teamId}].channels[${channelId}]`);
  },
  /**
   * Add candidates to a channel
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} newCandidates
   */
  addCandidates(teamId, channelId, newCandidates) {
    const oldCandidates = roulette.getCandidates(teamId, channelId);
    const updatedCandidates = _uniq(oldCandidates.concat(newCandidates));
    return roulette.setCandidates(teamId, channelId, updatedCandidates);
  },
  /**
   * Remove candidates in a channel
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} candidates
   */
  removeCandidates(teamId, channelId, candidates) {
    const oldCandidates = roulette.getCandidates(teamId, channelId);
    const updatedCandidates = _difference(oldCandidates, candidates);
    return roulette.setCandidates(teamId, channelId, updatedCandidates);
  },
  /**
   * Selects a candidate for a review
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} askingUser
   * @param {number} count
   */
  selectRandomCandidates(teamId, channelId, askingUser, count) {
    const channel = roulette.getChannel(teamId, channelId);
    if (!channel.hasOwnProperty("eligibleCandidates")) {
      channel.eligibleCandidates = [];
    }
    const candidates = roulette.getAvailableReviewers(
      teamId,
      channelId,
      askingUser
    );
    const chosenUsers = [];

    do {
      // We remove the chosen users from potential candidates
      const eligibleCandidates = _difference(candidates, chosenUsers);
      // The random selection process ensures that candidates
      // are only chosen once per round. To keep track of this,
      // we need a fixed reference to the array of eligible candidates.
      // This is why there is a splice here instead of an assignment:
      channel.eligibleCandidates.splice(
        0,
        channel.eligibleCandidates.length,
        ...eligibleCandidates
      );
      const chosenUser = utils.getRandomIn(channel.eligibleCandidates);
      chosenUsers.push(chosenUser);
    } while (chosenUsers.length < count);

    return chosenUsers;
  },
  /**
   * Sets candidates for a channel
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} candidates
   */
  setCandidates(teamId, channelId, candidates) {
    _set(
      roulette.data,
      `teams[${teamId}].channels[${channelId}].candidates`,
      candidates
    );
    utils.backupData(roulette.data);
    return candidates;
  },
  /**
   * Creates or updates a team with the given info
   * @param {string} teamId
   * @param {object} info
   */
  updateTeamData(teamId, info) {
    const oldData = _get(roulette.data, `teams[${teamId}]`, { channels: {} });
    const updatedData = _merge(oldData, info);
    _set(roulette.data, `teams[${teamId}]`, updatedData);
    utils.backupData(roulette.data);
    return true;
  },
  /**
   * Returns the bearer for a team
   * @param {string} teamId
   */
  getBearer(teamId) {
    return _get(roulette.data, `teams[${teamId}].token`);
  }
};

roulette.init();

module.exports = roulette;

const _get = require("lodash/get");
const _set = require("lodash/set");
const _merge = require("lodash/merge");
const _uniq = require("lodash/uniq");
const _difference = require("lodash/difference");
const utils = require("./utils.js");
const _flatMap = require("lodash/flatMap");
const _cloneDeep = require('lodash/cloneDeep');

const roulette = {
  data: null,
  /**
   * Load previously saved data
   */
  init() {
    roulette.data = utils.loadData();

    //make sure the roulette.data as the latest format
    roulette.updateDataToNewGroupFormat();
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
     * Get the list of groups available for a user's review
     * @param {string} teamId
     * @param {string} channelId
     * @param {array} askingUser
     */
    getGroups(teamId, channelId, askingUser) {
        const all = roulette.getAvailableReviewers(teamId, channelId, askingUser);
        return _uniq(_flatMap(all, c => c.groups));
    },
  /**
   * Get the candidates available for a user's review
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} askingUser
   */
  getAvailableReviewers(teamId, channelId, askingUser) {
    const all = roulette.getCandidates(teamId, channelId);
    return all.filter(c => c.name !== askingUser);
  },
  /**
   * Get the candidates available for a user's review
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} askingUser
   * @param {string} group
   */
  getAvailableReviewersForAGroup(teamId, channelId, askingUser, group) {
    const all = roulette.getAvailableReviewers(teamId, channelId, askingUser);
    if (group === "all") {
      return all
    } else {
      return all.filter(c => c.groups.indexOf(group) > -1);
    }
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
   * Add candidates to groups in a channel
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} newCandidates
   * @param {array} groups
   */
  addCandidatesToGroups(teamId, channelId, newCandidates, groups) {
    const oldCandidates = roulette.getCandidates(teamId, channelId);
    const updatedCandidates = roulette.mergeCandidatesWithGroup(oldCandidates, newCandidates, groups);
    return roulette.setCandidates(teamId, channelId, updatedCandidates);
  },
  /**
   * Merge candidates with groups
   * @param {array} oldCandidates
   * @param {array} newCandidates
   * @param {array} groups
   */
  mergeCandidatesWithGroup(oldCandidates, newCandidates, groups) {

    const newCandidatesToProceed = _cloneDeep(newCandidates);

    oldCandidates.filter(c => newCandidatesToProceed.indexOf(c.name) > -1)
        .forEach(c => {
            _set(c, "groups", _uniq(c.groups.concat(groups)));
            newCandidatesToProceed.splice(newCandidatesToProceed.indexOf(c.name), 1);
        });

    const newCandidatesObject = newCandidatesToProceed.map(c => ({"name": c, groups: groups}));

    return oldCandidates.concat(newCandidatesObject);
  },
  /**
   * Remove candidates in a channel
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} candidatesToRemove
   */
  removeCandidates(teamId, channelId, candidatesToRemove) {
    const oldCandidates = roulette.getCandidates(teamId, channelId);
    const updatedCandidates = oldCandidates.filter(c => candidatesToRemove.indexOf(c.name) === -1);
    return roulette.setCandidates(teamId, channelId, updatedCandidates);
  },
    /**
     * Remove candidates from groups in a channel
     * @param {string} teamId
     * @param {string} channelId
     * @param {array} candidates
     * @param {array} groupsToRemove
     */
    removeCandidatesFromGroups(teamId, channelId, candidates, groupsToRemove) {
        const oldCandidates = roulette.getCandidates(teamId, channelId);
        oldCandidates.filter(c => candidates.indexOf(c.name) > -1)
            .forEach(c => {
                _set(c, "groups", _difference(c.groups, groupsToRemove));
            });
        return roulette.setCandidates(teamId, channelId, oldCandidates);
    },
  /**
   * Selects a candidate for a review
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} askingUser
   * @param {number} count
   * @param {string} group
   */
  selectRandomCandidates(teamId, channelId, askingUser, count, group) {
    const channel = roulette.getChannel(teamId, channelId);
    if (!channel.hasOwnProperty("notEligibleUsers")) {
      channel.notEligibleUsers = [];
    }
    const candidates = roulette.getAvailableReviewersForAGroup(
      teamId,
      channelId,
      askingUser,
        group
    );
    const chosenUsers = [];

    // Cannnot select more than candidate count
    const updatedCount = count > candidates.length ? candidates.length : count;

    do {
      // We remove the chosen users from potential candidates
      const eligibleCandidates = candidates.filter(c =>  chosenUsers.indexOf(c.name) === -1);

      // Get randomly a candidate in eligibleCandidates not in notEligibleUsers
      const chosenUser = utils.getRandomIn(eligibleCandidates.map(c => c.name), channel.notEligibleUsers);

      if (chosenUser === undefined) {
        // No one can be picked
        if (!eligibleCandidates.length) {
          // No more eligible candidates
          break;
        } else {
          // Remove eligible candidates from notEligibleUsers
          channel.notEligibleUsers = _difference(channel.notEligibleUsers, eligibleCandidates.map(c => c.name))
          continue;
        }
      }

      chosenUsers.push(chosenUser);
    } while (chosenUsers.length < updatedCount);

    // All chosenUsers in notEligibleUsers
    roulette.setNotEligibleUsers(teamId, channelId, channel.notEligibleUsers.concat(chosenUsers));

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
   * Sets not eligible users for a channel
   * @param {string} teamId
   * @param {string} channelId
   * @param {array} notEligibleUsers
   */
  setNotEligibleUsers(teamId, channelId, notEligibleUsers) {
    _set(
        roulette.data,
        `teams[${teamId}].channels[${channelId}].notEligibleUsers`,
        notEligibleUsers
    );
    utils.backupData(roulette.data);
    return notEligibleUsers;
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
   * Update roulette data for the new group format
   */
  updateDataToNewGroupFormat() {
    const oldData = roulette.data;

    const oldVersion  = _get(oldData, `version`, "0");
    if (oldVersion === "1") {
      return true;
    }

    const updatedData = {
      version: "1",
      teams: {}
    };

    for (let [teamId, oldTeamData] of Object.entries(oldData.teams)) {

      const updatedTeamData = {
        channels: {},
        token: oldTeamData.token,
        name: oldTeamData.name
      };

      for (let [channelId, oldChannelValue] of Object.entries(oldTeamData.channels)) {
        const candidates = _get(oldChannelValue, `candidates`, []);
        const newCandidatesWithGroups = candidates.map(c => ({name: c, groups: []}));
        _set(updatedTeamData, `channels[${channelId}].candidates`, newCandidatesWithGroups);
      }

      _set(updatedData, `teams[${teamId}]`, updatedTeamData);
    }

    roulette.data = updatedData;
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

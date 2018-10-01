const roulette = require("./roulette.js");
const messages = require("./messages.js");
const utils = require("./utils.js");
const config = require("../config.js");

/**
 * Selects reviewers and sends a message to a channel
 * @param {object} payload
 */
const requestReview = async payload => {
  const teamId = payload.team.id;
  const channelId = payload.channel.id;
  const askingUser = payload.user.id;
  const count = payload.submission.review_count || 1;
  const candidates = roulette.selectRandomCandidates(
    teamId,
    channelId,
    askingUser,
    count
  );
  utils.sendDelayedResponse(
    payload,
    messages.ASK_FOR_REVIEW(
      askingUser,
      candidates,
      payload.submission.message,
      payload.submission.add_gif
    )
  );
};

/**
 * Returns a form configuration for requesting a review
 * @param {string} triggerId
 * @param {int} maxReviewers
 */
const getRequestDialogConfiguration = (triggerId, maxReviewers) => {
  const elements = [
    {
      type: "textarea",
      label: "Message",
      hint: "Lien vers la merge request, informations complémentaires...",
      name: "message"
    },
    {
      type: "select",
      label: "Ajouter un GIF sous la demande",
      name: "add_gif",
      value: "no",
      options: [
        {
          label: "Non",
          value: "no"
        },
        {
          label: "Oui",
          value: "yes"
        }
      ]
    }
  ];
  // If there is more than one reviewer available,
  // allow the user to choose the number of reviewers
  if (maxReviewers > 1) {
    const options = [];
    while (options.length < Math.min(maxReviewers, 3)) {
      options.push({
        label: options.length + 1 + "",
        value: options.length + 1 + ""
      });
    }
    elements.unshift({
      type: "select",
      label: "Relectures souhaitées",
      name: "review_count",
      value: "1",
      options: options
    });
  }

  return {
    trigger_id: triggerId,
    dialog: {
      callback_id: "request_review",
      title: "Demande de relecture",
      elements: elements
    }
  };
};

/**
 * Opens a request dialog if there are enough reviewers available
 */
const openRequestDialog = async (req, res) => {
  const maxReviewers = roulette.getMaxReviewers(
    req.body.team_id,
    req.body.channel_id,
    req.body.user_id
  );
  if (!maxReviewers) {
    res.send(messages.ERROR_NOT_ENOUGH_REVIEWERS);
  } else {
    const dialogConfig = getRequestDialogConfiguration(
      req.body.trigger_id,
      maxReviewers
    );
    try {
      const bearer = roulette.getBearer(req.body.team_id);
      // We're sending a delayed response to be able to open a dialog
      await utils.callSlackMethod("dialog.open", dialogConfig, { bearer });
    } catch (e) {
      console.error(e);
      return res.send(messages.ERROR_CANNOT_OPEN_REQUEST_DIALOG);
    }
    res.send();
  }
};

/**
 * Displays the app's help to a user
 */
const displayHelp = (req, res) => {
  res.send(messages.HELP);
};

/**
 * Displays the channel's candidates to a user
 */
const listCandidates = (req, res) => {
  const candidates = roulette.getCandidates(
    req.body.team_id,
    req.body.channel_id
  );
  res.send(messages.LIST_CANDIDATES_IN_CHANNEL(candidates));
};

/**
 * Adds candidates to a channel
 */
const addCandidates = (req, res) => {
  const candidates = utils.extractUserEntities(req.body.text);
  if (candidates.length) {
    roulette.addCandidates(req.body.team_id, req.body.channel_id, candidates);
    res.send();
    // We're sending a delayed response to avoid showing the command in the conversation
    utils.sendDelayedResponse(
      req.body,
      messages.USER_ADDED_CANDIDATES(req.body.user_id, candidates)
    );
  } else {
    res.send(messages.ERROR_NO_CANDIDATES_TO_ADD);
  }
};

/**
 * Removes candidates form a channel
 */
const removeCandidates = (req, res) => {
  const candidates = utils.extractUserEntities(req.body.text);
  if (candidates.length) {
    roulette.removeCandidates(
      req.body.team_id,
      req.body.channel_id,
      candidates
    );
    res.send();
    // We're sending a delayed response to avoid showing the command in the conversation
    utils.sendDelayedResponse(
      req.body,
      messages.USER_REMOVED_CANDIDATES(req.body.user_id, candidates)
    );
  } else {
    res.send(messages.ERROR_NO_CANDIDATES_TO_REMOVE);
  }
};

/**
 * Displays the an "Unknown command" error to a user
 */
const displayUnknownCommand = (req, res) => {
  res.send(messages.ERROR_UNKNOWN_COMMAND);
};

const processCommand = (req, res) => {
  const firstWord = req.body.text.trim().split(" ")[0];
  switch (firstWord) {
    case "":
      return openRequestDialog(req, res);
    case "help":
      return displayHelp(req, res);
    case "ls":
      return listCandidates(req, res);
    case "add":
      return addCandidates(req, res);
    case "rm":
      return removeCandidates(req, res);
    default:
      return displayUnknownCommand(req, res);
  }
};

const processAction = async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    switch (payload.callback_id) {
      case "request_review":
        requestReview(payload);
      default:
        console.log(req.body);
    }
  } catch (e) {
    console.error(e);
  } finally {
    res.send();
  }
};

/**
 * Gets a team's token and saves it
 */
const install = async (req, res) => {
  try {
    const data = (await utils.callSlackMethod(
      `oauth.access?client_id=${config.client_id}&client_secret=${
        config.client_secret
      }&code=${req.query.code}`,
      null,
      { method: "GET" }
    )).data;

    roulette.updateTeamData(data.team_id, {
      token: data.access_token,
      name: data.team_name
    });

    res.redirect(`${config.baseUrl}/install-success.html`);
  } catch (e) {
    console.error(e);
    res.redirect(`${config.baseUrl}/install-error.html`);
  }
};

module.exports = {
  processCommand,
  processAction,
  install
};

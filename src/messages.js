const utils = require("./utils.js");

const messages = {
  HELP: {
    response_type: "ephemeral",
    text: `Cette application permet de sélectionner aléatoirement une ou plusieurs personnes pour une relecture, parmi une liste de relecteurs. Cette liste de relecteurs est propre à chaque chaîne, et peut être configurée grâce aux commandes suivantes :

>*/roulette ls*
>Liste les relecteurs enregistrés sur la chaîne courante

>*/roulette add* _@tom @jerry_
>Ajoute des utilisateurs à la liste de relecteurs

>*/roulette rm* _@tom @jerry_
>Retire des utilisateurs de la liste de relecteurs

Une fois cette liste configurée, il suffit d'utiliser cette commande :

>*/roulette*
>Ouvre le formulaire de demande`
  },

  LIST_CANDIDATES_IN_CHANNEL(candidates) {
    if (!candidates.length) {
      return messages.NO_CANDIDATES_IN_CHANNEL;
    }
    const plural = candidates.length > 1 ? "s" : "";
    return {
      response_type: "ephemeral",
      text: `Il y a ${
        candidates.length
      } relecteur${plural} enregistré${plural} sur cette chaîne :`,
      attachments: [
        {
          text: candidates.map(c => `- <@${c}>`).join("\n")
        }
      ]
    };
  },
  NO_CANDIDATES_IN_CHANNEL: {
    response_type: "ephemeral",
    text:
      ":woman-shrugging: Aucun relecteur n'est enregistré sur cette chaîne. Pour en ajouter, utilise la commande suivante :",
    attachments: [{ text: "*/roulette add* _@tom @jerry_" }]
  },
  USER_ADDED_CANDIDATES(user, candidates) {
    const list = messages.TEXT_LIST_OF_CANDIDATES(candidates);
    return {
      response_type: "in_channel",
      text: `<@${user}> a ajouté ${list} à la liste de relecteurs disponibles sur cette chaîne.`
    };
  },
  TEXT_LIST_OF_CANDIDATES(candidates) {
    const arr = candidates.map(c => `<@${c}>`);
    if (candidates.length > 1) {
      return `${arr.slice(0, arr.length - 1).join(", ")} et ${
        arr.slice(-1)[0]
      }`;
    } else {
      return arr[0];
    }
  },
  USER_REMOVED_CANDIDATES(user, candidates) {
    const list = messages.TEXT_LIST_OF_CANDIDATES(candidates);
    return {
      response_type: "in_channel",
      text: `<@${user}> a retiré ${list} de la liste de relecteurs disponibles sur cette chaîne.`
    };
  },
  ERROR_NO_CANDIDATES_TO_ADD: {
    response_type: "ephemeral",
    text:
      ":woman-shrugging: Aucun relecteur à ajouter. Voici comment utiliser cette commande :",
    attachments: [
      {
        text: "*/roulette add* _@tom @jerry_",
        footer: "Besoin d'aide ? Essaye /roulette help"
      }
    ]
  },
  ERROR_NO_CANDIDATES_TO_REMOVE: {
    response_type: "ephemeral",
    text:
      ":woman-shrugging: Aucun relecteur à retirer. Voici comment utiliser cette commande :",
    attachments: [
      {
        text: "*/roulette rm* _@tom @jerry_",
        footer: "Besoin d'aide ? Essaye /roulette help"
      }
    ]
  },
  ERROR_UNKNOWN_COMMAND: {
    response_type: "ephemeral",
    text: ":zany_face: Commande non reconnue...",
    attachments: [
      {
        text: "Besoin d'aide ? Essaye */roulette help*"
      }
    ]
  },
  ERROR_NOT_ENOUGH_REVIEWERS: {
    response_type: "ephemeral",
    text: ":white_frowning_face: Aucun relecteur disponible. Pour en ajouter :",
    attachments: [
      {
        text: "*/roulette add* _@tom @jerry_",
        footer: "Besoin d'aide ? Essaye /roulette help"
      }
    ]
  },
  ERROR_CANNOT_OPEN_REQUEST_DIALOG: {
    response_type: "ephemeral",
    text:
      ":frowning: Une erreur s'est produite lors de l'ouverture du formulaire..."
  },
  ASK_FOR_REVIEW(askingUser, candidates, message) {
    const list = messages.TEXT_LIST_OF_CANDIDATES(candidates);
    let mainText;
    if (candidates.length === 1) {
      mainText = `:tada: ${list}, tu as été choisi`;
    } else {
      mainText = `:tada: ${list}, vous avez été choisis`;
    }
    return {
      response_type: "in_channel",
      text: `${mainText} aléatoirement pour faire une relecture, suite à une demande de <@${askingUser}> !`,
      attachments: [
        { text: message },
        {
          title: "",
          image_url: utils.getRandomGif(),
          footer:
            "Retrouve la liste des commandes disponibles avec /roulette help"
        }
      ]
    };
  }
};

module.exports = messages;

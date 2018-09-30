# Review roulette

Application Slack permettant de choisir aléatoirement des relecteurs pour une merge request. Construite avec NodeJS et Express.

## Utilisation

Si l'application n'est pas encore installée sur votre espace de travail, faites-le [ici](https://review-roulette.alexandreleveque.fr).

Grâce à des commandes _slash_, vous pouvez sélectionner aléatoirement une ou plusieurs personnes pour une relecture, parmi une liste de relecteurs. Cette liste de relecteurs est propre à chaque chaîne, et peut être configurée grâce aux commandes suivantes :

**/roulette ls**

> Liste les relecteurs enregistrés sur la chaîne courante

**/roulette add** _@tom @jerry_

> Ajoute des utilisateurs à la liste de relecteurs

**/roulette rm** _@tom @jerry_

> Retire des utilisateurs de la liste de relecteurs

Une fois cette liste configurée, il suffit d'utiliser cette commande :

**/roulette**

> Ouvre le formulaire de demande

## Installation et développement

### 1. Création d'une application Slack

Pour pouvoir utiliser ce code, vous devez d'abord créer une application sur votre compte Slack, en vous rendant [ici](https://api.slack.com/apps) et en cliquant sur **Create New App**. Choisissez un nom et l'espace de travail sur lequel vous souhaitez la tester.

#### Activer les actions

Une fois votre application créée, vous devriez être redirigé vers une page **Basic Information**, et voir **Add features and functionality**.

Pour pouvoir afficher un formulaire dans Slack, il faut être autorisé à recevoir des **actions**. Pour cela, choisissez **Interactive Components** et activez-le. Remplissez **Request URL** comme ceci :

```
http(s)://{nom_de_domaine_ou_ip}/{sous_dossier/}action
```

> Remplacez `nom_de_domaine_ou_ip` par le votre, où Slack pourra le trouver lorsqu'il fera ses appels. `sous_dossier` peut être vide si vous comptez lancer l'application à la racine de votre site. `action` est une route configurée dans le code. Une fois que c'est fait, validez.

#### Activer les commandes _slash_

Dans le menu de gauche, sous **Features**, choisissez **Slash Commands**. Sur l'écran suivant, cliquez sur **Create New Command**. Entrez cette configuration et validez :

- **Command:** /roulette
- **Request URL:** http(s)://{nom_de_domaine_ou_ip}/{sous_dossier/}command
- **Short Description:** Choisit aléatoirement des relecteurs pour ta MR
- **Usage hint:**
- **Escape channels, users...:** Oui

> La route `command` est configurée dans le code.

#### Activer l'authentification OAuth

Afin d'ouvrir des boîtes de dialogues, nous avons également besoin d'authentifier notre application sur les espaces de travail. Cliquez sur **OAuth & Permissions**, et ajoutez cette URL en cliquant sur **Add New Redirect URL** :

```
http(s)://{nom_de_domaine_ou_ip}/{sous_dossier/}install
```

> La route `install` est configurée dans le code.

Bravo, vous venez de fournir à Slack toutes les informations dont il a besoin ! Gardez cette page ouverte pour la suite.

### 2. Configuration du serveur

Clonez le projet à l'emplacement de votre choix, puis entrez dedans :

```
git clone git@github.com:blex41/review-roulette.git
cd review-roulette
```

Installez les dépendances :

```
npm i -S
```

Afin que l'application puisse s'authentifier auprès de Slack, il faut qu'elle possède un **Client Id** et un **Client Secret**. Vous les trouverez sur le site précédent, dans **Basic Information**. À la racine du projet, créez un fichier `env.json` contenant ceci :

```
{
  "client_id": "VOTRE_CLIENT_ID",
  "client_secret": "VOTRE_CLIENT_SECRET",
  "siteUrl": "https://exemple.com",
  "baseUrl": "/sous/dossier", // vide si racine du site
  "port": 80
}
```

### 3. Lancement de l'application

À la racine du projet, faites :

```
npm start
```

Vous devriez voir la page d'installation à cette adresse :

```
http(s)://{nom_de_domaine_ou_ip}/{sous_dossier/}
```

Cliquez sur le bouton pour l'installer dans votre espace de travail Slack, et écrivez votre premier `/roulette help` dans Slack !

>Si vous souhaitez développer sans avoir à redémarrer l'application après chaque changement, vous pouvez installer nodemon globalement `npm i -g nodemon`, et au lieu d'`npm start`, faire `nodemon src/index`.

### 4. Distribution

Votre application est maintenant disponible sur votre espace de travail de développement. Pour pouvoir la distribuer sur d'autres, il faut remplir certaines conditions (https notamment). Plus d'informations, retournez sur le site de gestion de vos apps Slack, et allez dans **Manage Distribution**.
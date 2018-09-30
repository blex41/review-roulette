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

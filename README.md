# serveur_bot

Aller dans le dossier souhaité, executer :

`git clone https://github.com/Axsag/serveur_bot.git`

OU décompresser l'archive,

Puis :

`npm install`

Ajouter le token dans `.env.exemple` puis renommer le fichier en `.env`

Démarrer le bot avec :

`node index.js`

Pour créer une nouvelle commande,
Créer un fichier `nom_de_la_commande.js` dans le dossier `commands/`

Modèle de commande : 

```js
module.exports = {
    name: 'nom_de_la_commande',
    description: 'description de la commande',
    admin: false, // true si commande réservée aux admins
    execute(message, args) {
        // Code à executer lorsque la commande est faite
    }
};
```
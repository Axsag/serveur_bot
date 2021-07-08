const Discord = require('discord.js');

module.exports = {
    name: 'serveur',
    description: 'Donne des recettes de cocktails',
    admin: false,
    execute(message, args) {

        let content = '';

        const filter = (reaction, user) => {
            return ['🍹', '🥃', '🍸'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const serveurEmbed = new Discord.MessageEmbed()
            .setColor('#18191c')
            .setTitle('Voici la liste des cocktails :')
            .setURL('')
            .setAuthor('')
            .setDescription('')
            .setFooter('L\'abus d\'alcool est dangereux pour la santé.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE0l6xIpqMeApj8WfHJbvuusB49ud-RaRmxZ1IIC0KZ162D-_VKl1wiOdFr6ZaxLPzypk&usqp=CAU')
            .addFields(
                { name: 'Cocktails avec alcool', value: 'Cocktail 1 \n Cocktail 2 \n Cocktail [...]', inline: false },

                { name: 'Cocktails sans alcool', value: 'Cocktail 1 \n Cocktail 2 \n Cocktail [...]', inline: false },
            )
            .setImage('https://lh3.googleusercontent.com/proxy/q6YHxQXSujCb7ItRBKDFB0B0Mgx_on8NPIYJeQMqGtZ9MzAZZSG6QjVVg2Bm4uX2ZJighKGWOxxClOUM56q_cTJ1XFaZTg0xo9A0QkU');

        message.channel.send('**Que désirez-vous?**').then(first_sent => {
            message.channel.send(serveurEmbed).then(sent => {
                sent.react('🍸')
                    .then(() => sent.react('🍹'))
                    .then(() => sent.react('🥃'))
                    .then(() => sent.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(collected => {
                            const reaction = collected.first();
                            switch (reaction.emoji.name) {
                                case '🍹':
                                    content = 'Faut pas oublier le p\'tit parapluie';
                                    break;
                                case '🥃':
                                    content = 'Juste un doigt !';
                                    break;
                                case '🍸':
                                    content = 'A la cuillère, pas au shaker';
                                    break;
                            }
                            sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
                            message.channel.send(content);
                        })
                        .catch(collected => {
                            message.channel.send('Bon j\'ai pas que ça a faire, rappelle moi plus tard');
                            first_sent.delete();
                            sent.delete();
                        })
                    )
            });
        });
    }
};
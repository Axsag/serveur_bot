const Discord = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'show avatar',
    admin: false,
    execute(message, args) {
        let avatar_webp = '';
        let avatar_png = '';
        let avatar_jpg = '';
        let avatar_member = '';

        if (!message.mentions.users.size) {
            avatar_webp = message.author.displayAvatarURL({ size: 512 });
            avatar_png = message.author.displayAvatarURL({ format : 'png', size: 512 });
            avatar_jpg = message.author.displayAvatarURL({ format : 'jpg', size: 512  });
            avatar_member = message.author.username;
        }
        else {
            avatar_webp = message.mentions.users.first().displayAvatarURL({size: 512});
            avatar_png = message.mentions.users.first().displayAvatarURL({format: 'png', size: 512});
            avatar_jpg = message.mentions.users.first().displayAvatarURL({format: 'jpg', size: 512});
            avatar_member = message.mentions.users.first().username;
        }

        const avatarEmbed = new Discord.MessageEmbed()
            .setColor('#00FF00')
            .setTitle('Avatar de ' + avatar_member)
            .setURL('')
            .setAuthor('')
            .setDescription('')
            .addField('Formats :','[webp](' + avatar_webp + ') | [png](' + avatar_png + ') | [jpg](' + avatar_jpg + ')',true)
            .setImage(avatar_webp);

        message.channel.send(avatarEmbed);    
    }
};
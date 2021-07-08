require('dotenv').config();

const { Client, Collection } = require('discord.js');
const fs = require('fs');
const prefix = '!';
const client = new Client();
client.commands = new Collection();

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {

    if (message.author.id === '415118435174055947') {
        message.react('🤿');
    }

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const isAdmin = message.member.hasPermission('ADMINISTRATOR');


    try {
        if (client.commands.get(command).admin && !isAdmin) return;
        client.commands.get(command).execute(message, args);
    }
    catch (e) {
        console.log(e);
    }
});

client.login(process.env.APP_TOKEN);
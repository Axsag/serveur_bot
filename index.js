require('dotenv').config();

const { Client, Collection } = require('discord.js');
const fs = require('fs');
const prefix = '!';
const client = new Client();
client.commands = new Collection();

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'));

const Sequelize = require('sequelize');

// DB connect
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USR,
    process.env.DB_PWD,
    {
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
        logging: console.log,
        dialect: 'mysql',
        define: {
            timestamps: false
        }
    }
);
/*
 * equivalent to: CREATE TABLE kamas_table(
 * id VARCHAR(255),
 * kamas INT NOT NULL DEFAULT 0
 * );
 */
const DB = sequelize.define('kamas_table', {
    user_id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
    },
    kamas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    date_claim: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    streak: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
    }
});

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    DB.sync().catch(e => {console.log(e)});
    console.log('Ready!');
    // DB.drop();
});

client.on('message', async message => {

    if (message.author.id === '415118435174055947') {
        message.react('🤿').catch();
    }

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const isAdmin = message.member.hasPermission('ADMINISTRATOR');


    try {
        if (client.commands.get(command).admin && !isAdmin) return;
        client.commands.get(command).execute(message, args, DB);
    }
    catch (e) {
        console.log(e);
    }
});

client.login(process.env.APP_TOKEN).catch();
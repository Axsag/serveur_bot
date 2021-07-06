module.exports = {
    name: 'ping',
    description: 'ping ?',
    admin: false,
    execute(message, args) {
        message.channel.send('pong ' + args);
    }
};
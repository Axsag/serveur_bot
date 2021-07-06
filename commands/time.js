module.exports = {
    name: 'time',
    description: '13h combien ?',
    admin: false,
    execute(message, args) {
        var date = new Date;
        var minutes = date.getMinutes();
        var hour = date.getHours();

        var minutes_past_13 = (hour < 13 ? hour + 11 : hour - 13) * 60 + minutes;

        if (minutes_past_13 === 0) {
            message.channel.send("Il est <@391947909567873024> !");
        }
        else {
            message.channel.send("Il est 13h et " + minutes_past_13 + 'minutes.');
        }
    }
};
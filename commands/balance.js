module.exports = {
    name: 'balance',
    description: 'check your balance',
    admin: false,
    symbol: '?',
    async execute(message, args, db) {

        const user_id = message.author.id;

        await db.findOne({
            where: {
                user_id: user_id
            },
            raw: true,
            nest: true
        })
            .then(async result => {
                if (result === null){
                    message.reply('Vous n\'avez pas encore de Kamas, faites votre premier !claim pour vous lancer !').catch(e => {console.log(e)});
                }
                else {
                    message.reply('Votre solde est de  ' + result.kamas + this.symbol).catch(e => {console.log(e)});
                }
            })
            .catch(e => {
                console.log(e);
                return message.reply('J\'ai un petit soucis avec la BDD...')
            });
    }
};
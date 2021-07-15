module.exports = {
    name: 'claim',
    description: 'claim daily kamas',
    admin: false,
    symbol: '₭',
    dailyReward: 400,
    dailyStreak: 100,
    async execute(message, args, db) {

        const date = Math.round(Date.now() / 1000);
        const user_id = message.author.id;

        console.log(args);

        await db.findOne({
                where: {
                    user_id: user_id
                },
                raw: true,
                nest: true
            })
            .then(async result => {
                if (result === null){
                    await db.create({ user_id: user_id, kamas: this.dailyReward + this.dailyStreak, date_claim: date, streak: 1 }).catch(e => {console.log(e)});
                    message.reply('Vous avez désormais ' + (this.dailyReward + this.dailyStreak) + this.symbol)
                }
                else if (date > result.date + 86400){
                    let u_streak = result.streak;
                    let u_kamas = result.kamas + (this.dailyReward + (u_streak * this.dailyStreak));

                    await db.update(
                        {
                            kamas: u_kamas,
                            streak: u_streak + 1
                        },
                        {
                            where: { user_id: user_id }
                        }
                    ).catch(e => {console.log(e)});

                    message.reply('Vous avez désormais ' + u_kamas + this.symbol).catch(e => {console.log(e)});
                }
                else {
                    let nextSeconds = result.date_claim + 86400 - date;
                    let nextDate = new Date(nextSeconds * 1000).toISOString().substr(11, 8);
                    message.reply('Vous pourrez réclamer votre prochaine récompense journalière dans : '+nextDate).catch(e => {console.log(e)});
                }
            })
            .catch(e => {
            console.log(e);
            return message.reply('J\'ai un petit soucis avec la BDD...')
        });
    }
};
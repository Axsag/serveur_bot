module.exports = {
    name: 'blackjack',
    description: 'basic blackjack game',
    admin: false, // true si commande réservée aux admins
    db: null,
    symbol: '₭',
    deck: [],
    card_values: {
        'A': 11,
        'K': 10,
        'Q': 10,
        'J': 10,
        '10': 10,
        '9': 9,
        '8': 8,
        '7': 7,
        '6': 6,
        '5': 5,
        '4': 4,
        '3': 3,
        '2': 2,
    },
    tokens: {
        '50': '⚫',
        '100': '🔴',
        '200': '🔵',
        '500': '🟠',
        '1000': '🟢',
        '2000': '🟡',
        '5000': '🟣',
    },
    dealer: {
      cards: [],
      value: 0,
      aces: 0,
      hidden: true
    },
    player: {
      cards: [],
      value: 0,
      aces: 0,
      balance: 0,
      bet: 200,
      canSplit: false,
      split: false,
      canDouble: false,
      double: false,
      canInsurance: false,
      insurance: false
    },
    player_split: {
      cards: [],
      value: 0,
      aces: 0
    },
    playerArt:
        '+  ___ _\n' +
        '+ | _ \\ |__ _ _  _ ___ _ _ \n' +
        '+ |  _/ / _` | || / -_) \'_|\n' +
        '+ |_| |_\\__,_|\\_, \\___|_|\n' +
        '+             |__/          ',
    splitArt:
        '-  ___      _ _ _   \n' +
        '- / __|_ __| (_) |_ \n' +
        '- \\__ \\ \'_ \\ | |  _|\n' +
        '- |___/ .__/_|_|\\__|\n' +
        '-     |_|           ',
    dealerArt:
        '-  ___\n' +
        '- |   \\ ___ __ _| |___ _ _ \n' +
        '- | |) / -_) _` | / -_) \'_|\n' +
        '- |___/\\___\\__,_|_\\___|_|',
    execute(message, args, db) {
        this.db = db;
        this.startGame(message);
    },
    // Number of cards
    makeDeck(count = 1){
        const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        for (let i=0; i<count; ++i) {
            for (let suit in suits) {
                for (let value in values) {
                    this.deck.push(`${values[value]}${suits[suit]}`);
                }
            }
        }
        return this.deck;
    },
     shuffle(){
         let m = this.deck.length, i;

         while(m){
             i = Math.floor(Math.random() * m--);

             [this.deck[m], this.deck[i]] = [this.deck[i], this.deck[m]];
         }

         return this.deck;
     },
    deal(){
        return this.deck.pop();
    },
    startGame(message){
        this.resetVars(message).catch();
        this.makeDeck();
        this.shuffle();
        message.channel.send('Starting...').then(sent => {
            this.betTurn(sent, message);
        });
    },
    async endGame(sent, message){

        const filter = (reaction, user) => {
            return ['✅', '🛑'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        this.splitArt = this.splitArt.replace(/\+/g, '-');
        this.playerArt = this.playerArt.replace(/\+/g, '-');

        if (this.dealer.value === 0)
            this.updatePlayerHandVal(this.dealer);

        let content = '';
        let p_score = this.player.value;
        let ps_score = this.player_split.value;
        let d_score = this.dealer.value;
        let p_len = this.player.cards.length;
        let ps_len = this.player_split.cards.length;
        let earnings = 0;

        if (p_score > 21 || (d_score <= 21 && p_score < d_score)){
            content = 'C\'est perdu !'
        }
        else if (d_score > 21 || (p_score <= 21 && d_score < p_score)){
            if (p_len === 2 && p_score === 21){
                earnings = this.player.bet * 1.5;

            } else {
                earnings = this.player.bet * 2;
            }
            content = 'Bravo, vous avez gagné !'
        }
        else if (d_score === p_score){
            earnings = this.player.bet;
            content = 'Egalité !'
        }
        if (this.player.split) {
            if (ps_score > 21 || (d_score <= 21 && ps_score < d_score)) {
                content = content + '\nVotre split est perdant !'
            } else if (d_score > 21 || (ps_score <= 21 && d_score < ps_score)) {
                if (ps_len === 2 && ps_score === 21){
                    earnings = earnings + this.player.bet * 1.5;

                } else {
                    earnings = earnings + this.player.bet * 2;
                }
                content = content + '\nVotre split est gagnant !'
            } else if (d_score === ps_score) {
                earnings = earnings + this.player.bet;
                content = content + '\nVotre split est a égalité !'
            }
        }
        await this.updateBalance(message, earnings);
        content = content + '\nVotre nouveau solde est de ' + this.player.balance + this.symbol;
        content = content + '\nVous souhaitez rejouer ?';
        sent.edit(this.drawMessage(message) + '\n===\n' + content)
            .then(() => {sent.react('✅')
                .then(() => {sent.react('🛑').catch(e => {console.log(e)})})
                .then(() => {sent.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();
                        sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
                        switch (reaction.emoji.name) {
                            case '✅':
                                sent.delete();
                                this.startGame(message);
                                break;
                            case '🛑':
                                sent.edit(this.drawMessage(message) + '\nA la prochaine !')
                                    .then(() => {this.resetVars(message)});
                                break;
                        }
                    })
                })
                .catch(collected => {
                    sent.channel.send('Bon j\'ai pas que ça a faire, rappelle moi plus tard').catch(e => {console.log(e)});
                    sent.delete();
                })
            })
    },
    betTurn(sent, message, split = false){
        const arrayReactions = ['🛑'];
        let balance = this.player.balance;
        let betInfo = 'C\'est le moment de placer votre mise !\nVotre solde est de ' + balance + this.symbol + '\n';

        if (balance < 50){
            sent.edit('Désolé, vous n\'avez pas assez de kamas pour la mise minimale').catch()
        }

        for (let i in this.tokens){
            let val = parseInt(i);
            if (val <= balance){
                arrayReactions.push(this.tokens[i]);
                betInfo = betInfo + '\n' + this.tokens[i] + ': ' + i + this.symbol;
                sent.react(this.tokens[i]).catch();
            }
        }
        sent.react('🛑').catch();
        betInfo = betInfo + '\n🛑: Quitter';
        sent.edit('\n```' + betInfo + '```').catch();
        const filter = (reaction, user) => {
            return arrayReactions.includes(reaction.emoji.name) && user.id === message.author.id;
        };
        sent.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
            .then(async collected => {
                const reaction = collected.first();
                sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
                switch (reaction.emoji.name) {
                    case '⚫':
                        this.player.bet = 50;
                        break;
                    case '🔴':
                        this.player.bet = 100;
                        break;
                    case '🔵':
                        this.player.bet = 200;
                        break;
                    case '🟠':
                        this.player.bet = 500;
                        break;
                    case '🟢':
                        this.player.bet = 1000;
                        break;
                    case '🟡':
                        this.player.bet = 2000;
                        break;
                    case '🟣':
                        this.player.bet = 5000;
                        break;
                    case '🛑':
                        sent.channel.send('A la prochaine !').catch(e => {
                            console.log(e)
                        });
                        sent.delete();
                        return false;
                }
                if (this.player.bet > 0){

                    await this.updateBalance(message, 0 - this.player.bet);

                    for (let i = 0; i < 2; ++i){
                        this.player.cards.push(this.deal());
                        this.dealer.cards.push(this.deal());
                    }
                    this.updatePlayerHandVal();
                    sent.edit(this.drawMessage(message))
                        .then(() => {
                            if (!this.checkNatural(sent, message)){
                                this.checkDouble();
                                this.checkSplit();
                                this.checkInsurance();
                                this.playerTurn(sent, message);
                            }
                        }).catch()
                }
                return false;
            })
            .catch(collected => {
                sent.channel.send('Bon j\'ai pas que ça a faire, rappelle moi plus tard').catch(e => {
                    console.log(e)
                });
                sent.delete();
                return false;
            })
    },
    playerTurn(sent, message){
        const arrayReactions = ['✅', '🛑'];
        if (this.player.canSplit)
            arrayReactions.push('↔');
        if (this.player.canDouble)
            arrayReactions.push('⏫');
        if (this.player.canInsurance)
            arrayReactions.push('⚠');

        const filter = (reaction, user) => {
            return arrayReactions.includes(reaction.emoji.name) && user.id === message.author.id;
        };

        if (this.player.value === 21){
            if (this.player.split) {
                this.splitTurn(sent, message);
            } else {
                this.dealerTurn(sent, message);
            }
            return;
        }

        sent.react('✅')
            .then(() => {sent.react('🛑').catch(e => {console.log(e)})})
            .then(() => { if (this.player.canDouble) sent.react('⏫').catch(e => {console.log(e)})})
            .then(() => { if (this.player.canInsurance) sent.react('⚠').catch(e => {console.log(e)})})
            .then(() => { if (this.player.canSplit) sent.react('↔').catch(e => {console.log(e)})})
            .then(() => {
                sent.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
                    .then(collected => {
                        const reaction = collected.first();
                        sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
                        switch (reaction.emoji.name) {
                            case '✅':
                                this.player.canSplit = false;
                                this.player.canDouble = false;
                                this.player.canInsurance = false;
                                this.player.cards.push(this.deal());
                                this.updatePlayerHandVal();
                                sent.edit(this.drawMessage(message)).catch(e => {
                                    console.log(e)
                                });
                                if (this.player.value > 21) {
                                    if (this.player.split) {
                                        this.splitTurn(sent, message);
                                    } else {
                                        this.endGame(sent, message).catch();
                                    }
                                } else if (this.player.value === 21) {
                                    if (this.player.split) {
                                        this.splitTurn(sent, message);
                                    } else {
                                        this.dealerTurn(sent, message);
                                    }
                                } else {
                                    this.playerTurn(sent, message);
                                }
                                break;
                            case '🛑':
                                if (this.player.split) {
                                    this.splitTurn(sent, message);
                                } else {
                                    this.dealerTurn(sent, message);
                                }
                                break;
                            case '⏫':
                                this.player.double = true;
                                this.player.canDouble = false;
                                this.updateBalance(message, 0 - this.player.bet)
                                    .then(() => {
                                        this.player.bet = this.player.bet * 2;
                                        this.player.cards.push(this.deal());
                                        this.updatePlayerHandVal();
                                        this.dealerTurn(sent, message)
                                    }).catch();
                                break;
                            case '⚠':
                                this.player.insurance = true;
                                this.player.canInsurance = false;
                                this.playerTurn(sent, message);
                                break;
                            case '↔':
                                this.player.split = true;
                                this.player.canSplit = false;
                                this.player_split.cards.push(this.player.cards[1]);
                                this.player.cards.pop();
                                this.player.cards.push(this.deal());
                                this.player_split.cards.push(this.deal());
                                this.updatePlayerHandVal();
                                this.updatePlayerHandVal(this.player_split);
                                this.updateBalance(message, 0 - this.player.bet)
                                    .then(() => {
                                        sent.edit(this.drawMessage(message)).catch(e => {
                                            console.log(e)
                                        });
                                        if (this.player.cards[0].startsWith('A')) {
                                            this.dealerTurn(sent, message);
                                        } else {
                                            this.playerTurn(sent, message);
                                        }
                                    })
                                    .catch()
                                break;
                        }
                    })
                    .catch(collected => {
                        sent.channel.send('Bon j\'ai pas que ça a faire, rappelle moi plus tard').catch(e => {
                            console.log(e)
                        });
                        sent.delete();
                    })
            });
    },
    splitTurn(sent, message){
        const arrayReactions = ['✅', '🛑'];

        this.splitArt = this.splitArt.replace(/-/g, '+');
        this.playerArt = this.playerArt.replace(/\+/g, '-');

        sent.edit(this.drawMessage(message)).catch(e => {console.log(e)});

        const filter = (reaction, user) => {
            return arrayReactions.includes(reaction.emoji.name) && user.id === message.author.id;
        };

        if (this.player_split.value === 21){
            this.dealerTurn(sent, message);
            return;
        }

        sent.react('✅')
            .then(() => {sent.react('🛑').catch(e => {console.log(e)})})
            .then(() => {
                sent.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
                    .then(collected => {
                        const reaction = collected.first();
                        sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
                        switch (reaction.emoji.name) {
                            case '✅':
                                this.player_split.cards.push(this.deal());
                                this.updatePlayerHandVal(this.player_split);
                                sent.edit(this.drawMessage(message)).catch(e => {
                                    console.log(e)
                                });
                                if (this.player_split.value > 21) {
                                    this.endGame(sent, message).catch();
                                } else if (this.player_split.value === 21) {
                                    this.dealerTurn(sent, message);
                                } else {
                                    this.splitTurn(sent, message);
                                }
                                break;
                            case '🛑':
                                this.dealerTurn(sent, message);
                                break;
                        }
                    })
                    .catch(collected => {
                        sent.channel.send('Bon j\'ai pas que ça a faire, rappelle moi plus tard').catch(e => {
                            console.log(e)
                        });
                        sent.delete();
                    })
            });
    },
    checkNatural(sent, message){
        let regexp = new RegExp("^([AKQJ\\d]{1,2})");
        let match = this.dealer.cards[0].match(regexp);
        let card_value = this.card_values[match[1]];

        if (card_value >= 10){
            this.dealer.hidden = false;
            this.updatePlayerHandVal(this.dealer);
            sent.edit(this.drawMessage(message)).catch(e => {console.log(e)});
            if (this.dealer.value === 21){
                this.dealerTurn(sent, message);
                return true;
            }
        }
        return false;
    },
    checkSplit(){
        let regexp = new RegExp("^([AKQJ\\d]{1,2})");
        let match1 = this.player.cards[0].match(regexp);
        let match2 = this.player.cards[1].match(regexp);

        if (match1 === match2)
        {
            this.player.canSplit = true;
        }
        return this.player.canSplit;
    },
    checkDouble(){
        if (this.player.value >= 9 && this.player.value <= 11){
            this.player.canDouble = true;
        }
        return this.player.canDouble;
    },
    checkInsurance(){
        if (this.dealer.cards[0].startsWith('A')){
            this.player.canInsurance = true;
        }
        return this.player.canInsurance;
    },
    dealerTurn(sent, message){
        if (this.dealer.value < 17){
            if (this.dealer.cards.length === 2) {
                this.dealer.hidden = false;
                sent.edit(this.drawMessage(message)).catch(e => {console.log(e)});
                if (this.dealer.value === 21){
                    this.endGame(sent, message).catch();
                }
            }
            sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
            this.dealer.cards.push(this.deal());
            this.updatePlayerHandVal(this.dealer);
            sent.edit(this.drawMessage(message))
                .then(() => {this.dealerTurn(sent, message)});
        }
        else {
            this.endGame(sent, message).catch();
        }
    },
    updatePlayerHandVal(player = this.player){
        player.value = 0;
        for (let card in player.cards){
            let regexp = new RegExp("^([AKQJ\\d]{1,2})");
            let match = player.cards[card].match(regexp);
            let card_value = this.card_values[match[1]];

            if (card_value === 11){
                player.aces += 1;
            }

            player.value += card_value;

            if (player.value > 21 && player.aces > 0){
                player.value -= 10;
                player.aces -= 1;
            }
        }
        return true;
    },
    async resetVars(message){
        this.deck = [];
        this.dealer = {
            cards: [],
            value: 0,
            aces: 0,
            hidden: true
        };
        this.player = {
            cards: [],
            value: 0,
            aces: 0,
            balance: 0,
            bet: 200,
            canSplit: false,
            split: false,
            canDouble: false,
            double: false,
            canInsurance: false,
            insurance: false
        };
        this.player_split = {
            cards: [],
                value: 0,
                aces: 0
        };

        await this.updateBalance(message);

        this.playerArt =
        '+  ___ _\n' +
        '+ | _ \\ |__ _ _  _ ___ _ _ \n' +
        '+ |  _/ / _` | || / -_) \'_|\n' +
        '+ |_| |_\\__,_|\\_, \\___|_|\n' +
        '+             |__/          ';
    },
    drawMessage(message) {

        let table_name = 'Table de <@' + message.author.id + '>\n';

        let dealer_block = '```diff\n' + this.dealerArt + ' ('+(this.dealer.hidden ? '??' : (this.dealer.value > 21 ? 'BUSTED' : this.dealer.value))+')\n'
            + this.drawCards(false) + '```\n';

        let player_block = '```diff\n' + this.playerArt + ' ('+(this.player.value > 21 ? 'BUSTED' : this.player.value)+')\n'
            + this.drawCards(true) + '```\n';

        let split_block = '```diff\n' + this.splitArt + ' ('+(this.player_split.value > 21 ? 'BUSTED' : this.player_split.value)+')\n'
            + this.drawCards(true, true) + '```\n';

        return table_name + dealer_block + player_block + (this.player.split ? split_block : '');

    },
    drawCards(player, split = false) {

        let cards = {};
        let hidden = false;

        if (split){
            cards = this.player_split.cards;
        }
        else if (player){
            cards = this.player.cards;
        }
        else {
            cards = this.dealer.cards;
            hidden = this.dealer.hidden;
        }


        let suits = {
            'spades': '\u2660',
            'hearts': '\u2665',
            'diamonds': '\u2666',
            'clubs': '\u2663'
        };
        let card_tpl = [
            '┌─────────┐',
            '│XX.......│',
            '│.........│',
            '│.........│',
            '│....S....│',
            '│.........│',
            '│.........│',
            '│.......XX│',
            '└─────────┘'
            ];

        let count_cards = cards.length;

        card_tpl = card_tpl.map(function (x) {
            let next_card = x;
            for (let i=0; i<count_cards; ++i){
                let card = cards[i];
                let regexp = new RegExp("^([AKQJ\\d]{1,2})(.+)");
                let match = card.match(regexp);
                let card_value = match[1].toString();
                let card_value2 = match[1].toString();

                if (card_value.length === 1){
                    card_value = card_value + '.';
                    card_value2 = '.' + card_value2;
                }
                let card_suit = suits[match[2]];

                if (i>0)
                    x = x.concat(' ', next_card);

                if (hidden && i === 1){
                    x = x.replace('XX', '..');
                    x = x.replace('S', '.');
                    x = x.replace(/(\.){9}│$/g, '░░░░░░░░░│')
                }
                else {
                    x = x.replace('XX.', card_value + '.');
                    x = x.replace('.XX', '.' + card_value2);
                    x = x.replace('S', card_suit);
                }
            }
            return x;
        });

        return card_tpl.join('\n');
    },
    async updateBalance(message, diff = 0) {

        const user_id = message.author.id;

        await this.db.findOne({ where: { user_id: user_id }, raw: true, nest: true })
            .then(async result => {
                if (result === null){
                    return message.reply('Vous n\'avez pas encore de Kamas, essayez de `!claim` votre récompense quotidienne');
                }
                else {
                    let u_kamas = result.kamas + diff;

                    await this.db.update({ kamas: u_kamas },{ where: { user_id: user_id }}).then(() => {
                        this.player.balance = u_kamas;
                        return this.player.balance;
                    }).catch(e => {
                        console.log(e);
                        return message.reply('J\'ai un petit soucis avec la BDD...')
                    });
                }
            })
            .catch(e => {
                console.log(e);
                return message.reply('J\'ai un petit soucis avec la BDD...')
            });
    }
};
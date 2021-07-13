module.exports = {
    name: 'blackjack',
    description: 'basic blackjack game',
    admin: false, // true si commande réservée aux admins
    deck: [],
    cardBack: ':question::question:',
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
    dealer: {
      cards: [],
      value: 0,
      aces: 0
    },
    player: {
      cards: [],
      value: 0,
      aces: 0
    },
    playerArt:
        '  ___ _\n' +
        ' | _ \\ |__ _ _  _ ___ _ _ \n' +
        ' |  _/ / _` | || / -_) \'_|\n' +
        ' |_| |_\\__,_|\\_, \\___|_|\n' +
        '             |__/          ',
    dealerArt:
        '  ___\n' +
        ' |   \\ ___ __ _| |___ _ _ \n' +
        ' | |) / -_) _` | / -_) \'_|\n' +
        ' |___/\\___\\__,_|_\\___|_|',
    execute(message, args) {
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
        this.resetVars();
        this.makeDeck();
        this.shuffle();
        message.channel.send('Dealing...').then(sent => {
            for (let i = 0; i < 2; ++i){
                this.player.cards.push(this.deal());
                this.dealer.cards.push(this.deal());
            }
            this.updatePlayerHandVal();
            sent.edit('```' + this.dealerArt + '\n' + this.drawCards(false, true) + '```\n```' + this.playerArt + ' ('+this.player.value+')\n' + this.drawCards(true) + '```')
                .then(() => {
                    this.playerTurn(sent, message);
                })
        });
    },
    endGame(sent, message){

        const filter = (reaction, user) => {
            return ['✅', '🛑'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        if (this.dealer.value === 0)
            this.updatePlayerHandVal(this.dealer);

        let content = '';
        let p_score = this.player.value;
        let d_score = this.dealer.value;
        let p_size = this.player.cards.length;
        let d_size = this.dealer.cards.length;

        if (p_score > 21 || (d_score <= 21 && p_score < d_score)){
            content = 'C\'est perdu !\nUne autre partie histoire de se refaire ?'
        }
        else if (d_score > 21 || (p_score <= 21 && d_score < p_score)){
            content = 'Bravo, vous avez gagné !\nVous continuez sur votre lancée ?'
        }
        else if (d_score === p_score){
            content = 'Egalité !\nVous voulez remettre ça ?'
        }
        sent.edit('```' + this.dealerArt + ' ('+this.dealer.value+')\n' + this.drawCards(false) + '```\n```' + this.playerArt + ' ('+this.player.value+')\n' + this.drawCards(true) + '```\n===\n' + content)
            .then(() => {sent.react('✅')
                .then(() => {sent.react('🛑')})
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
                                sent.edit('```' + this.dealerArt + ' ('+this.dealer.value+')\n' + this.drawCards(false) + '```\n```' + this.playerArt + ' ('+this.player.value+')\n' + this.drawCards(true) + '```\nA la prochaine !')
                                    .then(() => {this.resetVars()});
                                break;
                        }
                    })
                })
                .catch(collected => {
                    sent.channel.send('Bon j\'ai pas que ça a faire, rappelle moi plus tard');
                    sent.delete();
                })
            })
    },
    playerTurn(sent, message){
        const filter = (reaction, user) => {
            return ['✅', '🛑'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        sent.react('✅')
            .then(() => {sent.react('🛑')})
            .then(() => sent.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
                    switch (reaction.emoji.name) {
                        case '✅':
                            this.player.cards.push(this.deal());
                            this.updatePlayerHandVal();
                            sent.edit('```' + this.dealerArt + '\n' + this.drawCards(false) + '```\n```' + this.playerArt + ' ('+this.player.value+')\n' + this.drawCards(true) + '```');
                            if (this.player.value > 21){
                                this.endGame(sent, message)
                            }
                            else if (this.player.value === 21){
                                this.dealerTurn(sent, message);
                            }
                            else {
                                this.playerTurn(sent, message);
                            }
                            break;
                        case '🛑':
                            this.dealerTurn(sent, message);
                            break;
                    }
                })
                .catch(collected => {
                    sent.channel.send('Bon j\'ai pas que ça a faire, rappelle moi plus tard');
                    sent.delete();
                })
            )
    },
    dealerTurn(sent, message){
        if (this.dealer.value < 17){
            if (this.dealer.cards.length === 2) {
                sent.edit('```' + this.dealerArt + ' ('+this.dealer.value+')\n' + this.drawCards(false) + '```\n```' + this.playerArt + ' ('+this.player.value+')\n' + this.drawCards(true) + '```');
            }
            sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
            this.dealer.cards.push(this.deal());
            this.updatePlayerHandVal(this.dealer);
            sent.edit('```' + this.dealerArt + ' ('+this.dealer.value+')\n' + this.drawCards(false) + '```\n```' + this.playerArt + ' ('+this.player.value+')\n' + this.drawCards(true) + '```')
                .then(() => {this.dealerTurn(sent, message)});
        }
        else {
            this.endGame(sent, message);
        }
    },
    updatePlayerHandVal(player = this.player){
        player.value = 0;
        for (let card in player.cards){
            let regexp = new RegExp("^([AKQJ\\d]{1,2})");
            let match = player.cards[card].match(regexp);
            let card_value = this.card_values[match[1]];

            if (card_value === 1){
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
    resetVars(){
        this.deck = [];
        this.dealer = {
            cards: [],
            value: 0,
            aces: 0
        };
        this.player = {
            cards: [],
            value: 0,
            aces: 0
        };
    },
    drawVal(val = 0) {
        let val_str = val.toString();
        let asciiNb = [

        ]
    },
    drawCards(player, hide_second = false) {

        let cards = {};

        if (player){
            cards = this.player.cards;
        }
        else {
            cards = this.dealer.cards;
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

                x = x.replace('XX.', card_value + '.');
                x = x.replace('.XX', '.' + card_value2);
                x = x.replace('S', card_suit);
            }
            return x;
        });

        return card_tpl.join('\n');
    }
};





























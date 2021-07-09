module.exports = {
    name: 'blackjack',
    description: 'basic blackjack game',
    admin: false, // true si commande réservée aux admins
    deck: [],
    cardBack: ':question::question:',
    card_values: {
        'regional_indicator_a': 11,
        'regional_indicator_k': 10,
        'regional_indicator_q': 10,
        'regional_indicator_j': 10,
        'keycap_ten': 10,
        'nine': 9,
        'eight': 8,
        'seven': 7,
        'six': 6,
        'five': 5,
        'four': 4,
        'three': 3,
        'two': 2,
    },
    dealer: {
      cards: [],
      value: 0
    },
    player: {
      cards: [],
      value: 0
    },
    execute(message, args) {
        this.startGame(message);
    },
    // Number of cards
    makeDeck(count = 1){
        const suits = ['<:clubs_suit:862967280408068096>', '<:diamonds_suit:862967280971677726>', '<:hearts_suit:862967280191012895>', '<:spades_suit:862967280720019476>'];
        const values = [':regional_indicator_a:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:', ':regional_indicator_j:', ':regional_indicator_q:', ':regional_indicator_k:'];

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
            sent.edit('Dealer >> \nPlayer >> ' + this.player.cards[0])
                .then(() => {sent.edit('Dealer >> '  + this.dealer.cards[0] + '\nPlayer >> ' + this.player.cards[0])})
                .then(() => {sent.edit('Dealer >> '  + this.dealer.cards[0] + '\nPlayer >> ' + this.player.cards.join(' + '))})
                .then(() => {sent.edit('Dealer >> '  + this.dealer.cards[0] + '+' + this.cardBack + '\nPlayer ('+this.player.value+') >> ' + this.player.cards.join(' + '))})
                .then(() => {
                    this.playerTurn(sent, message);
                })
        });
    },
    endGame(sent, message){

        const filter = (reaction, user) => {
            return ['✅', '🛑'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

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
        sent.edit('Dealer ('+this.dealer.value+') >> '  + this.dealer.cards.join(' + ') + '\nPlayer ('+this.player.value+') >> ' + this.player.cards.join(' + ') + '\n===\n' + content)
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
                                sent.edit('Dealer ('+this.dealer.value+') >> '  + this.dealer.cards.join(' + ') + '\nPlayer ('+this.player.value+') >> ' + this.player.cards.join(' + ') + '\nA la prochaine !');
                                break;
                        }
                    })
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
                            sent.edit('Dealer >> '  + this.dealer.cards[0] + '+' + this.cardBack + '\nPlayer ('+this.player.value+') >> ' + this.player.cards.join(' + '));
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
                sent.edit('Dealer ('+this.dealer.value+') >> '  + this.dealer.cards.join(' + ') + '\nPlayer ('+this.player.value+') >> ' + this.player.cards.join(' + '));
            }
            sent.reactions.removeAll().catch(error => console.error('Erreur lors du retrait des reactions: ', error));
            this.dealer.cards.push(this.deal());
            this.updatePlayerHandVal(this.dealer);
            sent.edit('Dealer ('+this.dealer.value+') >> '  + this.dealer.cards.join(' + ') + '\nPlayer ('+this.player.value+') >> ' + this.player.cards.join(' + '))
                .then(() => {this.dealerTurn(sent, message)});
        }
        else {
            this.endGame(sent, message);
        }
    },
    updatePlayerHandVal(player = this.player){
        player.value = 0;
        for (let card in player.cards){
            let regexp = new RegExp(":(.+):<:");
            let match = player.cards[card].match(regexp);
            let card_value = this.card_values[match[1]];

            // Manage Aces
            if (player.value > 10 && card_value === 11){
                card_value = 1;
            }
            player.value += card_value;
        }
        return true;
    },
    resetVars(){
        this.deck = [];
        this.dealer = {
            cards: [],
            value: 0
        };
        this.player = {
            cards: [],
            value: 0
        };
    }
};
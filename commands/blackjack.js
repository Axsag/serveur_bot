module.exports = {
    name: 'blackjack',
    description: 'basic blackjack game',
    admin: false, // true si commande réservée aux admins
    deck: [],
    cardBack: ':question::flower_playing_cards:',
    playerID: '',
    card_values: {
        ':regional_indicator_a:': 11,
        ':regional_indicator_k:': 10,
        ':regional_indicator_q:': 10,
        ':keycap_ten:': 10,
        ':nine:': 9,
        ':eight:': 8,
        ':seven:': 7,
        ':six:': 6,
        ':five:': 5,
        ':four:': 4,
        ':three:': 3,
        ':two:': 2,
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
        this.makeDeck();
        this.shuffle();
        message.channel.send('Dealing...').then(sent => {
            for (let i = 0; i < 2; ++i){
                this.player.cards.push(this.deal());
                this.dealer.cards.push(this.deal());
            }
            sent.edit('Dealer  \nPlayer  ' + this.player.cards[0])
                .then(() => {sent.edit('Dealer  '  + this.dealer.cards[0] + '\nPlayer  ' + this.player.cards[0])})
                .then(() => {sent.edit('Dealer  '  + this.dealer.cards[0] + '\nPlayer  ' + this.player.cards[0] + '+' + this.player.cards[1])})
                .then(() => {sent.edit('Dealer  '  + this.dealer.cards[0] + '+' + this.dealer.cards[1] + '\nPlayer  ' + this.player.cards[0] + '+' + this.player.cards[1])})
        });
    },
    makeDeck(count = 4){
        const suits = [':clubs:', ':diamonds:', ':hearts:', ':spades:'];
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

};


/**
 * :green_square:
 * XXXXXXXXXX
 * XXDealerXX
 * XXC1XXC2XX
 * XXXXXXXXXX
 * XXXYOUXXXX
 * XXXC1XC2XX
 * XXXXXXXXXX
 *
 *
 *
 *
 *
 **/
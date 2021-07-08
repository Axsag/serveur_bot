class Deck {
    constructor(count = 6) {

    }

    shuffle(){
        const { deck } = this;
        let m = deck.length, i;

        while(m){
            i = Math.floor(Math.random() * m--);

            [deck[m], deck[i]] = [deck[i], deck[m]];
        }

        return this;
    }

    deal(){
        return this.deck.pop();
    }
}
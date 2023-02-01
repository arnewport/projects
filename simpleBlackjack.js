// simpleBlackjack, JavaScript version
// supports hitting, standing, doubling, and splitting
// does not support betting, surrendering, or insurance
// uses a single deck that is reshuffled after every game

// functions imitating Python functions used in the original program

const choice = () => {
    return Math.floor(Math.random() * deck.length);
}

const remove = (array, value) => {
    for (let i = 0; i < array.length; i++) { 
        if (array[i] === value) { 
            array.splice(i, 1);
            i = array.length; // ends the loop after removing one value
        }
    }
}

const deepcopy = (parameter) => {
    return JSON.parse(JSON.stringify(parameter));
}

// deck and players

const deckOfCards = ['A', 'A', 'A', 'A', '2', '2', '2', '2', '3', '3', '3', '3', '4', '4', '4', '4', '5', '5', '5', '5', '6', '6', '6', '6', '7', '7', '7', '7', '8', '8', '8', '8', '9', '9', '9', '9', '10', '10', '10', '10', 'J', 'J', 'J', 'J', 'Q', 'Q', 'Q', 'Q', 'K', 'K', 'K', 'K'];
let deck = deepcopy(deckOfCards);

let player = {name: 'Player', cards: [], double: false, value: 0, aces: 0, score: 0};
let dealer = {name: 'Dealer', cards: [], double: false, value: 0, aces: 0, score: 0};

let unfinishedHands = [];
let finishedHands = [];

// drawing and evaluating cards

// rig dealing and drawing by replacing drawCard with this:
// player.cards.push('10');
// always deal a blackjack with this:
// player.cards.length === 0 ? player.cards.push('A') : player.cards.push('10');

const dealHands = () => {
    for (let i = 0; i < 2; i++) {
        drawCard(dealer);
        drawCard(player);
    }
}

const drawCard = (hand) => {
    hand.cards.push(deck[choice()]);
    remove(deck, hand.cards[(hand.cards.length - 1)]);
}

const drawAndEvaluate = (hand) => {
    drawCard(hand);
    handValue(hand);
}

const handValue = (hand) => {
    hand.value = 0;
    hand.aces = 0;
    for (const card of hand.cards) {
        if (card === 'A') {
            hand.value += 11;
            hand.aces += 1;
        } else if (card === 'J') {
            hand.value += 10;
        } else if (card === 'Q') {
            hand.value += 10;
        } else if (card === 'K') {
            hand.value += 10;
        } else {
            hand.value += parseInt(card);
        }
    } 
    if (hand.value > 21) {
        while (hand.value > 21 && hand.aces > 0) {
            hand.value -= 10;
            hand.aces -= 1;
        }
    }
    // whenever handValue is run for the player, the dial is updated using setTheValue
    if (hand.name === 'Player') {
        setTheValue(player.value, playerValueOnes, playerValueTens);
    }
}

// player choice functions

const hit = () => {
    drawAndEvaluate(player);
    hitAnimation(1, activeHand, 'player')
    bustOrNot();
}

const stand = () => {
    addHandToFinishedHands();
}

const double = () => {
    player.double = true;
    drawAndEvaluate(player);
    hitAnimation(1, activeHand, 'player')
    bustOrNot();
}

const bustOrNot = () => {
    if (player.value > 21) {
        addHandToFinishedHands();
    } else if (player.double === false) {
        enableHitStand();
    } else if (player.double === true) {
        addHandToFinishedHands();
    }
}

const dealerLogic = () => {
    if (unfinishedHands.length === 0 && player.value > 21) {
    } else {
        while (dealer.value < 17) {
            drawAndEvaluate(dealer);
        }
    }
}

const addHandToFinishedHands = () => {
    finishedHands.push(deepcopy(player));
    compareHands();
}

const compareHands = () => {
    if (unfinishedHands.length > 0) {
        handSwapper();
        fadeInactiveHands();
    } else {
        unfadeAllHands();
        dealerLogic();
        for (hand of finishedHands) {
            let count = countValue(hand);
            if (hand.value > 21 || dealer.value > 21) {
                bust(count, hand);
            } else {
                comparison(count, hand);
            }
        }
        gameOver = true;
        executeFunctionAfterAllAnimationsFinish(revealAnimation)
        // the function below is handled elsewhere but keeping it here for potential refactoring purposes
        // updateScore();
    }
}

const bust = (count, hand) => {
    if (hand.value > 21) {
        dealer.score += count;
    } else if (dealer.value > 21) {
        player.score += count;  
    }
}

const comparison = (count, hand) => {
    if (dealer.value > hand.value) {
        dealer.score += count;
    } else if (dealer.value < hand.value) {
        player.score += count;
    }  
}

const countValue = (hand) => {
    if (hand.double === false) {
        let count = 1;
        return count;
    } else if (hand.double === true) {
        let count = 2;
        return count;
    }
}

const replay = () => {
    disableAllButtons();
    reset();
    suitsSetup();
    // animations
    resetValueDials();
    returnAnimationCombined();
    // only fire playGame once animations have completed
    // playGame();
    // somehow, I came up with a weird solution to this prior to my "executeAfterAnimations" function was created?
}

const reset = () => {
    deck = deepcopy(deckOfCards);
    dealer.cards = [];
    player.cards = [];
    dealer.value = 0;
    player.value = 0;
    unfinishedHands = [];
    finishedHands = [];
    player.double = false;
}

const playGame = () => {
    disableAllButtons()
    dealHands();
    handValue(dealer);
    handValue(player);
    // DISPLAY FUNCTIONS
    dealAnimation(0, dealerHand, 'dealer');
    // processingDealtCards occurs here if not handled by dealAnimation
}

// put this inside of a "don't execute until animations complete" function eventually
const processingDealtCards = () => {
    if (dealer.value === 21 || player.value === 21) {
        firstRoundBlackjack();
    } else if (player.cards[0] === player.cards[1]) {
        enableHitStandDoubleSplit();
    } else {
        enableHitStandDouble();
    }
}

const firstRoundBlackjack = () => {
    if (dealer.value === 21 && player.value !== 21) {
        dealer.score += 1;
    } else if (dealer.value !== 21 && player.value  === 21) {
        player.score += 1;
    }
    gameOver = true;
    revealAnimation();
}

// split and supporting functions

const split = () => {
    player.cards.pop();
    unfinishedHands.unshift(deepcopy(player));
    drawCard(player);
    drawCard(unfinishedHands[0]);
    handValue(player);
    handValue(unfinishedHands[0]);
    
    // DISPLAY FUNCTIONS
    splitAnimation(playerHandList[0].id);
    cardCount[1] = player.cards.length - 1;

    // I want to deal to the second hand AFTER the first has completed;
    // the only way I know how to do that is to put in directly in the hitAnimation promise
    // multipleHandDecisionTree used to be here
}

const multipleHandDecisionTree = () => {
    if (player.cards[0] === player.cards[1]) {
        enableHitStandDoubleSplit();
    } else {
        enableHitStandDouble();
    }
}

const handSwapper = () => {
    player.cards = deepcopy(unfinishedHands[0].cards);
    handValue(player);
    player.double = false;
    unfinishedHands.shift(); // unfinishedHands.splice(0, 1); // this could possibly be replaced with shift() but I remember avoiding shift() for a reason
    
    // DISPLAY FUNCTIONS / this bit is needed to make the animation work, not make the game logic work. It needs to be put in its own function later
    playerHandList.shift();
    activeHand = playerHandList[0];
    cardCount[1] = player.cards.length; // tinker with this

    multipleHandDecisionTree();
}

// button disabling and enabling functions

const disableButton = (id) => {
    document.getElementById(id).disabled = true;
}

const enableButton = (id) => {
    document.getElementById(id).disabled = false;
}

const enableMultipleButtons = (...id) => {
    for (let i = 0; i < id.length; i++) {
        enableButton(id[i]);
    } 
}

const disableAllButtons = () => {
  const temp = ['start', 'hit', 'stand', 'double', 'split', 'replay'];
  for (value of temp) {
    disableButton(value);
  }
}

const enableHitStand = () => {
    disableAllButtons();
    enableMultipleButtons('hit', 'stand');
}

const enableHitStandDouble = () => {
    disableAllButtons();
    enableMultipleButtons('hit', 'stand', 'double');
}

const enableHitStandDoubleSplit = () => {
    disableAllButtons();
    enableMultipleButtons('hit', 'stand', 'double', 'split');
}

const enableReplayButton = () => {
    disableAllButtons();
    enableButton('replay');    
}

const enableStartButton = () => {
    disableAllButtons();
    enableButton('start');
}

// initializing function

enableStartButton();

// ANIMATION FUNCTIONS

// variables supporting non-split animations
let cardCount = [0, 0] // [dealer, player]
// cannot increment the count properly with simple variables; I will fix this later
let dealCount = 0;
const animationDeck = document.querySelector('.deck');
const dealerHand = document.getElementById('dealer-card-list');
const playerHand = document.getElementById('player-card-list-1');

// variables supporting split animations
let handCount = 1;
let playerHandList = [playerHand];
let activeHand = playerHand;
let activelySplitting = false;
const wrapper = document.querySelector('.flexbox-wrapper');

// assorted animation supporting variables and functions

let gameOver = false; // quirky variable, may replace

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const originalCard = document.querySelector('.original-card');

const cloner = () => {
  const clone = originalCard.cloneNode(true);
  clone.classList.remove('original-card');
  clone.classList.remove('hidden');
  return clone;
}

// animation functions

const hitAnimation = (countIndex, hand, string, side = 'none') => {
    // create new card
    cardCount[countIndex]++;
    const card = cloner();

    // an awkward way of handling how splits display the value of the card
    if (string === 'dealer') {
        displayCardValue(dealer.cards[(cardCount[countIndex] - 1)], card);
    } else if (side === 'none') {
        displayCardValue(player.cards[(cardCount[countIndex] - 1)], card);
    }
    if (side === 'left') {
        displayCardValue(player.cards[1], card);
    }
    if (side === 'right') {
        displayCardValue(unfinishedHands[0].cards[1], card);
    }

    // first position

    // THIS IS DUPLICATE CODE
    // originally, I could specify whether the player or dealer cards needed to be moved easily
    // but after making splits work properly, that stopped
    // there is likely a way, but this is the quick and dirty fix
    const dealerCardsInHand = Array.from(dealerHand.querySelectorAll('.card'));
    const dealerCardsInHandPositions = dealerCardsInHand.map((card) => {
        const dealerBoundingRect = card.getBoundingClientRect();
        return {
            x: dealerBoundingRect.x,
            y: dealerBoundingRect.y,
        };
    });

    const cardsInHand = Array.from(wrapper.querySelectorAll('.card'));
    const cardsInHandPositions = cardsInHand.map((card) => {
        const boundingRect = card.getBoundingClientRect();
        return {
            x: boundingRect.x,
            y: boundingRect.y,
        };
    });

    const startPosition = animationDeck.getBoundingClientRect();
    hand.appendChild(card);

    // last position
    const endPosition = card.getBoundingClientRect();
    const translationX = startPosition.x - endPosition.x;
    const translationY = startPosition.y - endPosition.y;

    // invert and play
    card.animate([
      { transform: `translate(${translationX}px, ${translationY}px) rotateY(180deg)` },
      { transform: 'translate(0px, 0px) rotateY(180deg)' },
      { transform: 'none' }
      ], { duration: 1000, easing: 'ease-out' });
      Promise.all(card.getAnimations().map((animation) => animation.finished)).then(
        () => {

            // I cannot get promises to work except by putting them in this function and
            // checking for conditions once the finished state of the animation is detected
            // I think I can solve this now but I'm dealing with other issues first

            // run hit animations until all dealer cards are displayed
            // this is triggering before the revealAnimation is run
            // alter this to ensure it only runs once the revealAnimation has been completed
            // perhaps check to see if the color of the card is still transparent or something
            if (Array.from(dealerHand.querySelectorAll('.card')).length < dealer.cards.length) {
                hitAnimation(0, dealerHand, 'dealer');
            } 
            // if the game is over and all of the dealer cards are displayed, activate replay button
            else if (gameOver === true && Array.from(dealerHand.querySelectorAll('.card')).length === dealer.cards.length) {
                gameOver = false;
                updateScore();
                enableReplayButton();
            }
            // if a split occurs, hit the right after hitting the left
            else if (activelySplitting === true) {
                cardCount[1] = unfinishedHands[0].cards.length - 1;
                hitAnimation(1, playerHandList[1], 'player', 'right');
                activelySplitting = false;
                multipleHandDecisionTree();

            // I AM NOT SURE IF THE COMMENTS BELOW ARE RELEVANT ANYMORE OR NOT

            // if the second card has been dealt after actively splitting...
            // this is actually "are we not actively splitting" and "are there multiple hands"
            // while it does achieve the target case, it is not selective enough
            // but it is functional given that it does not result in adverse behavior

            // condition for hitting after split occurs / insert it here
            // to be specific, it means I hit the left card, wait for it to run, then hit the right card

            }
            // if not actively splitting, make the inactive hands semi-transparent
            else if (activelySplitting === false && Array.from(wrapper.querySelectorAll('.card-list').length > 1)) {
                fadeInactiveHands();
            } 
        });

    // THIS IS DUPLICATE CODE
    // originally, I could specify whether the player or dealer cards needed to be moved easily
    // but after making splits work properly, that stopped
    // there is likely a way, but this is the quick and dirty fix
    dealerCardsInHand.forEach((card, index) => {
        const { x: startCardX, y: startCardY } = dealerCardsInHandPositions[index];
        const cardBoundingRect = card.getBoundingClientRect();
        const endCardX = cardBoundingRect.x;
        const endCardY = cardBoundingRect.y;
        card.animate([
          { transform: `translate(${startCardX - endCardX}px, ${startCardY - endCardY}px)` },
          { transform: 'none' },
          ], { duration: 1000, easing: 'ease-in-out', fill: 'both' });
  });

    cardsInHand.forEach((card, index) => {
        const { x: startCardX, y: startCardY } = cardsInHandPositions[index];
        const cardBoundingRect = card.getBoundingClientRect();
        const endCardX = cardBoundingRect.x;
        const endCardY = cardBoundingRect.y;
        card.animate([
        { transform: `translate(${startCardX - endCardX}px, ${startCardY - endCardY}px)` },
        { transform: 'none' },
        ], { duration: 1000, easing: 'ease-in-out', fill: 'both' });
    });
}

// this function is the root of the problem! When it comes to firing multiple animation events / promises
const returnAnimation = (hand) => {

  const triggerCard = hand.children[0]
  const cardsInHand = Array.from(hand.querySelectorAll('.card'));
  const length = cardsInHand.length;

  // first
  const secondToLastCard = cardsInHand[length - 2];
  const startPosition = secondToLastCard.getBoundingClientRect();

  // last
  const lastCard = cardsInHand[length - 1];
  const endPosition = lastCard.getBoundingClientRect();

  // translation distance
  const translationX = startPosition.x - endPosition.x;
  const translationY = startPosition.y - endPosition.y;

  // can I do this twice?
  const deckPosition = animationDeck.getBoundingClientRect();
  const translationX2 = deckPosition.x - endPosition.x;
  const translationY2 = deckPosition.y - endPosition.y;

  //invert and play
  for (let i = 0; i < length; i++) {
    const card = cardsInHand[i];
    card.animate([
      { transform: 'none' },
      { transform: 'rotateY(180deg)' },
      { transform: `translate(${-translationX * (length - (i + 1))}px, ${-translationY  * (length - (i + 1))}px) rotateY(180deg)` },
      { transform: `translate(${-translationX * (length - (i + 1)) + translationX2}px, ${-translationY  * (length - (i + 1)) + translationY2 }px) rotateY(180deg)` },
      ], { duration: 1500, easing: 'ease-out', fill: 'forwards' });
    // remove
    Promise.all(card.getAnimations().map((animation) => animation.finished)).then(
        () => {
          card.remove();
          cardCount = [0, 0];
        });
  }
  Promise.all(triggerCard.getAnimations().map((animation) => animation.finished)).then(
    () => {
      if (hand === dealerHand) {
          shuffleAnimation();
      }
    });
}

const returnAnimationCombined = () => {
    returnAnimation(dealerHand);
    // something happened to playerHandList
    // no idea what changed, but selecting all hands seems to be the easiest way to fix this part
    const allPlayerHands = Array.from(wrapper.querySelectorAll('.card-list'));
    allPlayerHands.forEach(hand => returnAnimation(hand));
    playerHandList = [playerHand];
    activeHand = playerHand;
    // I had a way of cleaning up the extra added lists
    // IDK what happened to it, but I recreated it here
}

const shuffleAnimation = () => {
  animationDeck.style.backgroundColor = 'transparent';
  animationDeck.style.borderColor = 'transparent';
  // make shuffleCards an external variable
  const shuffleCards = Array.from(animationDeck.querySelectorAll('.shuffle'));
  for (let i = 0; i < shuffleCards.length; i++) {
    shuffleCards[i].classList.remove('hidden')
    if (i % 2 === 0) {
      sleep(i * 100).then(() => { shuffleCards[i].animate([
        { transform: 'rotate(0deg) translateX(0) scale(1)'},
        { transform: 'rotate(-5deg) translateX(-105%) scale(0.96)'},
        { transform: 'rotate(0) translateX(0)'}
        ], { duration: 1000, easing: 'linear', fill: 'forwards'});
      });
    } else {
        sleep(i * 100).then(() => { shuffleCards[i].animate([
          { transform: 'rotate(0deg) translateX(0) scale(1)'},
          { transform: 'rotate(5deg) translateX(105%) scale(0.96)'},
          { transform: 'rotate(0) translateX(0)'}
          ], { duration: 1000, easing: 'linear', fill: 'forwards'});
      })
    }
  }

  // this does not truly detect the end of the last card's animation
  // but combined with setTimeout, it works
  Promise.all(shuffleCards[5].getAnimations().map((animation) => animation.finished)).then(
    () => {
        // setTimeout will not have to be used if I can accurately identify when all functions have finished running
        // I can use executeFunctionAfterAllAnimationsFinish(functionToExecute)?
        setTimeout(shuffleAnimationReset, 1500);
  })
}

const shuffleAnimationReset = () => {
    animationDeck.style.backgroundColor = 'white';
    animationDeck.style.borderColor = 'black';
    const shuffleCards = Array.from(animationDeck.querySelectorAll('.shuffle'));
    for (let i = 0; i < shuffleCards.length; i++) {
        shuffleCards[i].classList.add('hidden');
    }
    // reseting number of hands after splitting // I believe I had to recreate this for some reason
    const allPlayerHands = Array.from(wrapper.querySelectorAll('.card-list'));
    for (let i = 0; i < allPlayerHands.length; i++) {
        if (i !== 0) {
            allPlayerHands[i].remove();
        }
    }
    // splitting reset over
    playGame();
}

const dealAnimation = (countIndex, hand, string) => {
    // create new card
    cardCount[countIndex]++;
    const card = cloner();

    // awkward way of ensuring card values are displayed
    if (string === 'dealer') {
        displayCardValue(dealer.cards[(cardCount[countIndex] - 1)], card);
    } else {
        displayCardValue(player.cards[(cardCount[countIndex] - 1)], card);
    }

    // first position
    const cardsInHand = Array.from(hand.querySelectorAll('.card'));
    const cardsInHandPositions = cardsInHand.map((card) => {
        const boundingRect = card.getBoundingClientRect();
        return {
            x: boundingRect.x,
            y: boundingRect.y,
        };
    });
    const startPosition = animationDeck.getBoundingClientRect();
    hand.appendChild(card);

    // last position
    const endPosition = card.getBoundingClientRect();
    const translationX = startPosition.x - endPosition.x;
    const translationY = startPosition.y - endPosition.y;

    // invert and play
    if (dealCount === 0) {
        card.style.color = 'transparent';
        card.animate([
        { transform: `translate(${translationX}px, ${translationY}px)` },
        { transform: 'none' }
        ], { duration: 500, easing: 'ease-out' });
    } else {
        card.animate([
        { transform: `translate(${translationX}px, ${translationY}px) rotateY(180deg)` },
        { transform: 'translate(0px, 0px) rotateY(180deg)' },
        { transform: 'none' }
        ], { duration: 1000, easing: 'ease-out' });
    }

    Promise.all(card.getAnimations().map((animation) => animation.finished)).then(() => {
        if (dealCount < 3) {
            dealCount++
            if (dealCount % 2 === 0) {
                dealAnimation(0, dealerHand, 'dealer')
            } else {
                dealAnimation(1, playerHand, 'player')
            }
        } else {
            dealCount = 0;
            processingDealtCards();
        } 
    });

    cardsInHand.forEach((card, index) => {
        const { x: startCardX, y: startCardY } = cardsInHandPositions[index];
        const cardBoundingRect = card.getBoundingClientRect();
        const endCardX = cardBoundingRect.x;
        const endCardY = cardBoundingRect.y;
        card.animate([
            { transform: `translate(${startCardX - endCardX}px, ${startCardY - endCardY}px)` },
            { transform: 'none' },
            ], { duration: 500, easing: 'ease-in-out', fill: 'both' });
    });
}

const revealAnimation = () => {

  // setTheValue will reveal the final value here after all cards are drawn
  // if I wanted it to display the value after each card was drawn,
  // I would need to make the game logic wait until the animations have completed
  // as, right now, the game logic draws cards instantly and then the animations display what happens
  setTheValue(dealer.value, dealerValueOnes, dealerValueTens);

  card = dealerHand.children[0];
  if (card.style.color === 'transparent') {
    card.style.color = 'black';
    card.animate([
    { transform: 'rotateY(180deg)' },
    { transform: 'none' }
  ], {duration: 500, easing: 'ease-out' });
  } else {
    card.animate([
        { transform: 'none' }
    ], {duration: 0});
  }
  Promise.all(card.getAnimations().map((animation) => animation.finished)).then(
    () => {
        // run hit animations until all dealer cards are displayed
        if (Array.from(dealerHand.querySelectorAll('.card')).length < dealer.cards.length && player.value <= 21) {
            hitAnimation(0, dealerHand, 'dealer');
        
        } 
        // if the game is over and all of the dealer cards are displayed, activate replay button
        else if (gameOver === true && Array.from(dealerHand.querySelectorAll('.card')).length === dealer.cards.length) {
            gameOver = false;
            updateScore();
            enableReplayButton();
        }
    });
}

const splitAnimation = (handID) => {

    // FIRST

    const firstCardStart = activeHand.children[0].getBoundingClientRect();
    const secondCardStart = activeHand.children[1].getBoundingClientRect();

    // awkward way of getting the suit of the second card
    // in theory, for an "infinite splitting" setting, this would work to accurately represent the value
    const secondCardSuit = activeHand.children[1].querySelector('.suit').innerText;
    
    // OPERATIONS

    handCount += 1;
    const original = document.getElementById(`${handID}`);
    original.removeChild(original.lastChild);
    const clone = original.cloneNode(true);
    clone.id = `player-card-list-${handCount}`;

    // awkward way of getting the element representing the second card
    displayCardSuit(clone.children[0], secondCardSuit);

    // find the index
    const index = playerHandList.indexOf(original);

    playerHandList.splice(index + 1, 0, clone);
    wrapper.insertBefore(clone, wrapper.children[index + 1]);

    // LAST

    const firstCard = playerHandList[0].children[0];
    const secondCard = playerHandList[1].children[0];

    const firstCardEnd = firstCard.getBoundingClientRect();
    const secondCardEnd = secondCard.getBoundingClientRect();

    const firstCardTranslationX = firstCardStart.x - firstCardEnd.x;
    const firstCardTranslationY = firstCardStart.y - firstCardEnd.y;

    const secondCardTranslationX = secondCardStart.x - secondCardEnd.x;
    const secondCardTranslationY = secondCardStart.y - secondCardEnd.y;

    // INVERT AND PLAY

    firstCard.animate([
        { transform: `translate(${firstCardTranslationX}px, ${firstCardTranslationY}px)` },
        { transform: 'none' }
        ], { duration: 500, easing: 'ease-in-out' });

    secondCard.animate([
        { transform: `translate(${secondCardTranslationX}px, ${secondCardTranslationY}px)` },
        { transform: 'none' }
        ], { duration: 500, easing: 'ease-in-out' });

    Promise.all(secondCard.getAnimations().map((animation) => animation.finished)).then(
        () => {
            // hit the left hand card after a split occurs
            hitAnimation(1, playerHandList[0], 'player', 'left')
            activelySplitting = true;
        });
}

const fadeInactiveHands = () => {
    // I will change how overlaps work... so that, despite being transparent,
    // overlapped cards do not show through the overlapping card
    const cardsInHand = Array.from(wrapper.querySelectorAll('.card'));
    for (let i = 0; i < cardsInHand.length; i++) {
            cardsInHand[i].style.opacity = '0.5';
    }
    const cardsInActiveHand = Array.from(activeHand.querySelectorAll('.card'));
    for (let i = 0; i < cardsInActiveHand.length; i++) {
        cardsInActiveHand[i].style.opacity = '1';
    }
}

const unfadeAllHands = () => {
    const cardsInHand = Array.from(wrapper.querySelectorAll('.card'));
    for (let i = 0; i < cardsInHand.length; i++) {
            cardsInHand[i].style.opacity = '1';
    }
}

const suits = ['\u2660', '\u2665', '\u2666', '\u2663'];
const potentialCardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let suitsInUseMap = null;

const suitsSetup = () => {
    suitsInUseMap = new Map();
    for (let i = 0; i < potentialCardValues.length; i++) {
        suitsInUseMap.set(potentialCardValues[i], suits)
    }
}

// prepares suitsInUseMap
suitsSetup();

// The animation must run BEFORE this function, as the animation creates the card that is referenced
const displayCardValue = (cardValue, animationCard) => {
    const displayValue = Array.from(animationCard.querySelectorAll('.value'));
    for (let i = 0; i < displayValue.length; i++) {
        displayValue[i].innerText = cardValue;
    }

    suitValue = determineCardSuit(cardValue);
    displayCardSuit(animationCard, suitValue);
}

const displayCardSuit = (animationCard, suitValue) => {
    const suitIconLocations = Array.from(animationCard.querySelectorAll('.suit'));
    for (let i = 0; i < suitIconLocations.length; i++) {
        suitIconLocations[i].innerText = suitValue;
    }
    if (suitValue === '\u2665' || suitValue === '\u2666') {
        animationCard.style.color = 'red';
    } else {
        animationCard.style.color = 'black';
    }
}

const determineCardSuit = (cardValue) => {
    suitsAvailable = deepcopy(suitsInUseMap.get(cardValue));
    suitValue = suitsAvailable[Math.floor(Math.random() * suitsAvailable.length)];
    remove(suitsAvailable, suitValue);
    // ensures there will be no empty array errors during testing but it unnecessary for normal program function
    if (suitsAvailable.length < 1) {
        suitsAvailable.push('X')
    }
    // necessary code continues
    suitsInUseMap.set(cardValue, suitsAvailable)
    return suitValue     
}

// use playState to get an array of all animation states
// if one is running, check for another; check always occurs after the animation would be executed by the promise
// once there are no animations running, execute the function
const executeFunctionAfterAllAnimationsFinish = (functionToExecute) => {
    Promise.all(document.getAnimations().map((animation) => animation.finished)).then(
        () => {
            let animationPlayStates = document.getAnimations().map((animation) => animation.playState);
            if (animationPlayStates.includes('running')) {
                executeFunctionAfterAllAnimationsFinish(functionToExecute);
            } else {
                functionToExecute();
            } 
        });
}

// testing function for executeFunctionAfterAllAnimationsFinish
const displayAllAnimations = () => {
    console.log(document.getAnimations().map((animation) => animation.playState))
    setTimeout(displayAllAnimations, 1000);
}

// display dial functions

const items = document.querySelectorAll(".item");

const setupItems = () => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.children[0].innerText = 1;
        item.children[1].innerText = 0;
    }
}

setupItems();

const dealerValueDial = document.querySelector('.dealer-value');
const dealerScoreDial = document.querySelector('.dealer-score');
const playerValueDial = document.querySelector('.player-value');
const playerScoreDial = document.querySelector('.player-score');

let dealerValueOnes = { element: dealerValueDial.querySelector('.ones'), direction: 'up', start: 0 };
let dealerValueTens = { element: dealerValueDial.querySelector('.tens'), direction: 'up', start: 0 };

let dealerScoreOnes = { element: dealerScoreDial.querySelector('.ones'), direction: 'up', start: 0 };
let dealerScoreTens = { element: dealerScoreDial.querySelector('.tens'), direction: 'up', start: 0 };

let playerValueOnes = { element: playerValueDial.querySelector('.ones'), direction: 'up', start: 0 };
let playerValueTens = { element: playerValueDial.querySelector('.tens'), direction: 'up', start: 0 };

let playerScoreOnes = { element: playerScoreDial.querySelector('.ones'), direction: 'up', start: 0 };
let playerScoreTens = { element: playerScoreDial.querySelector('.tens'), direction: 'up', start: 0 };

// I believe I can simply it by adding an "end" property to the object and using that to replace endValue
// I originally did this, but did not set up my functions correctly, so it did not work properly

const setTheValue = (value, ones, tens) => {
    onesEnd = value % 10;
    tensEnd = Math.floor(value / 10);
    checkAndSetDirection(onesEnd, ones);
    checkAndSetDirection(tensEnd, tens);
}

const checkAndSetDirection = (endValue, object) => {
    if (endValue > object.start) {
        object.start = endValue;
        if (object.direction === 'down') {
            switchUp(endValue, object);
        } else {
            increasePlace(endValue, object);
        }
    } else if (endValue < object.start) {
        object.start = endValue;
        if (object.direction === 'up') {
            switchDown(endValue, object);
        } else {
            decreasePlace(endValue, object);
        }
    }
}

const switchUp = (endValue, object) => {
    object.direction = 'up';
    object.element.style.marginTop = '-100px';
    increasePlace(endValue, object);
}

const switchDown = (endValue, object) => {
    object.direction = 'down';
    object.element.style.marginTop = '0px';
    decreasePlace(endValue, object);
}

const increasePlace = (endValue, object) => {
    object.element.children[0].innerText = endValue;
    if (object.element.children[0].innerText !== object.element.children[1].innerText) {
        animateTargetUp(object);
    }
}

const decreasePlace = (endValue, object) => {
    object.element.children[1].innerText = endValue;
    if (object.element.children[1].innerText !== object.element.children[0].innerText) {
        animateTargetDown(object);
    }
}

const animateTargetUp = (object) => {
    object.element.animate(
        [{ transform: 'translateY(0px)' },
        { transform: 'translateY(100px)' }], { duration: 500, easing: 'ease-in-out', iterations: 1}
    );
    Promise.all(object.element.getAnimations().map((animation) => animation.finished)).then(
        () => {
            object.element.children[1].innerText = parseInt(object.element.children[0].innerText);
    });
}

const animateTargetDown = (object) => {
    object.element.animate(
        [{ transform: 'translateY(0px)' },
        { transform: 'translateY(-100px)' }], { duration: 500, easing: 'ease-in-out', iterations: 1}
    );
    Promise.all(object.element.getAnimations().map((animation) => animation.finished)).then(
        () => {
            object.element.children[0].innerText = parseInt(object.element.children[1].innerText);
    });
}

const updateScore = () => {
    if ((dealerScoreTens.start * 10 + dealerScoreOnes.start) !== dealer.score) {
        setTheValue(dealer.score, dealerScoreOnes, dealerScoreTens);
    }
    if ((playerScoreTens.start * 10 + playerScoreOnes.start) !== player.score) {
        setTheValue(player.score, playerScoreOnes, playerScoreTens);
    }
}

const resetValueDials = () => {
    setTheValue(player.value, playerValueOnes, playerValueTens);
    setTheValue(dealer.value, dealerValueOnes, dealerValueTens);
}

// button variables

const startButton = document.getElementById('start');
const hitButton = document.getElementById('hit');
const standButton = document.getElementById('stand');
const doubleButton = document.getElementById('double');
const splitButton = document.getElementById('split');
const replayButton = document.getElementById('replay');

// event listeners

startButton.addEventListener('click', playGame);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
doubleButton.addEventListener('click', double);
splitButton.addEventListener('click', split);
replayButton.addEventListener('click', replay);

// create a function turning the color of the hand value red if it is over 21?
// the same function might change the color of the hand value when it is exactly 21?
// create a function where the cards wobble upon busting?
// replace arrays with maps in some cases?
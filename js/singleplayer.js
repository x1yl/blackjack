document.addEventListener("DOMContentLoaded", () => {
  let fullDeck = [
    "2_of_hearts",
    "3_of_hearts",
    "4_of_hearts",
    "5_of_hearts",
    "6_of_hearts",
    "7_of_hearts",
    "8_of_hearts",
    "9_of_hearts",
    "10_of_hearts",
    "jack_of_hearts",
    "queen_of_hearts",
    "king_of_hearts",
    "ace_of_hearts",
    "2_of_diamonds",
    "3_of_diamonds",
    "4_of_diamonds",
    "5_of_diamonds",
    "6_of_diamonds",
    "7_of_diamonds",
    "8_of_diamonds",
    "9_of_diamonds",
    "10_of_diamonds",
    "jack_of_diamonds",
    "queen_of_diamonds",
    "king_of_diamonds",
    "ace_of_diamonds",
    "2_of_clubs",
    "3_of_clubs",
    "4_of_clubs",
    "5_of_clubs",
    "6_of_clubs",
    "7_of_clubs",
    "8_of_clubs",
    "9_of_clubs",
    "10_of_clubs",
    "jack_of_clubs",
    "queen_of_clubs",
    "king_of_clubs",
    "ace_of_clubs",
    "2_of_spades",
    "3_of_spades",
    "4_of_spades",
    "5_of_spades",
    "6_of_spades",
    "7_of_spades",
    "8_of_spades",
    "9_of_spades",
    "10_of_spades",
    "jack_of_spades",
    "queen_of_spades",
    "king_of_spades",
    "ace_of_spades",
  ];

  let topCards = [];
  let bottomCards = [];
  let wallet = 1e6;
  let betAmount = 0;

  const betModal = document.getElementById("betModal");
  const betInput = document.getElementById("betAmountInput");
  const betSubmit = document.getElementById("betSubmit");

  const insuranceModal = document.getElementById("insuranceModal");
  const insuranceYes = document.getElementById("insuranceYes");
  const insuranceNo = document.getElementById("insuranceNo");

  const popupModal = document.getElementById("popupModal");

  function showPopup(message) {
    document.getElementById("popupMessage").textContent = message;
    popupModal.classList.remove("hidden");
  }

  document.getElementById("popupClose").addEventListener("click", () => {
    popupModal.classList.add("hidden");
  });

  function shuffleDeck(fullDeck) {
    deck = [...fullDeck];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function displayCard(card, containerId) {
    const cardContainer = document.getElementById(containerId);
    const cardImg = document.createElement("img");
    cardImg.src = `images/${card}.png`;
    cardImg.alt = card;
    cardImg.classList.add("w-16", "h-24", "m-1");
    cardContainer.appendChild(cardImg);
  }

  function calculateTotal(cards) {
    let total = 0;
    let aces = 0;

    cards.forEach((card) => {
      let value = card.split("_")[0];
      if (value === "jack" || value === "queen" || value === "king") {
        total += 10;
      } else if (value === "ace") {
        aces += 1;
        total += 11;
      } else {
        total += parseInt(value);
      }
    });

    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    return { total, aces };
  }

  betSubmit.addEventListener("click", () => {
    betAmount = parseInt(betInput.value);
    if (betAmount > 0 && betAmount <= wallet) {
      console.log(`You bet $${betAmount}`);
      wallet -= betAmount;
      console.log(`You have $${wallet} left in your wallet`);
      document.getElementById(
        "activeBet"
      ).textContent = `Current Wallet: $${wallet}`;
      document.getElementById(
        "betAmount"
      ).textContent = `Bet Amount: $${betAmount}`;
      betModal.classList.add("hidden");
      dealCards(deck);
    } else {
      showPopup(`Invalid bet amount. You have $${wallet} in your wallet.`);
    }
  });
  function promptBet() {
    const interval = setInterval(() => {
      if (popupModal.classList.contains("hidden")) {
        betModal.classList.remove("hidden");
        clearInterval(interval);
      }
    }, 100);
  }

  function promptInsurance() {
    insuranceModal.classList.remove("hidden");

    insuranceYes.addEventListener("click", () => {
      if (wallet >= betAmount / 2) {
        wallet -= betAmount / 2;
        let insuranceAmount = betAmount / 2;
        betAmount += insuranceAmount;
        document.getElementById(
          "activeBet"
        ).textContent = `Current Wallet: $${wallet}`;
        document.getElementById(
          "betAmount"
        ).textContent = `Bet Amount: $${betAmount}`;
        if (calculateTotal(topCards)["total"] === 21) {
          showPopup("You won insurance!");
          wallet += betAmount;
          document.getElementById(
            "activeBet"
          ).textContent = `Current Wallet: $${wallet}`;
          deck = shuffleDeck(fullDeck);
          promptBet();
        } else {
          showPopup("You lost insurance!");
          betAmount -= insuranceAmount;
        }
      } else {
        showPopup("Insufficient funds for insurance.");
      }
      insuranceModal.classList.add("hidden");
    });

    insuranceNo.addEventListener("click", () => {
      insuranceModal.classList.add("hidden");
    });
  }

  function dealCards(deck) {
    const topCardContainer = document.getElementById("topCardContainer");
    const bottomCardContainer = document.getElementById("bottomCardContainer");

    topCardContainer.innerHTML = "";
    bottomCardContainer.innerHTML = "";

    topCards = [];
    bottomCards = [];

    const dealerCard = deck.shift();
    displayCard(dealerCard, "topCardContainer");
    displayCard("back", "topCardContainer");
    const dealerCard2 = deck.shift();
    topCards.push(dealerCard);
    topCards.push(dealerCard2);
    setTimeout(() => {
      if (dealerCard.split("_")[0] === "ace") {
        console.log("Insurance?");
        promptInsurance();
      }
    }, 100);
    for (let i = 0; i < 2; i++) {
      let playerCard = deck.shift();
      displayCard(playerCard, "bottomCardContainer");
      bottomCards.push(playerCard);
    }
    setTimeout(() => {
      if (calculateTotal(bottomCards)["total"] === 21) {
        showPopup("You won! Natural Blackjack!");
        wallet += betAmount * 2.5;
        deck = shuffleDeck(fullDeck);
        promptBet();
      }
    }, 100);
  }

  function hit(deck) {
    if (deck.length > 0) {
      const playerCard = deck.shift();
      displayCard(playerCard, "bottomCardContainer");
      bottomCards.push(playerCard);
      setTimeout(() => {
        if (calculateTotal(bottomCards)["total"] > 21) {
          showPopup("You lost!");
          deck = shuffleDeck(fullDeck);
          promptBet();
        }
      }, 100);
    } else {
      console.log("No more cards in the deck");
      showPopup("No more cards in the deck");
    }
  }

  function stand() {
    console.log("Player stands");
    const topCardContainer = document.getElementById("topCardContainer");
    const backCardImg = topCardContainer.querySelector(
      'img[src="images/back.png"]'
    );
    if (backCardImg) {
      topCardContainer.removeChild(backCardImg);
    }
    displayCard(topCards[1], "topCardContainer");
    let { total: dealerTotal, aces: dealerAces } = calculateTotal(topCards);
    const { total: playerTotal } = calculateTotal(bottomCards);
    while (dealerTotal < 17 || (dealerTotal == 17 && dealerAces > 0)) {
      const dealerCard = deck.shift();
      displayCard(dealerCard, "topCardContainer");
      topCards.push(dealerCard);
      const result = calculateTotal(topCards);
      dealerTotal = result.total;
      dealerAces = result.aces;
    }
    setTimeout(() => {
      if (dealerTotal > 21) {
        showPopup("You won!");
        wallet += betAmount * 2;
        deck = shuffleDeck(fullDeck);
        promptBet();
      } else if (playerTotal > dealerTotal) {
        showPopup("You won!");
        wallet += betAmount * 2;
        deck = shuffleDeck(fullDeck);
        promptBet();
      } else if (playerTotal < dealerTotal) {
        showPopup("You lost!");
        deck = shuffleDeck(fullDeck);
        promptBet();
      } else {
        showPopup("Push!");
        wallet += betAmount;
        deck = shuffleDeck(fullDeck);
        promptBet();
      }
    }, 100);
  }

  deck = shuffleDeck(fullDeck);
  promptBet();
  document
    .getElementById("hitButton")
    .addEventListener("click", () => hit(deck));
  document.getElementById("standButton").addEventListener("click", stand);
});

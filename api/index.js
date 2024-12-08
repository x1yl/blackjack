require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Pusher = require('pusher');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
app.use(express.static(path.join('public')));

app.get('/', (request, response) => {
  response.sendFile(path.join('public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Express intro running on localhost:3000');
});
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

let games = {};

app.post('/create-game', (req, res) => {
  const gameId = `game-${Date.now()}`;
  games[gameId] = {
    players: [],
    deck: shuffleDeck(fullDeck),
    state: 'waiting'
  };
  console.log(`Game created with ID: ${gameId}`);
  res.json({ gameId });
});

app.post('/join-game', (req, res) => {
  const { gameId, playerName } = req.body;
  if (games[gameId]) {
    games[gameId].players.push({ name: playerName, hand: [] });
    pusher.trigger(gameId, 'player-joined', { players: games[gameId].players });
    console.log(`Player ${playerName} joined game ${gameId}`);
    res.json({ players: games[gameId].players });
  } else {
    console.error(`Game not found: ${gameId}`);
    res.status(404).json({ message: 'Game not found' });
  }
});

app.post('/start-game', (req, res) => {
  const { gameId } = req.body;
  if (games[gameId]) {
    games[gameId].state = 'playing';
    dealInitialCards(games[gameId]);
    pusher.trigger(gameId, 'game-started', { game: games[gameId] });
    res.json({ message: 'Game started' });
  } else {
    res.status(404).json({ message: 'Game not found' });
  }
});

app.post('/player-ready', (req, res) => {
  const { gameId, playerName } = req.body;
  if (games[gameId]) {
    const player = games[gameId].players.find(p => p.name === playerName);
    if (player) {
      player.ready = true;
      const allReady = games[gameId].players.every(p => p.ready);
      if (allReady) {
        games[gameId].state = 'playing';
        dealInitialCards(games[gameId]);
        pusher.trigger(gameId, 'game-started', { game: games[gameId] });
        res.json({ message: 'Game started' });
      } else {
        res.json({ message: 'Player is ready' });
      }
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } else {
    res.status(404).json({ message: 'Game not found' });
  }
});

module.exports = app;

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

function shuffleDeck(fullDeck) {
  let deck = [...fullDeck];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealInitialCards(game) {
  for (let player of game.players) {
    player.hand.push(game.deck.shift(), game.deck.shift());
  }
}
document.addEventListener('DOMContentLoaded', () => {
  Pusher.logToConsole = true;
  const pusher = new Pusher('1b607f15461a7cd0d67f', {
    cluster: 'us2'
  });

  document.getElementById('create-game-btn').addEventListener('click', () => {
    createGame();
  });

  document.getElementById('join-game-btn').addEventListener('click', () => {
    const gameId = prompt('Enter Game ID:');
    const playerName = prompt('Enter your name:');
    if (gameId && playerName) {
      joinGame(gameId, playerName);
    }
  });

  document.getElementById('start-game-btn').addEventListener('click', () => {
    const gameId = document.getElementById('start-game-btn').dataset.gameId;
    const playerName = document.getElementById('start-game-btn').dataset.playerName;
    playerReady(gameId, playerName);
  });

  function createGame() {
    fetch('/create-game', { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        const gameId = data.gameId;
        const playerName = prompt('Enter your name:');
        joinGame(gameId, playerName);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  function joinGame(gameId, playerName) {
    fetch('/join-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, playerName })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Player joined:', data.players);
      updateWaitingRoom(data.players);
      console.log(data.message);
      const channel = pusher.subscribe(gameId);
      channel.bind('player-joined', data => {
        console.log('Player joined:', data.players);
        updateWaitingRoom(data.players);
      });
      channel.bind('game-started', data => {
        console.log('Game started:', data.game);
        // Handle game start
      });
      console.log('Joined game successfully');
      showWaitingRoom(gameId, playerName);
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }

  function playerReady(gameId, playerName) {
    fetch('/player-ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, playerName })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data.message);
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }

  function startGame(gameId) {
    fetch('/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data.message);
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }

  function showWaitingRoom(gameId, playerName) {
    document.querySelector('.main-menu').classList.add('hidden');
    document.getElementById('waiting-room').classList.remove('hidden');
    document.getElementById('start-game-btn').dataset.gameId = gameId;
    document.getElementById('start-game-btn').dataset.playerName = playerName;
  }

  function updateWaitingRoom(players) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    players.forEach(player => {
      const playerItem = document.createElement('div');
      playerItem.textContent = player.name;
      playersList.appendChild(playerItem);
    });
  }
});
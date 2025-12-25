const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app (in the parent 'dist' directory)
app.use(express.static(path.join(__dirname, '../dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for mobile/web compatibility
    methods: ["GET", "POST"]
  }
});

// --- API Endpoints ---

// Register / Login (Check or Create Username)
app.post('/api/register', (req, res) => {
    const { username, deviceId } = req.body;
    
    if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    db.get("SELECT username, device_id FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // User exists - Check Device ID
            if (row.device_id === deviceId) {
                // Same device -> Login successful
                return res.json({ success: true, message: 'Welcome back!', isNew: false });
            } else {
                // Different device -> Blocked
                return res.json({ success: false, error: 'Username is already taken by another player.' });
            }
        } else {
            // Create new user with Device ID
            db.run("INSERT INTO users (username, device_id) VALUES (?, ?)", [username, deviceId], (err) => {
                if (err) return res.status(500).json({ error: 'Username taken or invalid' });
                return res.json({ success: true, message: 'User created!', isNew: true });
            });
        }
    });
});

// Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
    db.all(`
        SELECT u.username, u.total_wins, MAX(l.score) as best_score 
        FROM users u 
        LEFT JOIN leaderboard l ON u.username = l.username 
        GROUP BY u.username 
        ORDER BY total_wins DESC, best_score DESC 
        LIMIT 10
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Submit Score (called from game end)
app.post('/api/score', (req, res) => {
    const { username, score, isWin } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    db.serialize(() => {
        if (isWin) {
            db.run("UPDATE users SET total_wins = total_wins + 1, total_games = total_games + 1 WHERE username = ?", [username]);
        } else {
            db.run("UPDATE users SET total_games = total_games + 1 WHERE username = ?", [username]);
        }
        
        if (score > 0) {
            db.run("INSERT INTO leaderboard (username, score) VALUES (?, ?)", [username, score]);
        }
    });

    res.json({ success: true });
});


const connectedPlayers = [];
const rooms = {}; // Oyun odalarını tutacak obje

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  connectedPlayers.push(socket.id);
  console.log('Connected players:', connectedPlayers.length);

  // Mevcut oda listesini yeni bağlanan oyuncuya gönder
  socket.emit('roomList', Object.keys(rooms).map(roomId => ({
    id: roomId,
    players: rooms[roomId].players.length,
    maxPlayers: 2
  })));

  socket.on('createRoom', (callback) => {
    const roomId = `room-${Math.random().toString(36).substring(7)}`;
    rooms[roomId] = {
      id: roomId,
      players: [socket.id],
      gameState: null,
    };
    socket.join(roomId);
    socket.roomId = roomId; // Sokete oda bilgisini ekle
    console.log(`Player ${socket.id} created and joined room ${roomId}`);
    io.emit('roomList', Object.keys(rooms).map(roomId => ({
      id: roomId,
      players: rooms[roomId].players.length,
      maxPlayers: 2
    })));
    callback({ success: true, roomId });
  });

  socket.on('joinRoom', (roomId, callback) => {
    if (rooms[roomId] && rooms[roomId].players.length < 2) {
      rooms[roomId].players.push(socket.id);
      socket.join(roomId);
      socket.roomId = roomId; // Sokete oda bilgisini ekle
      console.log(`Player ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit('playerJoined', socket.id); // Odaya katılan oyuncuyu diğerlerine bildir
      io.emit('roomList', Object.keys(rooms).map(roomId => ({
        id: roomId,
        players: rooms[roomId].players.length,
        maxPlayers: 2
      })));
      callback({ success: true, roomId });

      // Eğer oda dolduysa, oyunu başlat ve başlangıç durumunu gönder
      if (rooms[roomId].players.length === 2) {
        // Başlangıç oyun durumunu oluştur
        const initialGameState = {
          p1Pos: { x: 0, y: 0 },
          p2Pos: { x: 7, y: 7 },
          blocked: [],
          turn: 'p1',
          turnCount: 0,
          winner: null,
          winReason: '',
          mysteryPos: null,
          activePowerUp: null,
          powerUpMessage: null,
          p1Sabotage: 0,
        };
        rooms[roomId].gameState = initialGameState;
        io.to(roomId).emit('gameStateUpdate', initialGameState);
        console.log(`Room ${roomId} is full. Game started. Emitting gameStateUpdate.`);
      }
    } else {
      callback({ success: false, message: 'Room not found or full' });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    const index = connectedPlayers.indexOf(socket.id);
    if (index !== -1) {
      connectedPlayers.splice(index, 1);
    }
    console.log('Connected players:', connectedPlayers.length);

    // Oyuncu bir odadan ayrıldıysa
    if (socket.roomId && rooms[socket.roomId]) {
      rooms[socket.roomId].players = rooms[socket.roomId].players.filter(id => id !== socket.id);
      if (rooms[socket.roomId].players.length === 0) {
        delete rooms[socket.roomId]; // Oda boşalırsa sil
        console.log(`Room ${socket.roomId} deleted.`);
      } else {
        io.to(socket.roomId).emit('playerLeft', socket.id); // Odadan ayrılan oyuncuyu diğerlerine bildir
      }
      io.emit('roomList', Object.keys(rooms).map(roomId => ({
        id: roomId,
        players: rooms[roomId].players.length,
        maxPlayers: 2
      })));
    }
  });

  // Leave Room
  socket.on('leaveRoom', (roomId, callback) => {
    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
      socket.leave(roomId);
      delete socket.roomId;
      
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('playerLeft', socket.id);
      }
      
      io.emit('roomList', Object.keys(rooms).map(roomId => ({
        id: roomId,
        players: rooms[roomId].players.length,
        maxPlayers: 2
      })));
      
      if (callback) callback({ success: true });
    } else {
        if (callback) callback({ success: false });
    }
  });

  // Generic Game State Update (for non-move updates like spawning items)
  socket.on('updateGameState', ({ roomId, gameState }) => {
      if (rooms[roomId]) {
          rooms[roomId].gameState = gameState;
          io.to(roomId).emit('gameStateUpdate', gameState);
      }
  });

  // Game Move
  socket.on('gameMove', ({ roomId, fromPosition, toPosition, playerTurn, newGameState }) => {
    if (rooms[roomId]) {
      rooms[roomId].gameState = newGameState;
      io.to(roomId).emit('gameStateUpdate', rooms[roomId].gameState);
    }
  });

  // Sohbet mesajı
  socket.on('chatMessage', ({ roomId, message }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit('chatMessage', { senderId: socket.id, message });
    }
  });

  // Oyuncu hazır
  socket.on('playerReady', ({ roomId }) => {
    if (rooms[roomId]) {
      // Oyuncunun hazır olduğunu işaretle
      // rooms[roomId].playersReady[socket.id] = true;
      // Eğer tüm oyuncular hazırsa oyunu başlat
      // if (Object.keys(rooms[roomId].playersReady).length === rooms[roomId].players.length) {
      //   io.to(roomId).emit('startGame', rooms[roomId].gameState);
      // }
    }
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
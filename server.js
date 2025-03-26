const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');

const app = require('./app.js');

// nguyên khúc dưới này để làm socket.id + kiểm tra online offline
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const User = require('./backend/models/users_schema.js');

const { Server } = require('socket.io');

const http = require('http');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:3000',
    methods: ['GET', 'POST'],
  },
});
let onlineUsers = [];
io.on('connection', async (socket) => {
  try {
    console.log(socket.id);
    // lấy user từ token để chuyển về trạng thái online
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.jwt;
    if (!token) {
      console.log('Không có JWT, từ chối kết nối.');
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return;
    } else {
      await User.findOneAndUpdate(
        { _id: currentUser._id },
        { status: 'online' },
        { new: true }
      );
    }
    console.log(`User ${currentUser.fullname} is now online`);
    if (!onlineUsers.includes(currentUser._id)) {
      onlineUsers.push({
        slug: currentUser.slug,
        status: 'online',
        lastSeen: currentUser.lastSeen,
      });
    }
    socket.on('sendMessage', (message, room) => {
      if (room === '') {
        alert('Please enter a rooom');
      }
      // io.emit là gửi full cho cả người gửi và tất cả người đang connect
      // socket.broadcast gửi cho tất cả người connect mà 0 gửi cho người gửi
      else {
        // nhận tin nhắn từ room đã chọn
        socket.to(room).emit('receiveMessage', message);
      }
      console.log(message);
    });
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`${socket.id} joined room ${room}`);
    });
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      console.log(`${socket.id} left room ${room}`);
    });
    socket.on('disconnect', async () => {
      console.log(`User ${currentUser.fullname} is now offline`);
      await User.findOneAndUpdate(
        { _id: currentUser._id },
        { status: 'offline', lastSeen: new Date() },
        { new: true }
      );
      // socket.on("update");
      // dùng để cập nhật mỗi 30s xem có online hay offline hay không
      // socket.on('ping',()=> {

      // })
      onlineUsers.forEach((user) => {
        if (user.slug === currentUser.slug) {
          user.status = 'offline';
        }
      });
    });
    socket.on('requestUsers', () => {
      io.emit('getUsers', onlineUsers);
    });
  } catch (error) {
    console.error('Error on socket.io connection:', error);
  }
});

// ------------- tới hết hàng này

const port = process.env.PORT || 8000;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// console.log(DB); //MUST CHANGE THE CONFIG, ADD cohealth before ?
mongoose.connect(DB).then(() => console.log('Connect to database successful'));

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

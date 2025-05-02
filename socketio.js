const app = require('./app.js');
const socketServerController = require('./backend/controllers/socketController.js');

const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const User = require('./backend/models/users_schema.js');
const ChatRoom = require('./backend/models/chatRoom_schema.js');

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
let lastSlugNameSignOut = '';
// let currentRoom = []
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
    if (!currentUser) return;

    await User.findOneAndUpdate(
      { _id: currentUser._id },
      { status: 'online' },
      { new: true }
    );

    // User join room
    const listRoom = await ChatRoom.find({
      memberID: { $in: [currentUser._id] },
    });
    console.log(listRoom);
    listRoom.forEach((room) => {
      // currentRoom.push({user: currentUser._id, room: room._id});
      socket.join(room.roomCode);
      console.log(`User ${currentUser.fullname} joined room ${room.roomCode}`);
    });

    console.log(`User ${currentUser.fullname} is now online`);
    // nó sẽ chạy offline trước rồi online
    // cập nhật nếu như có slugname trong cái mảng này rồi thì cho nó cập nhật thành on
    // tìm vị trí của phần tử có slug giống nhau, nếu có tức đã có trong danh sách
    if (
      !onlineUsers[
        onlineUsers.findIndex((user) => user.slug === currentUser.slug)
      ]
    ) {
      onlineUsers.push({
        slug: currentUser.slug,
        status: 'online',
        lastSeen: currentUser.lastSeen,
      });
    } else {
      onlineUsers[
        onlineUsers.findIndex((user) => user.slug === currentUser.slug)
      ].status = 'online';
      onlineUsers[
        onlineUsers.findIndex((user) => user.slug === currentUser.slug)
      ].lastSeen = currentUser.lastSeen;
    }
    socket.on('sendMessage', (message, roomCode) => {
      if (roomCode === '') {
        alert('Please enter a rooom');
        console.log('Roomcode nhập ở bên kia: ', roomCode);
      }
      // io.emit là gửi full cho cả người gửi và tất cả người đang connect
      // socket.broadcast gửi cho tất cả người connect mà 0 gửi cho người gửi
      else {
        console.log('Nó vô đây 2 lần là được');
        // nhận tin nhắn từ room đã chọn
        socket.to(roomCode).emit('receiveMessage', message, roomCode);
      }
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
      onlineUsers[
        onlineUsers.findIndex((user) => user.slug === currentUser.slug)
      ].status = 'offline';
      onlineUsers[
        onlineUsers.findIndex((user) => user.slug === currentUser.slug)
      ].lastSeen = new Date();
      lastSlugNameSignOut =
        onlineUsers[
          onlineUsers.findIndex((user) => user.slug === currentUser.slug)
        ].slug;
    });
    socket.on('requestUsers', () => {
      io.emit('getUsers', onlineUsers);
    });

    // Comment Notification
    socket.on('newComment', async (userID, newsID, content) => {
      await socketServerController.notificationOnNewComment(
        userID,
        newsID,
        content
      );
      await fetchNotification(socket.broadcast);
    });
    socket.on('renderNotification', async (userID, cb) => {
      if (userID) {
        const data = await socketServerController.getNotification(userID);
        cb(data);
      }
    });
    await fetchNotification(socket);
  } catch (error) {
    console.error('Error on socket.io connection:', error);
  }
});

//HELPER FUNCTION
const fetchNotification = async function (target) {
  target.emit('returnNotification');
};

module.exports = server;

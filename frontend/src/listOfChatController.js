import { renderPopup } from './utils/popup.js';
import Loader from './utils/loader.js';
import Socket from './socketController.js';

socket.on('receiveMessage', (message, roomCode) => {
  // trên đây để hiện chat cho đối phương
  const chatBoxId = document
    .querySelector('.chatBoxInfo')
    .firstElementChild?.getAttribute('data-room');
  // kiểm tra firstChild của chatBox này phải
  if (chatBoxId === roomCode) {
    let html = `<div class= "sender"> ${message}</div>`;
    document.querySelector('.listOfChat').insertAdjacentHTML('beforeend', html);
    document.querySelector('.listOfChat').scrollTop =
      document.querySelector('.listOfChat').scrollHeight;
  }

  // dưới đây để hiện nội dung chat ở trong cái button từng người
  let lastMessageElem = document.getElementById(`${roomCode}`);
  console.log(lastMessageElem);
  lastMessageElem.querySelector(`.lastMessage`).textContent = message;
  // update chữ vừa mới nhắn tin xong lên
  lastMessageElem.querySelector('.lastMessageTime').textContent =
    '1 minute ago';
  // nhắn tin xong đẩy lên cái đầu tiên trong chat
  let listUser = document.querySelector('.listUser');
  listUser.prepend(lastMessageElem);
  // nếu status của nó vẫn đang off thì cho nó on ngay lun
  let senderDiv = document.querySelector(`#${roomCode} .status`);
  senderDiv.classList.remove('offline');
  senderDiv.classList.add('online');
});

const timeAgo = (timestamp) => {
  console.log(timestamp);
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diff < 60) return `1 minute ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  else if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  else if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  else return `over 30 days ago`;
};

const sendMessage = async function (message, roomCode) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/room/message/create',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        roomCode: roomCode,
        message: message,
      },
    });
  } catch (err) {
    renderPopup(err.response.status, 'Send message', err.response.data.message);
  }
};

class ListOfChat {
  #roomCode;
  constructor() {
    this.#init();
    this.#roomCode = '';
  }
  #init() {
    this.#getMessageEachRoom();
    this.#createMessage();
    this.#getUserStatus();
  }
  #getMessageEachRoom() {
    const buttons = document.querySelectorAll('.listChat');
    buttons.forEach((button) => {
      const handleClick = async () => {
        // toggle lại hidden của class text
        document.querySelector('.text').classList.remove('hidden');
        document.querySelector('.chatBoxInfo').classList.add('border-b-2');
        // kết nối vào room
        const currentRoomCode = this.#roomCode;
        // if (currentRoomCode !== '') {
        //   socket.emit('leaveRoom', currentRoomCode);
        // }
        socket.emit('joinRoom', button.id);
        this.#roomCode = button.id;

        // xóa hết toán bộ đoạn chat khi chuyển người
        const parentElement = document.querySelector('.listOfChat');
        while (parentElement.firstChild) {
          parentElement.removeChild(parentElement.firstChild);
        }
        const parentElementChatBoxInfo = document.querySelector('.chatBoxInfo');
        while (parentElementChatBoxInfo.firstChild) {
          parentElementChatBoxInfo.removeChild(
            parentElementChatBoxInfo.firstChild
          );
        }
        buttons.forEach((insideButton) => {
          insideButton.classList.remove('chatItemActive');
        });
        button.classList.add('chatItemActive');
        // lấy dữ liệu người dùng đang muốn chat đến
        Loader.create();
        const data = await axios({
          method: 'GET', // Phải viết hoa 'GET'
          url: `/api/room/${button.id}/message`,
        });
        Socket.getAndRenderNotification();
        Loader.destroy();
        // lấy userData trong memberID của từng room
        const userData = data.data.data.memberID;
        // lấy slug name toàn bộ người trong room ra
        const roomSlugName = [userData[0].slug, userData[1].slug];
        // chỉnh cái online offline và đăng nhập lần cuối là bao lâu
        const status = [userData[0].status, userData[1].status];
        const lastSeen = [
          new Date(userData[0].lastSeen),
          new Date(userData[1].lastSeen),
        ];
        // chỗ này cho 2 người là người đang đăng nhập và người nhận được tin nhắn
        let lastSeenUser = [];
        let i = 0;
        for (i; i <= 1; i++) {
          lastSeenUser.push(timeAgo(lastSeen[i]));
        }
        // lấy cái slug name của bác sĩ trong data-slug
        const slug = button.getAttribute('data-slug');
        // console.log(userData[0].image)
        let userDataImage = '';
        let userDataName = '';
        let userDataStatus = '';
        let userDataStatusCircle = '';
        if (roomSlugName[0] === slug) {
          userDataImage = userData[0].image;
          userDataName = userData[0].fullname;
          userDataStatus =
            status[0] == 'online'
              ? `<p>Online</p>`
              : `<p>Offline ${lastSeenUser[0]}</p>`;
          userDataStatusCircle = status[0] == 'online' ? 'online' : 'offline';
        } else {
          userDataImage = userData[1].image;
          userDataName = userData[1].fullname;
          userDataStatus =
            status[1] == 'online'
              ? `<p>Online</p>`
              : `<p>Offline ${lastSeenUser[1]}</p>`;
          userDataStatusCircle = status[1] == 'online' ? 'online' : 'offline';
        }
        let chatBoxInfoHTML =
          `
                    <div class='relative' data-room = '${button.id}'>
                        <img src='./../images/users/profile/${userDataImage}'  class='h-16 rounded-full' alt='${userDataImage}-profile'>
                        <div class='${userDataStatusCircle} absolute right-0 bottom-0'></div>
                    </div>
                    
                    <div class='font-ABeeZee content-center space-x-4 px-4'>
                        <p>${userDataName}</p>                        
                ` +
          userDataStatus +
          `</div>`;

        document
          .querySelector('.chatBoxInfo')
          .insertAdjacentHTML('beforeend', chatBoxInfoHTML);

        // lấy danh sách toàn bộ message
        const listOfMessage = data.data.data.message;
        // console.log(listOfMessage)
        let html = '';
        listOfMessage.forEach((message) => {
          html +=
            message.senderID.slug === slug
              ? `<div class = "sender"> ${message.message} </div>`
              : `<div class= "user"> ${message.message}</div>`;
        });
        document
          .querySelector('.listOfChat')
          .insertAdjacentHTML('beforeend', html);

        document.querySelector('.listOfChat').scrollTop =
          document.querySelector('.listOfChat').scrollHeight;
      };
      const debounceHandleClick = _.debounce(handleClick, 300).bind(this);
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        debounceHandleClick();
      });
    });
  }
  #createMessage() {
    const formMessage = document.querySelector('form');
    if (formMessage) {
      formMessage.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomCode = this.#roomCode;
        const message = document.querySelector('.text input').value;
        sendMessage(message, roomCode);
        // console.log(roomCode);
        document.querySelector('.text input').value = '';
        let html = `<div class= "user"> ${message}</div>`;
        document
          .querySelector('.listOfChat')
          .insertAdjacentHTML('beforeend', html);
        document.querySelector('.listOfChat').scrollTop =
          document.querySelector('.listOfChat').scrollHeight;
        socket.emit('sendMessage', message, roomCode);
        Socket.newMessage(roomCode);
        // sau khi gửi xong thì hiện lên cái khung chat
        let lastMessageElem = document.getElementById(`${roomCode}`);
        lastMessageElem.querySelector(`.lastMessage`).textContent = message;
        // update chữ vừa mới nhắn tin xong lên
        lastMessageElem.querySelector('.lastMessageTime').textContent =
          '1 minute ago';
        // nhắn tin xong đẩy lên cái đầu tiên trong chat
        let listUser = document.querySelector('.listUser');
        // console.log(listUser);
        listUser.prepend(lastMessageElem);
      });
    }
  }

  #getUserStatus() {
    // hàm cập nhật trạng thái online offline
    socket.on('getUsers', (activeUsers) => {
      // console.log(activeUsers);
      activeUsers.forEach((activeUser) => {
        let userDiv = document.querySelector(
          `button[data-slug="${activeUser.slug}"]`
        );
        // console.log(userDiv);
        if (userDiv !== null) {
          let userStatus = userDiv.querySelector('.status');
          let lastClassOfUserDiv =
            userStatus.classList[userStatus.classList.length - 1];
          userStatus.classList.remove(`${lastClassOfUserDiv}`);
          userStatus.classList.add(`${activeUser.status}`);
          // console.log(activeUser.status);
        }
        // update thời gian tin nhắn cuối cùng
        // if(document.querySelector(".listChat .lastMessageTime")){
        //     messTime = document.querySelector(".listChat .lastMessageTime")?.textContent || ""
        //     if(messTime){
        //         document.querySelector(".listChat .lastMessageTime").textContent = timeAgo(messTime)
        //     }
        // }
      });
    });
    // cập nhật trạng thái on off sau mỗi 30s tránh quá tải
    setInterval(() => {
      socket.emit('requestUsers');
    }, 120000);
  }
}

new ListOfChat();

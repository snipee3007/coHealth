const socket = io("http://127.0.0.1:3000");

socket.on('receiveMessage', message => {
    // trên đây để hiện chat cho đối phương
    let html = `<div class= "sender"> ${message}</div>`
    document.querySelector('.listOfChat').insertAdjacentHTML("beforeend", html);
    document.querySelector('.listOfChat').scrollTop = document.querySelector('.listOfChat').scrollHeight;

    // dưới đây để hiện nội dung chat ở trong cái button từng người
    document.querySelector('.lastMessage').textContent = message;
})

const sendMessage = async function(message, roomCode){
    console.log(message)
    console.log(roomCode)
    try {
        const res = await fetch( "/chat",{ 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },   
          body: JSON.stringify({
            roomCode: roomCode,
            message: message
        }),
        });
        if (res.data.status == 'success') {
          location.reload();
        }
      } catch (err) {
        alert(err.message);
      }
}

class ListOfChat{
    #roomCode;
    constructor() {
        this.#init();
        this.#roomCode = document.querySelector('.chatItemActive')? document.querySelector('.chatItemActive').id: "";
    }
    #init(){
        this.#getMessageEachRoom();
        this.#createMessage();
        this.#getRoomCode();
    }
    #getMessageEachRoom(){
        const buttons = document.querySelectorAll(".listChat")
        const self = this
        buttons.forEach(function(button) {
            button.addEventListener("click", async function (e) {
                // kết nối vào room
                const currentRoomCode = self.#getRoomCode();
                if(currentRoomCode !== ''){
                    socket.emit('leaveRoom', currentRoomCode);
                }
                socket.emit('joinRoom', button.id)

                // xóa hết toán bộ đoạn chat khi chuyển người
                const parentElement = document.querySelector('.listOfChat');
                while (parentElement.firstChild) {
                    parentElement.removeChild(parentElement.firstChild);
                }
                const parentElementChatBoxInfo = document.querySelector('.chatBoxInfo');
                while (parentElementChatBoxInfo.firstChild) {
                    parentElementChatBoxInfo.removeChild(parentElementChatBoxInfo.firstChild);
                }
                e.preventDefault();
                buttons.forEach((insideButton)=> {insideButton.classList.remove("chatItemActive")})
                button.classList.add('chatItemActive')
                const isChatRoom = await fetch(`/chat/room/${button.id}`,{
                    method: 'GET', // Phải viết hoa 'GET'
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                self.#roomCode = button.id
                const data = await isChatRoom.json()
                // tí làm tiếp
                console.log(data.data.room)
                // lấy userData trong memberID của từng room
                const userData = data.data.room.memberID
                // lấy slug name toàn bộ người trong room ra 
                const roomSlugName = [userData[0].slug, userData[1].slug]
                
                // lấy cái slug name trong button
                console.log(button.classList)
                const slug = button.classList[7]
                // console.log(userData[0].image)
                // check coi tên trong mảng có là cái slug của bác sĩ hay 0 (người trò chuyện)
                let chatBoxInfoHTML = roomSlugName[0] === slug? 
                
                ` <img src='./../images/users/profile/${userData[0].image}' class='h-16 rounded-full' alt='${roomSlugName[0]}-profile'>
                    <p class='font-ABeeZee content-center'>${userData[0].fullname}</p>
                ` : 
                ` <img src='./../images/users/profile/${userData[1].image}' class='h-16 rounded-full' alt='${roomSlugName[1]}-profile'>
                    <p class='font-ABeeZee content-center'>${userData[1].fullname}</p>
                `
                document.querySelector('.chatBoxInfo').insertAdjacentHTML("beforeend", chatBoxInfoHTML);

                // lấy danh sách toàn bộ message
                const listOfMessage = data.data.room.message
                // console.log(listOfMessage)
                console.log(slug)
                let html = ""
                listOfMessage.forEach((message) => {
                    html += message.senderID.slug === slug? `<div class = "sender"> ${message.message} </div>` : `<div class= "user"> ${message.message}</div>`
                })
                document.querySelector('.listOfChat').insertAdjacentHTML("beforeend", html);
                
                document.querySelector('.listOfChat').scrollTop = document.querySelector('.listOfChat').scrollHeight;
                // báo cho server là vào room chat của bác sĩ - button.id là mã room của bác sĩ
            })
            }
        )
    }
    #createMessage(){
        const formMessage = document.querySelector('form')
        if(formMessage){
            formMessage.addEventListener('submit', (e) => {
                e.preventDefault();
                const roomCode = this.#getRoomCode();
                const message = document.querySelector('.text input').value;
                sendMessage(message, roomCode);
                document.querySelector('.text input').value = '';
                let html = `<div class= "user"> ${message}</div>`
                document.querySelector('.listOfChat').insertAdjacentHTML("beforeend", html);
                document.querySelector('.listOfChat').scrollTop = document.querySelector('.listOfChat').scrollHeight;
                socket.emit('sendMessage', message, roomCode)
                document.querySelector('.lastMessage').textContent = message;
                // sau khi gửi xong thì hiện lên cái khung chat
                
            })
        }
    }
    #getRoomCode(){
        return this.#roomCode;
    }
}

export default new ListOfChat();





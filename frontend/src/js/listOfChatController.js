const socket = io("http://127.0.0.1:3000");

setInterval(() => {

}, 30000)

const timeAgo = (timestamp) => {
    console.log(timestamp)
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (diff < 60) return `1 minute ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    else if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    else if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    else return `over 30 days ago`;
}

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
        this.#getUserStatus();
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
                console.log(data.data.room)
                // lấy userData trong memberID của từng room
                const userData = data.data.room.memberID
                // lấy slug name toàn bộ người trong room ra 
                const roomSlugName = [userData[0].slug, userData[1].slug]
                // chỉnh cái online offline và đăng nhập lần cuối là bao lâu
                const status = [userData[0].status, userData[1].status]
                const lastSeen = [new Date(userData[0].lastSeen), new Date(userData[1].lastSeen)]
                // chỗ này cho 2 người là người đang đăng nhập và người nhận được tin nhắn
                let lastSeenUser = []
                let i = 0
                for(i; i<=1; i++){
                    lastSeenUser.push(
                        timeAgo(lastSeen[i])
                    )
                }
                console.log(lastSeenUser[1])
                // lấy cái slug name của bác sĩ trong button ở vị trí số 7 -> thêm class thì sửa cái này? 
                console.log(button.classList)
                const slug = button.classList[7]
                // console.log(userData[0].image)
                let userDataImage = ''
                let userDataName = ''
                let userDataStatus = ''
                let userDataStatusCircle = ''
                if(roomSlugName[0]===slug){
                    userDataImage = userData[0].image
                    userDataName = userData[0].fullname
                    userDataStatus = status[0]=='online'? `<p>Online</p>` : `<p>Offline ${lastSeenUser[0]}</p>`
                    userDataStatusCircle = status[0]=='online'? 'online' : 'offline'

                }
                else{
                    userDataImage = userData[1].image
                    userDataName = userData[1].fullname
                    userDataStatus = status[1]=='online'? `<p>Online</p>` : `<p>Offline ${lastSeenUser[1]}</p>`
                    userDataStatusCircle = status[1]=='online'? 'online' : 'offline'

                }
                let chatBoxInfoHTML = `
                    <div class='relative'>
                        <img src='./../images/users/profile/${userDataImage}' class='h-16 rounded-full' alt='${userDataImage}-profile'>
                        <div class='${userDataStatusCircle} absolute right-0 bottom-0'></div>
                    </div>
                    
                    <div class='font-ABeeZee content-center space-x-4'>
                        <p class='ml-4'>${userDataName}</p>                        
                ` + userDataStatus + `</div>`
                
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

                // sau khi gửi xong thì hiện lên cái khung chat
                let lastMessageElem = document.getElementById(`${roomCode}`)
                lastMessageElem.querySelector(`.lastMessage`).textContent = message;
                // update chữ vừa mới nhắn tin xong lên 
                lastMessageElem.querySelector(".lastMessageTime").textContent = "1 minute ago"
                // nhắn tin xong đẩy lên cái đầu tiên trong chat
                let listUser = document.querySelector('.listUser')
                console.log(listUser)
                listUser.prepend(lastMessageElem)
            })
        }
    }
    
    #getUserStatus(){
        // hàm cập nhật trạng thái online offline
        socket.on('getUsers', (activeUsers)=>{
            activeUsers.forEach((activeUser) => {
                let userDiv = document.querySelector(`.${activeUser.slug}`)
                console.log(userDiv)
                if(userDiv != null){
                    let userStatus = userDiv.querySelector('.status')
                    let lastClassOfUserDiv = userStatus.classList[userStatus.classList.length-1]
                    userStatus.classList.remove(`${lastClassOfUserDiv}`)
                    userStatus.classList.add(`${activeUser.status}`)
                    console.log(activeUser.status)
                }
                // update thời gian tin nhắn cuối cùng
                // if(document.querySelector(".listChat .lastMessageTime")){
                //     messTime = document.querySelector(".listChat .lastMessageTime")?.textContent || ""
                //     if(messTime){
                //         document.querySelector(".listChat .lastMessageTime").textContent = timeAgo(messTime)
                //     }
                // } 
            })
            
        })
        // cập nhật trạng thái on off sau mỗi 30s tránh quá tải 
        setInterval(()=>{
            socket.emit('requestUsers')
        }, 30000)

    }

    #getRoomCode(){
        return this.#roomCode;
    }
}



export default new ListOfChat();





import NotificationConstant from '/src/utils/notificationConstant.js';

const socket = io();
class Socket {
  newComment(userID, newsID, content) {
    try {
      socket.emit('newComment', userID, newsID, content);
    } catch (err) {
      console.log('ERROR on emit new comment from server side!');
    }
  }
  newReply(userID, replyID, content) {
    try {
      socket.emit('newReply', userID, replyID, content);
    } catch (err) {
      console.log('ERROR on emit new reply from server side!');
    }
  }

  newMessage(roomCode) {
    try {
      socket.emit('newMessage', roomCode);
    } catch (err) {
      console.log('ERROR on emit new message from server side!');
    }
  }

  newAppointment(doctorID, appointmentID) {
    try {
      socket.emit('newAppointment', doctorID, appointmentID);
    } catch (err) {
      console.log('ERROR on emit new message from server side!');
    }
  }

  getAndRenderNotification() {
    try {
      socket.on('returnNotification', async function () {
        const userID = document.querySelector('.userButton')?.dataset['id'];
        socket.emit('renderNotification', userID, renderNotification);
      });
      const userID = document.querySelector('.userButton')?.dataset['id'];
      socket.emit('renderNotification', userID, renderNotification);
    } catch (err) {}
  }
}

// HELPER FUNCTION

const renderNotification = function (data) {
  let notReadNoti = 0;
  let notificationStr = '';
  const notificationsBox = document.querySelector('.notificationsBox');
  notificationsBox.innerHTML = '';
  if (data && data.length > 0) {
    if (data.length > 0) {
      data.forEach((noti) => {
        if (noti.to[0].haveRead == false) ++notReadNoti;
        let message;
        if (noti.type == 'news-comment' || noti.type == 'reply-comment') {
          const nameList = noti.from.map((from) => from.fullname);
          if (noti.type == 'news-comment') {
            noti.title = 'Comment';
            message = NotificationConstant.newNewsComment(nameList).message;
          } else if (noti.type == 'reply-comment') {
            noti.title = 'Reply';
            message = NotificationConstant.newReplyComment(nameList).message;
          }
          notificationStr += `
          <div class="notificationItem text-left font-normal flex flex-1 gap-3 x-4 py-2 rounded-xl hover:bg-[#D9D9D9] cursor-pointer" data-id="${
            noti.id
          }" data-news="${noti.newsID.slug}" data-type="${noti.type}">
            <svg class="w-6 h-6 shrink-0">
              <use href='/images/png/icons.svg#news'></use>
            </svg>
            <div class="${noti.to[0].haveRead ? 'haveRead' : ''}"> 
              <div class="notificationTitle font-bold flex flex-1 items-center gap-4">
                <p>${noti.title}</p>
                <div class="w-2 h-2 rounded-full bg-blue-400  ${
                  noti.to[0].haveRead ? 'hidden' : ''
                }"></div>
              </div>
              <div class="notification line-clamp-3">
                ${message}
              </div>
            </div>
          </div>  
          `;
        } else if (noti.type == 'message') {
          const nameList = noti.from.map((from) => from.fullname);
          message = NotificationConstant.newMessage(nameList).message;
          noti.title = 'Message';
          notificationStr += `
          <div class="notificationItem text-left font-normal flex flex-1 gap-3 x-4 py-2 rounded-xl hover:bg-[#D9D9D9] cursor-pointer" data-id="${
            noti.id
          }" data-type="${noti.type}">
            <svg class="w-6 h-6 shrink-0">
              <use href='/images/png/icons.svg#sms'></use>
            </svg>
            <div class="${noti.to[0].haveRead ? 'haveRead' : ''}"> 
              <div class="notificationTitle font-bold flex flex-1 items-center gap-4">
                <p>${noti.title}</p>
                <div class="w-2 h-2 rounded-full bg-blue-400  ${
                  noti.to[0].haveRead ? 'hidden' : ''
                }"></div>
              </div>
              <div class="notification line-clamp-3">
                ${message}
              </div>
            </div>
          </div>  
          `;
        } else if (noti.type == 'appointment') {
          message = NotificationConstant.newAppointment().message;
          noti.title = 'Appointment';
          notificationStr += `
          <div class="notificationItem text-left font-normal flex flex-1 gap-3 x-4 py-2 rounded-xl hover:bg-[#D9D9D9] cursor-pointer" data-id="${
            noti.id
          }" data-type="${noti.type}">
            <svg class="w-6 h-6 shrink-0">
              <use href='/images/png/icons.svg#appointment'></use>
            </svg>
            <div class="${noti.to[0].haveRead ? 'haveRead' : ''}"> 
              <div class="notificationTitle font-bold flex flex-1 items-center gap-4">
                <p>${noti.title}</p>
                <div class="w-2 h-2 rounded-full bg-blue-400  ${
                  noti.to[0].haveRead ? 'hidden' : ''
                }"></div>
              </div>
              <div class="notification line-clamp-3">
                ${message}
              </div>
            </div>
          </div>  
          `;
        }
      });
    }
  } else {
    notificationStr = `
          <p class="font-normal text-center">No notification yet!!</p>
        `;
  }
  notificationsBox.insertAdjacentHTML('afterbegin', notificationStr);
  if (notReadNoti > 0)
    document.querySelector('.hasNoti').classList.remove('hidden');
  else document.querySelector('.hasNoti').classList.add('hidden');
};

export default new Socket();

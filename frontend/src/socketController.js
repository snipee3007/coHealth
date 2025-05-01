import NotificationConstant from './../utils/notificationConstant.js';

const socket = io();
class Socket {
  newComment(userID, postID, content) {
    try {
      socket.emit('newComment', userID, postID, content);
    } catch (err) {
      console.log('ERROR');
    }
  }
  newReply(userID, replyID, content) {
    try {
      socket.emit('newReply', userID, replyID, content);
    } catch (err) {
      console.log('ERROR');
    }
  }
  getAndRenderNotification() {
    try {
      socket.on('returnNotification', async function () {
        const userID = document.querySelector('.userButton')?.dataset['id'];
        socket.emit('renderNotification', userID, renderNotification);
      });
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
      data.forEach(noti => {
        if (noti.to[0].haveRead == false) ++notReadNoti;
        let message;
        const nameList = noti.from.map(from => from.fullname);
        if (noti.type == 'post-comment') {
          noti.title = 'Bình luận';
          message = NotificationConstant.newPostComment(nameList).message;
        } else if (noti.type == 'reply-comment') {
          noti.title = 'Phản hồi';
          message = NotificationConstant.newReplyComment(nameList).message;
        }
        notificationStr += `
            <div class="notificationItem text-left font-normal flex flex-1 gap-3 x-4 py-2 rounded-xl hover:bg-[#D9D9D9] cursor-pointer" data-id="${
              noti.id
            }" data-post="${noti.postID.slug}" data-type="${noti.type}">
              <svg class="w-6 h-6 shrink-0">
                <use href='/images/icon.svg#sms'></use>
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
      });
    }
  } else {
    notificationStr = `
          <p class="font-normal">Hiện không có thông báo nào!</p>
        `;
  }
  notificationsBox.insertAdjacentHTML('afterbegin', notificationStr);
  if (notReadNoti > 0)
    document.querySelector('.hasNoti').classList.remove('hidden');
  else document.querySelector('.hasNoti').classList.add('hidden');
};

export default new Socket();

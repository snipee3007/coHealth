import Socket from './socketController.js';
import Loader from './utils/loader.js';
import { renderPopup } from './utils/popup.js';

class Notification {
  constructor() {
    this.#renderNotification();
    this.#readNotification();
  }

  #renderNotification() {
    Socket.getAndRenderNotification();
  }

  #readNotification() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('.notificationItem')) {
        const notification = e.target.closest('.notificationItem');
        if (
          notification.dataset['type'] == 'reply-comment' ||
          notification.dataset['type'] == 'news-comment'
        ) {
          readNotification(
            notification.dataset['id'],
            `/news/${notification.dataset['news']}#comment`
          );
        } else if (notification.dataset['type'] == 'message') {
          readNotification(notification.dataset['id'], `/chat`);
        } else if (notification.dataset['type'] == 'appointment') {
          readNotification(notification.dataset['id'], `/appointment/list`);
        }
      }
    });
  }
}

// HELPER FUNCTION
const readNotification = async function (notificationID, redirectPath) {
  try {
    Loader.create();
    const res = await axios({
      method: 'post',
      url: `/api/notification/${notificationID}`,
    });
    if (res.data.status == 'success') {
      Loader.destroy();
      window.location = redirectPath;
    }
  } catch (err) {
    Loader.destroy();
    renderPopup(400, 'Update Notification', err.response.data.message);
  }
};

new Notification();

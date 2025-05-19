import Loader from './utils/loader.js';
import { renderPopup } from './utils/popup.js';

class DoctorItem {
  constructor() {
    this.#createChat();
  }
  #createChat() {
    const button = document.querySelector('.chat');
    // console.log(button);
    if (button) {
      // console.log(button.id);
      button.addEventListener('click', async function () {
        try {
          Loader.create();
          const res = await axios({
            method: 'post', // Phải viết hoa 'POST'
            url: '/api/room/create',
            data: { slug: button.id },
          });
          if (res.status.toString().startsWith('2')) {
            Loader.destroy();
            location.assign('/chat');
          }
        } catch (err) {
          Loader.destroy();
          console.log(err);
          renderPopup(
            err.response.status,
            'Create chat room',
            err.response.data.message
          );
        }
      });
    }
  }
}

new DoctorItem();

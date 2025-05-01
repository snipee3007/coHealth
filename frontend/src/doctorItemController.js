const socket = io('http://127.0.0.1:3000');

import { renderPopup } from './utils/popup.js';

class DoctorItem {
  constructor() {
    this.#createChat();
  }
  #createChat() {
    const button = document.querySelector('.chat');
    console.log(button);
    if (button) {
      console.log(button.id);
      button.addEventListener('click', async function () {
        try {
          const res = await axios({
            method: 'post', // Phải viết hoa 'POST'
            url: '/api/room/create',
            data: { slug: button.id },
          });
          if (res.status.toString().startsWith('2')) {
            location.assign('/chat');
          }
        } catch (err) {
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

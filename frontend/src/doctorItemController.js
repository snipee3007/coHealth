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
        const isChatRoom = await fetch(`/chat/room/g/${button.id}`, {
          method: 'GET', // Phải viết hoa 'GET'
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(isChatRoom.status);
        if (isChatRoom.status == '200') {
          window.setTimeout(() => {
            location.assign('/chat');
          }, 200);
        } else {
          const res = await fetch('/chat/room/c', {
            // Sửa lỗi truyền sai đối số
            method: 'POST', // Phải viết hoa 'POST'
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slug: button.id }),
          });
          if (res.status == '200') {
            window.setTimeout(() => {
              location.assign('/chat');
            }, 200);
          } else {
            alert('Can not create chat room');
          }
        }
      });
    }
  }
}

new DoctorItem();

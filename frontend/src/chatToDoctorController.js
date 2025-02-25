class ChatToDoctor {
  constructor() {
    this.#createChat();
    this.#swiper();
  }
  #swiper() {
    new Swiper('.swiper', {
      pagination: {
        el: '.swiper-pagination-1',
        clickable: true,
        bulletClass: 'swiper-pagination-bullet swiper-pagination-bullet-doctor',
        dynamicBullets: true,
        dynamicMainBullets: 6,
        bulletActiveClass: 'swiper-pagination-bullet-active-doctor',
        renderBullet: function (index, className) {
          return (
            '<span class="' +
            className +
            ' cursor-pointer font-Inter">' +
            (index + 1) +
            '</span>'
          );
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      slidesPerView: 3,
      spaceBetween: 80,
      grid: {
        fill: 'row',
        rows: 2,
      },
    });
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

new ChatToDoctor();

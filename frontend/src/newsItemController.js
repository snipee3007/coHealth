import { timeConvertShort } from './utils/timeConvert.js';

class NewsItem {
  constructor() {
    this.#createComment();
    this.#commentTimeRender();
  }
  #createComment() {
    const commentForm = document.querySelector('.commentForm');
    commentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const comment = document.querySelector('input[name="comment"]');
      if (comment.value) {
        const newsID = document.querySelector('.newsContainer');
        console.log('Hello');
        createComment({
          newsID: newsID.dataset['id'],
          message: comment.value,
        });
      }
    });
  }
  #commentTimeRender() {
    document.querySelectorAll('.commentTime').forEach((comment) => {
      comment.textContent = timeConvertShort(new Date(comment.textContent));
    });
  }
}

// HELPER FUNCTION
const createComment = async function (data) {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/comment',
      data,
    });
    if (res.data.status == 'success') {
      window.location.reload();
    }
  } catch (err) {}
};

new NewsItem();

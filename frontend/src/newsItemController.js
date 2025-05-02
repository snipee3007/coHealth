import { timeConvertShort } from './utils/timeConvert.js';
import Socket from './socketController.js';

class NewsItem {
  constructor() {
    this.#createComment();
    this.#commentTimeRender();
    this.#renderNews();
  }
  #renderNews() {
    let newsHTML = '';
    const dataEle = document.querySelector('.newsData');
    const news = JSON.parse(dataEle.dataset['news']);
    const slug = dataEle.dataset['slug'];
    dataEle.remove();
    newsHTML = renderNews(news, newsHTML, slug);
    document
      .querySelector('.newsBox')
      .insertAdjacentHTML('beforeend', newsHTML);
  }

  #createComment() {
    const commentForm = document.querySelector('.commentForm');
    const currentUser = document.querySelector('input[name="user"]');

    commentForm?.addEventListener('submit', function (e) {
      e.preventDefault();
      const comment = document.querySelector('input[name="comment"]');
      if (currentUser.value && comment.value !== '') {
        const newsID = document.querySelector('.newsContainer').dataset['id'];
        Socket.newComment(currentUser.value, newsID, comment.value);
        createComment({
          newsID: newsID,
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
  #updateVisitPage() {
    const slug = location.pathname.split('/')[2];
    if (sessionStorage.getItem(`${slug}-visit`) !== 'visited') {
      sessionStorage.setItem(`${slug}-visit`, 'visited');
      updateCurrentnewsVisitedCount();
    }
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
// Handle render post section
let imageCount = 1;

const renderNews = function (news, newsHTML = '', slug) {
  for (let i = 0; i < news.content.length; ++i) {
    if (news.content[i].type == 'heading') {
      for (let j = 0; j < news.content[i].attrs.length; ++j) {
        if (news.content[i].attrs[j].level) {
          if (news.content[i].attrs[j].level == 1)
            newsHTML += `<h1>${renderNews(news.content[i], '', slug)}</h1>`;
          else if (news.content[i].attrs[j].level == 2)
            newsHTML += `<h2>${renderNews(news.content[i], '', slug)}</h2>`;
          else if (news.content[i].attrs[j].level == 3)
            newsHTML += `<h3>${renderNews(news.content[i], '', slug)}</h3>`;
          break;
        }
      }
    } else if (news.content[i].type == 'bulletList') {
      newsHTML += `<ul>${renderNews(news.content[i], '', slug)}</ul>`;
    } else if (news.content[i].type == 'orderedList') {
      newsHTML += `<ol>${renderNews(news.content[i], '', slug)}</ol>`;
    } else if (news.content[i].type == 'listItem') {
      newsHTML += `<li>${renderNews(news.content[i], '', slug)}</li>`;
    } else if (news.content[i].type == 'blockquote') {
      newsHTML += `<blockquote>${renderNews(
        news.content[i],
        '',
        slug
      )}</blockquote>`;
    } else if (news.content[i].type == 'image') {
      let temp = '<img class="mx-auto w-2/3" ';
      for (let j = 0; j < news.content[i].attrs.length; ++j) {
        if (news.content[i].attrs[j].src.startsWith('https://'))
          temp += `src="${news.content[i].attrs[j].src}"`;
        else if (news.content[i].attrs[j].src)
          temp += `src="/images/news/${slug}/${slug}-${imageCount}.png" alt="${slug}-${imageCount}"`;
      }
      ++imageCount;
      newsHTML += `${temp}/>`;
    } else if (news.content[i].type == 'paragraph') {
      newsHTML += `<p class='w-1/2 mx-auto py-2'>${renderNews(
        news.content[i],
        '',
        slug
      )}</p>`;
    } else if (news.content[i].type == 'text') {
      let temp = '';
      let style = [];
      for (let j = 0; j < news.content[i].marks.length; ++j) {
        if (news.content[i].marks[j].type == 'bold') {
          temp += `<strong>`;
          style.push('strong');
        } else if (news.content[i].marks[j].type == 'italic') {
          temp += `<em>`;
          style.push('italic');
        } else if (news.content[i].marks[j].type == 'underline') {
          temp += `<u>`;
          style.push('underline');
        } else if (news.content[i].marks[j].type == 'link') {
          temp += `<a `;
          for (let k = 0; k < news.content[i].marks[j].attrs.length; ++k) {
            if (news.content[i].marks[j].attrs[k].href) {
              temp += `href="${news.content[i].marks[j].attrs[k].href}">`;
            }
          }
          style.push('link');
        }
      }
      temp += news.content[i].text;
      style.forEach((item) => {
        if (item == 'strong') temp += '</strong>';
        else if (item == 'italic') temp += '</em>';
        else if (item == 'underline') temp += '</u>';
        else if (item == 'link') temp += '</a>';
      });
      newsHTML += temp;
    }
  }
  return newsHTML;
};

// Handle update get visited count
const updateCurrentnewsVisitedCount = async function () {
  try {
    const res = await axios({
      method: 'get',
      url: `${location.pathname}?type=visit`,
    });
    if (!res.data.status == 'sucess') {
      throw new Error(
        'Đã có lỗi xảy ra trong việc cập nhật thông tin khóa học hiện tại! Vui lòng thử lại sau!'
      );
    }
  } catch (err) {
    renderPopup(400, 'Cập nhật khóa học', err.response.data.message);
  }
};

new NewsItem();

class Notification {
  newPostComment(nameList) {
    return {
      type: 'post-comment',
      message: notiTemplate(nameList, 'đã bình luận bài viết của bạn'),
    };
  }
  newReplyComment(nameList) {
    return {
      type: 'reply-comment',
      message: notiTemplate(nameList, 'đã trả lời bình luận của bạn'),
    };
  }
  newPostLike(nameList) {
    return {
      type: 'post-like',
      message: notiTemplate(nameList, 'đã thích bài viết của bạn'),
    };
  }
  newPost(postTitle) {
    return {
      type: 'post-create',
      message: `Bài "${postTitle}" đã được đăng! Hãy cùng đọc nào!`,
    };
  }
}

//HELPER FUNCTION
const addAnd = function (nameList) {
  if (Array.isArray(nameList) && nameList.length == 2)
    return `<strong>${nameList[1]}</strong> và <strong>${nameList[0]}</strong>`;
};

const notiTemplate = function (nameList, action) {
  if (Array.isArray(nameList)) {
    if (nameList.length == 0) return undefined;
    if (nameList.length == 1)
      return `<strong>${nameList[0]}</strong> ${action}`;
    else if (nameList.length == 2) return `${addAnd(nameList)} ${action}`;
    else {
      return `<strong>${nameList[nameList.length - 1]}</strong> và ${
        nameList.length - 1
      } người khác ${action}`;
    }
  }
};

export default new Notification();

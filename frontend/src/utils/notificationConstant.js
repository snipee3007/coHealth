class Notification {
  newNewsComment(nameList) {
    return {
      type: 'news-comment',
      message: notiTemplate(nameList, 'commented on your news!'),
    };
  }
  newReplyComment(nameList) {
    return {
      type: 'reply-comment',
      message: notiTemplate(nameList, 'replied your comment!'),
    };
  }
  newNewsLike(nameList) {
    return {
      type: 'news-like',
      message: notiTemplate(nameList, 'liked your news!'),
    };
  }
  newNews(newsTitle) {
    return {
      type: 'news-create',
      message: `News with title "${newsTitle}" has been published! Read it now!`,
    };
  }

  newAppointment() {
    return {
      type: 'appointment-create',
      message: `New appointment has been booked! Check it now!`,
    };
  }
  newMessage(nameList) {
    return {
      type: 'message',
      message: notiTemplate(nameList, 'just message you! Come check it out!'),
    };
  }
}

//HELPER FUNCTION
const addAnd = function (nameList) {
  if (Array.isArray(nameList) && nameList.length == 2)
    return `<strong>${nameList[1]}</strong> and <strong>${nameList[0]}</strong>`;
};

const notiTemplate = function (nameList, action) {
  if (Array.isArray(nameList)) {
    if (nameList.length == 0) return undefined;
    if (nameList.length == 1)
      return `<strong>${nameList[0]}</strong> ${action}`;
    else if (nameList.length == 2) return `${addAnd(nameList)} ${action}`;
    else {
      return `<strong>${nameList[nameList.length - 1]}</strong> and ${
        nameList.length - 1
      } other people ${action}`;
    }
  }
};

export default new Notification();

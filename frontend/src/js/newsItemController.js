class NewsItem {
  #data;
  async fetchData(name) {
    await fetch(`/api/getNews/${name}`)
      .then((res) => res.json())
      .then((res) => (this.#data = res.data.newsFound[0]))
      .catch((err) => console.error('Can not load the news that request', err));
  }
  render() {
    console.log(this.#data);
    let html = `      <div class="newsTitle">${this.#data.name}</div>
    <div class="firstViewNewsContent">
      <div class="newsImage">
        <img
          src="../${this.#data.imgSRC}"
          alt="${this.#data.imgAlt}"
        />
      </div>
      <div class="newsContent firstContent">
        ${this.#data.newsContent[0]}
      </div>
    </div>`;
    this.#data.newsContent.forEach((content, i) => {
      if (i !== 0) {
        html += `<div class="newsContent">
            ${content}
          </div>`;
      }
    });
    const newsBox = document.querySelector('.newsBox');
    newsBox.insertAdjacentHTML('afterbegin', html);
  }
  async run(name) {
    await this.fetchData(name);
    this.render();
  }
}

export default new NewsItem();

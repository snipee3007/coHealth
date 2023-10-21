const feature_items = document.querySelector('.features-items');

class Features {
  #data;
  async fetchData() {
    const data = await fetch('./../../data/features-data.json')
      .then((res) => res.json())
      .then((res) => (this.#data = res))
      .catch((err) => console.log('Could not read features data file', err));
    console.log(this.#data);
  }
  renderContent(feature) {
    return `
    <div class="features-item-content">
        <div class="features-item-title">${feature.title}</div>
        <div class="features-item-description">${feature.description}</div>
    
    </div>`;
  }
  renderIcon(feature) {
    return `
          <img
              class="features-item-icon"
              src="../${feature.iconSRC}"
              alt="${feature.iconAlt}"
              style = "float: right"
          />

          `;
  }

  async render() {
    await this.fetchData();
    const initHTML = this.#data
      .map((feature) => {
        let featureHTML;

        featureHTML =
          '' + this.renderIcon(feature) + this.renderContent(feature);

        return `<div class="features-item">${featureHTML}</div>`;
      })
      .join('');
    feature_items.insertAdjacentHTML('afterbegin', initHTML);
  }
}

export default new Features();

class HealthHistory {
  constructor() {
    this.#calculateHistoryRender();
    this.#symptomCheckHistoryRender();
  }
  #calculateHistoryRender() {
    document.querySelectorAll('select').forEach((field) => {
      field.addEventListener('change', function (e) {
        if (!e.target.value) return;
        const [start, end] = e.target.value.split(':').map((field) => {
          const [date, month, year] = field.split('-');
          return `${+year}-${+month}-${+date}`;
        });
        const startingDate = new Date(start);
        const endingDate = new Date(end);
        e.target
          .closest('.historyContainer')
          .querySelectorAll('.historyItem')
          .forEach((node) => {
            node.classList.add('hidden');
            const nodeTime = new Date(node.dataset['time']);
            console.log(nodeTime.getTime(), startingDate.getTime());
            if (
              nodeTime.getTime() >= startingDate.getTime() &&
              nodeTime.getTime() <= endingDate.getTime()
            ) {
              node.classList.remove('hidden');
            }
          });
      });
    });
  }
  #symptomCheckHistoryRender() {}
}

new HealthHistory();

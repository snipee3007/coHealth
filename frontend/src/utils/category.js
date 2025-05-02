import { charAndNumberOnly } from './inputRestrict.js';

class Category {
  constructor() {
    this.#fetchCategory();
    this.#categorySelector();
    this.pickenCategoryList = [];
    this.newCategory = [];
  }
  #fetchCategory() {
    const data = Array.from(
      document.querySelectorAll('.category_option_item')
    ).map((item) => item.textContent.trim());
    this.categoryList = data.sort();
  }

  #categorySelector() {
    const categoryInput = document.querySelector('.categoryInput');
    categoryInput.addEventListener('click', function (e) {
      if (e.target.closest('.categoryInput')) {
        const categorySelector = document.querySelector('.categoryContainer');
        categorySelector.classList.toggle('hidden');
      }
    });
    window.addEventListener('click', function (e) {
      if (
        !e.target.closest('.categorySelection') &&
        !e.target.closest('.categoryContainer')
      ) {
        const categorySelector = document.querySelector('.categoryContainer');
        if (!categorySelector.classList.contains('hidden')) {
          categorySelector.classList.add('hidden');
        }
      }
    });
    this.#renderCategoryOption();
    this.#addCategory();
    this.#inputCategory();
    this.#removeCategory();
  }

  #renderCategoryOption() {
    const categoryInput = document.querySelector('.category_input');
    renderCategoryOptionFunction(this.categoryList);
    charAndNumberOnly(categoryInput);
    categoryInput.addEventListener(
      'input',
      function (e) {
        renderCategoryOptionFunction(this.categoryList);
      }.bind(this)
    );
  }

  #addCategory() {
    document.addEventListener(
      'click',
      function (e) {
        if (e.target.classList.contains('category_option_item')) {
          const pickValue = e.target.textContent.trim().toLowerCase();
          if (!this.pickenCategoryList.includes(pickValue)) {
            const html = `
            <div
              class="category_select bg-[#95D8ED] rounded-lg flex items-center shrink-0 snap-start"
            >
              <div class="mx-2">${pickValue}</div>
              <div class="mr-2 border border-black w-2 h-0.5"></div>
            </div>
          `;
            document
              .querySelector('.category_selectContainer')
              .insertAdjacentHTML('beforeend', html);
            const placeholderCategory = document.querySelector(
              '.placeholder_category'
            );
            if (!placeholderCategory.classList.contains('hidden'))
              placeholderCategory.classList.add('hidden');

            this.pickenCategoryList.push(pickValue);
            const index = this.categoryList.indexOf(pickValue);
            e.target.remove();
            if (index > -1) {
              this.categoryList.splice(index, 1);
            }
            renderCategoryOptionFunction(this.categoryList);
            // console.log(this);
          }
        }
      }.bind(this)
    );
  }

  #inputCategory() {
    const inputCategory = document.querySelector('.category_input');

    inputCategory.addEventListener(
      'keypress',
      function (e) {
        // Handle event keypress "Enter"
        if (e.key == 'Enter') {
          e.preventDefault();
          const inputValue = inputCategory.value.trim().toLowerCase();
          if (inputValue == '') return;
          if (
            !this.pickenCategoryList.includes(inputValue) &&
            !this.newCategory.includes(inputValue)
          ) {
            const html = `
            <div
              class="category_select bg-[#95D8ED] rounded-lg flex items-center shrink-0 snap-start"
            >
              <div class="mx-2">${inputValue}</div>
              <div class="mr-2 border border-black w-2 h-0.5"></div>
            </div>
          `;
            document
              .querySelector('.category_selectContainer')
              .insertAdjacentHTML('beforeend', html);

            if (this.categoryList.includes(inputValue)) {
              this.categoryList.splice(
                this.categoryList.indexOf(inputValue),
                1
              );
            } else {
              this.newCategory.push(inputValue);
            }
            this.pickenCategoryList.push(inputValue);

            const placeholderCategory = document.querySelector(
              '.placeholder_category'
            );
            if (!placeholderCategory.classList.contains('hidden'))
              placeholderCategory.classList.add('hidden');
          }
          // console.log(this);
          inputCategory.value = '';
          renderCategoryOptionFunction(this.categoryList);
        }
      }.bind(this)
    );
  }

  #removeCategory() {
    document.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.category_select')) {
          const value = e.target.closest('.category_select').textContent.trim();
          if (this.pickenCategoryList.includes(value)) {
            !this.newCategory.includes(value)
              ? this.categoryList.push(value)
              : this.newCategory.splice(this.newCategory.indexOf(value), 1);

            this.pickenCategoryList.splice(
              this.pickenCategoryList.indexOf(value),
              1
            );
          } else if (this.newCategory.includes(value)) {
            this.newCategory.splice(this.newCategory.indexOf(value), 1);
          }

          this.categoryList = this.categoryList.sort();
          e.target.closest('.category_select').remove();
          const placeholderCategory = document.querySelector(
            '.placeholder_category'
          );
          if (
            Array.from(document.querySelectorAll('.category_select')).length ==
            0
          )
            if (placeholderCategory.classList.contains('hidden'))
              placeholderCategory.classList.remove('hidden');

          renderCategoryOptionFunction(this.categoryList);
          // console.log(this);
        }
      }.bind(this)
    );
  }
}

// Helper function
const renderCategoryOptionFunction = function (list) {
  const categoryInput = document.querySelector('.category_input');
  const regex = new RegExp(
    `.*${removeAscent(categoryInput.value.trim())
      .toLowerCase()
      .split('')
      .join('.*')}.*`
  );
  const newList = list.filter((item) => removeAscent(item).match(regex));
  let html = '';
  newList.forEach(
    (item) =>
      (html += `
      <div
          class="category_option_item bg-[#95D8ED] rounded-lg w-full px-2 py-1 cursor-pointer"
      >
          ${item}
      </div>`)
  );
  const categoryOption = document.querySelector('.category_option');
  categoryOption.innerHTML = '';
  categoryOption.insertAdjacentHTML('afterbegin', html);
};

function removeAscent(str) {
  if (str === null || str === undefined) return str;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  return str;
}

export default Category;

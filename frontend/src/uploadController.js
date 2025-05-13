import { Editor } from 'https://esm.sh/@tiptap/core';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit';
import Underline from 'https://esm.sh/@tiptap/extension-underline';
import Link from 'https://esm.sh/@tiptap/extension-link';
import Image from 'https://esm.sh/@tiptap/extension-image';
import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder';
import Category from './utils/category.js';
import { noSpecialChar } from './utils/inputRestrict.js';
import Loader from './utils/loader.js';
import { renderPopup } from './utils/popup.js';
class Upload {
  #images = [];
  constructor() {
    this.editor = new Editor({
      element: document.querySelector('#editor'),
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Placeholder.configure({
          placeholder: 'Write your news content here...',
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          defaultProtocol: 'https',
        }),
        Image.configure({
          inline: false,
        }),
      ],
    });
    this.category = new Category();
    this.#init();
  }
  #init() {
    this.#titleField();
    this.#descriptionField();
    this.#boldButton();
    this.#italicButton();
    this.#underlineButton();
    this.#redoButton();
    this.#undoButton();
    this.#linkButton();
    this.#imageButton();
    this.#orderList();
    this.#unorderList();
    this.#quoteButton();
    this.#heading1Button();
    this.#heading2Button();
    this.#heading3Button();
    this.#styleSetting();
    this.#coverImageField();
    this.#checkInputField();
    this.#uploadButton();
  }
  #titleField() {
    const title = document.querySelector('.titleContent');
    noSpecialChar(title);
    ['input', 'paste'].forEach((event) => {
      title.addEventListener(event, function (e) {
        document.querySelector('input[name="title"]').value =
          e.target.textContent;
      });
    });
  }
  #descriptionField() {
    const description = document.querySelector('.descriptionContent');
    noSpecialChar(description);
    ['input', 'paste'].forEach((event) => {
      description.addEventListener(event, function (e) {
        document.querySelector('input[name="description"]').value =
          e.target.textContent;
      });
    });
  }

  #boldButton() {
    document.querySelector('.bold').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleBold().run();
        document.querySelector('.bold').classList.add('styleActive');
      }.bind(this)
    );
  }
  #heading1Button() {
    document.querySelector('.heading-1').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleHeading({ level: 1 }).run();
      }.bind(this)
    );
  }
  #heading2Button() {
    document.querySelector('.heading-2').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleHeading({ level: 2 }).run();
      }.bind(this)
    );
  }
  #heading3Button() {
    document.querySelector('.heading-3').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleHeading({ level: 3 }).run();
      }.bind(this)
    );
  }
  #italicButton() {
    document.querySelector('.italic').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleItalic().run();
      }.bind(this)
    );
  }
  #underlineButton() {
    document.querySelector('.underline').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleUnderline().run();
      }.bind(this)
    );
  }
  #undoButton() {
    document.querySelector('.undo').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().undo().run();
      }.bind(this)
    );
  }
  #redoButton() {
    document.querySelector('.redo').addEventListener(
      'click',
      function () {
        this.editor.chain().focus().redo().run();
      }.bind(this)
    );
  }
  #quoteButton() {
    document.querySelector('.quote').addEventListener(
      'click',
      function () {
        if (this.editor.isActive('blockquote'))
          this.editor.chain().focus().unsetBlockquote().run();
        else
          this.editor.chain().focus().setParagraph().toggleBlockquote().run();
      }.bind(this)
    );
  }
  #linkButton() {
    const link = document.querySelector('.link');
    link.addEventListener(
      'click',
      function () {
        const previousUrl = this.editor.getAttributes('link').href;
        const url = window.prompt('Hãy nhập link của bạn:', previousUrl);
        // cancelled
        if (url === null) {
          return;
        }

        // empty
        if (url === '') {
          this.editor.chain().focus().extendMarkRange('link').unsetLink().run();

          return;
        }

        // update link
        this.editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url })
          .run();
      }.bind(this)
    );
  }

  #imageButton() {
    const imageButton = document.querySelector('#image');
    imageButton.addEventListener(
      'change',
      function () {
        const file = imageButton.files[0];
        const tempURL = URL.createObjectURL(file);
        const fileObj = { file: file, url: tempURL };
        this.#images.push(fileObj);

        // Handle size
        let size = '';
        // File size is in byte
        // Check if the file size is in MB
        if (file.size >= 1024 * 1024) {
          size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        } else if (file.size >= 1024) {
          size = (file.size / 1024).toFixed(2) + ' KB';
        }

        imageButton.onload = function () {
          this.#images.forEach((image) => {
            URL.revokeObjectURL(image.url);
          });
        }.bind(this);

        this.editor
          .chain()
          .focus()
          .setImage({ src: tempURL })
          .createParagraphNear()
          .run();
        imageButton.value = '';
      }.bind(this)
    );
  }

  #unorderList() {
    document.querySelector('.unorderlist').addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.unorderlist')) {
          if (this.editor.isActive('bulletList')) {
            this.editor.chain().focus().liftListItem('listItem').run();
          } else {
            this.editor.chain().focus().toggleBulletList().run();
          }
        }
      }.bind(this)
    );
  }

  #orderList() {
    document.querySelector('.orderlist').addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.orderlist')) {
          if (this.editor.isActive('orderedList')) {
            this.editor.chain().focus().liftListItem('listItem').run();
          } else {
            this.editor.chain().focus().toggleOrderedList().run();
          }
        }
      }.bind(this)
    );
  }
  #styleSetting() {
    ['update', 'selectionUpdate', 'focus'].forEach(
      ((event) => {
        this.editor.on(
          event,
          function () {
            const editor = this.editor;
            editor.isActive('bold')
              ? document.querySelector('.bold').classList.add('styleActive')
              : document.querySelector('.bold').classList.remove('styleActive');
            editor.isActive('italic')
              ? document.querySelector('.italic').classList.add('styleActive')
              : document
                  .querySelector('.italic')
                  .classList.remove('styleActive');
            editor.isActive('underline')
              ? document
                  .querySelector('.underline')
                  .classList.add('styleActive')
              : document
                  .querySelector('.underline')
                  .classList.remove('styleActive');
            editor.isActive('link')
              ? document.querySelector('.link').classList.add('styleActive')
              : document.querySelector('.link').classList.remove('styleActive');
            editor.isActive('blockquote')
              ? document.querySelector('.quote').classList.add('styleActive')
              : document
                  .querySelector('.quote')
                  .classList.remove('styleActive');
            editor.isActive('bulletList')
              ? document
                  .querySelector('.unorderlist')
                  .classList.add('styleActive')
              : document
                  .querySelector('.unorderlist')
                  .classList.remove('styleActive');
            editor.isActive('orderedList')
              ? document
                  .querySelector('.orderlist')
                  .classList.add('styleActive')
              : document
                  .querySelector('.orderlist')
                  .classList.remove('styleActive');
            !editor.can().undo()
              ? document.querySelector('.undo').classList.add('inactiveButton')
              : document
                  .querySelector('.undo')
                  .classList.remove('inactiveButton');
            !editor.can().redo()
              ? document.querySelector('.redo').classList.add('inactiveButton')
              : document
                  .querySelector('.redo')
                  .classList.remove('inactiveButton');
            editor.isActive('heading', { level: 1 })
              ? document
                  .querySelector('.heading-1')
                  .classList.add('styleActive')
              : document
                  .querySelector('.heading-1')
                  .classList.remove('styleActive');
            editor.isActive('heading', { level: 2 })
              ? document
                  .querySelector('.heading-2')
                  .classList.add('styleActive')
              : document
                  .querySelector('.heading-2')
                  .classList.remove('styleActive');
            editor.isActive('heading', { level: 3 })
              ? document
                  .querySelector('.heading-3')
                  .classList.add('styleActive')
              : document
                  .querySelector('.heading-3')
                  .classList.remove('styleActive');
          }.bind(this)
        );
      }).bind(this)
    );
  }
  #coverImageField() {
    const coverImage = document.querySelector('input[name="coverImage"]');
    coverImage.addEventListener('change', function () {
      const coverImageContainer = document.querySelector('.coverImageOverlay');
      const imagePath = URL.createObjectURL(coverImage.files[0]);
      coverImageContainer.style['background-image'] = `url(${imagePath})`;
      coverImageContainer.classList.add('brightness-75');
      coverImage.onload = function () {
        URL.revokeObjectURL(imagePath);
      };
    });
  }
  #checkInputField() {
    const uploadButton = document.querySelector('.uploadButton');
    uploadButton.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.uploadButton')) {
          const errorList = [];

          // Check title value
          if (document.querySelector('input[name="title"]').value == '') {
            errorList.push('Title');
          }

          // Check title value
          if (document.querySelector('input[name="description"]').value == '') {
            errorList.push('Description');
          }

          // Check news content
          if (
            this.editor.getJSON().content.length == 1 &&
            !this.editor.getJSON().content[0].content
          ) {
            errorList.push('News content');
          }

          // Check category value
          if (!this.category || this.category.pickenCategoryList.length == 0) {
            errorList.push('Category');
          }

          // Check cover image
          if (document.querySelector('input[name="coverImage"]').value == '') {
            errorList.push('Cover Image');
          }

          if (errorList.length !== 0) {
            e.preventDefault();
            const errorStr = errorList.join(', ');
            document.querySelector(
              '.newsError'
            ).textContent = `Please fill the following field(s): ${errorStr}`;
          }
        }
      }.bind(this)
    );

    const titleField = document.querySelector('.titleContent');
    const descriptionField = document.querySelector('.descriptionContent');
    const coverImageField = document.querySelector('input[name="coverImage"]');
    const editor = document.querySelector('#editor');
    const categoryOptions = document.querySelectorAll('.category_option_item');
    const categoryInput = document.querySelector('.category_input');
    ['input', 'change', 'keypress', 'paste'].forEach((event) => {
      [
        titleField,
        descriptionField,
        coverImageField,
        categoryInput,
        editor,
      ].forEach((field) => {
        field.addEventListener(event, function (e) {
          document.querySelector('.newsError').textContent = '';
        });
      });
    });
    categoryOptions.forEach((category) => {
      category.addEventListener('click', () => {
        document.querySelector('.newsError').textContent = '';
      });
    });
  }
  #uploadButton() {
    const newsForm = document.querySelector('.newsForm');
    newsForm.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        const title = document.querySelector('input[name="title"]').value;
        const description = document.querySelector(
          'input[name="description"]'
        ).value;
        const coverImage = document.querySelector('input[name="coverImage"]')
          .files[0];
        let category = this.category.pickenCategoryList;
        const images = this.#images.map((image) => image.file);
        const news = this.editor.getJSON();
        const data = new FormData();
        const externalImageLinks = Array.from(
          document.querySelectorAll('#editor img')
        ).filter((node) => node.src.startsWith('https://'));
        data.append('title', title);
        data.append('description', description);
        data.append('coverImage', coverImage);
        category.forEach((item) => data.append('category', item));
        images.forEach((item) => data.append('images', item));
        externalImageLinks.forEach((item) => data.append('images', item));
        data.append('news', JSON.stringify(news));
        upload(data);
      }.bind(this)
    );
  }
}

// HELPER FUNCTION
const upload = async function (data) {
  try {
    Loader.create();
    const res = await axios({
      method: 'post',
      url: 'api/news',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data,
    });
    Loader.destroy();
    if (res.data.status == 'success') {
      renderPopup(
        201,
        'Upload news',
        'The news has been uploaded successful! Now you will be redirect to news page',
        '/news'
      );
    }
  } catch (err) {
    console.log(err);
    renderPopup(err.response.status, 'Upload news', err.response.data.message);
    Loader.destroy();
  }
};
new Upload();

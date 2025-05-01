import { Editor } from 'https://cdn.jsdelivr.net/npm/@tiptap/core@2.2.2/+esm';
import { StarterKit } from 'https://cdn.jsdelivr.net/npm/@tiptap/starter-kit@2.2.2/+esm';
import Underline from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-underline@2.2.2/+esm';
import Link from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-link@2.2.2/+esm';
import Image from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-image@2.2.2/+esm';
import Placeholder from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-placeholder@2.2.2/+esm';

import {
  poem4,
  poem5,
  poem6,
  poem68,
  poem7768,
  poem,
  author,
  driveVideo,
} from './postEditor-extension.js';

class PostEditor {
  images = [];
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
          placeholder: 'Nội dung bài viết',
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          defaultProtocol: 'https',
        }),
        Image.configure({
          inline: false,
        }),
        poem4,
        poem5,
        author,
        poem6,
        poem68,
        poem7768,
        poem,
        driveVideo,
      ],
    });
    this.#init();
  }

  #init() {
    this.#boldButton();
    this.#italicButton();
    this.#underlineButton();
    this.#redoButton();
    this.#undoButton();
    this.#quoteButton();
    this.#authorButton();
    this.#linkButton();
    this.#imageButton();
    this.#unorderList();
    this.#orderList();
    this.#driveButton();
    this.#deleteImageInput();
  }

  #boldButton() {
    const boldButton = document.querySelector('.bold');
    boldButton.addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleBold().run();
        boldButton.classList.toggle('styleActive');
      }.bind(this)
    );
  }

  #italicButton() {
    const italicButton = document.querySelector('.italic');
    italicButton.addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleItalic().run();
        italicButton.classList.toggle('styleActive');
      }.bind(this)
    );
  }

  #underlineButton() {
    const underlineButton = document.querySelector('.underline');
    underlineButton.addEventListener(
      'click',
      function () {
        this.editor.chain().focus().toggleUnderline().run();
        underlineButton.classList.toggle('styleActive');
      }.bind(this)
    );
  }

  #redoButton() {
    const redoButton = document.querySelector('.redo');
    redoButton.addEventListener(
      'click',
      function () {
        this.editor.chain().focus().redo().run();
      }.bind(this)
    );
  }

  #undoButton() {
    const undoButton = document.querySelector('.undo');
    undoButton.addEventListener(
      'click',
      function () {
        this.editor.chain().focus().undo().run();
      }.bind(this)
    );
  }

  #quoteButton() {
    const quoteButton = document.querySelector('.quote');
    quoteButton.addEventListener(
      'click',
      function () {
        if (this.editor.isActive('blockquote'))
          this.editor.chain().focus().unsetBlockquote().run();
        else
          this.editor.chain().focus().setParagraph().toggleBlockquote().run();
      }.bind(this)
    );
  }

  #authorButton() {
    const quoteButton = document.querySelector('.author');
    const postEditorContainer = document.querySelector(
      '.postEditorContainer_content'
    );
    postEditorContainer.addEventListener('input', function (e) {});
    quoteButton.addEventListener(
      'click',
      function () {
        const value = document.querySelector('.textDesign_value_text');
        if (
          value.dataset['textdesign'] == 'poem4' ||
          value.dataset['textdesign'] == 'poem5' ||
          value.dataset['textdesign'] == 'poem6' ||
          value.dataset['textdesign'] == 'poem68' ||
          value.dataset['textdesign'] == 'poem7768' ||
          value.dataset['textdesign'] == 'poem'
        ) {
          this.editor.chain().focus().toggleAuthor().run();
        }
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
        this.images.push(fileObj);

        // Handle size
        let size = '';
        // File size is in byte
        // Check if the file size is in MB
        if (file.size >= 1024 * 1024) {
          size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        } else if (file.size >= 1024) {
          size = (file.size / 1024).toFixed(2) + ' KB';
        }

        // Handle too long file name
        let name = file.name;
        const fileNameMax = 12;
        if (name.length >= fileNameMax) {
          const ext = name.split('.')[name.split('.').length - 1];
          name = name.slice(0, fileNameMax - ext.length - 3) + `....${ext}`;
        }

        let html = `              
        <div
          class="fileAttachment_item flex flex-1 justify-between px-4 py-2 bg-[#FFFBF3] rounded-lg font-Helvetica"
        >
          <div class="flex flex-1 gap-2 items-center">
            <img src="/images/image.png" alt="image icon" />
            <p class="text-xs max-w-20 ">${name}</p>
            <div class="w-1 h-1 bg-[#767676] rounded-full"></div>
            <a class="text-xs text-[#BE8750]" href="${tempURL}" target="_blank" rel="noopener noreferrer">Xem trước</a>
          </div>
          <div class="flex items-center gap-2">
            <p class="file_size text-xs text-soft-black">${size}</p>
            <img src="/images/close.png" alt="Close button" class='cursor-pointer closeImageButton'/>
          </div>
        </div>
        `;
        document
          .querySelector('.fileAttachmentContainer')
          .insertAdjacentHTML('beforeend', html);
        imageButton.onload = function () {
          this.images.forEach((image) => {
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

  #driveButton() {
    const driveButton = document.querySelector('.drive');
    driveButton.addEventListener(
      'click',
      function () {
        if (this.editor.isActive('drivevideo'))
          this.editor.chain().focus().unsetDriveVideo().run();
        else this.editor.chain().focus().setParagraph().setDriveVideo().run();
      }.bind(this)
    );
  }

  #deleteImageInput() {
    document.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.closeImageButton')) {
          const parent = e.target.closest('.fileAttachment_item');
          const href = parent.querySelector('a').href;
          const image = this.images.find((ele) => {
            return ele.url == href ? ele : undefined;
          });
          this.images.splice(this.images.indexOf(image), 1);
          parent.remove();
          document.querySelector(`img[src="${href}"]`)?.remove();
          URL.revokeObjectURL(href);
        }
      }.bind(this)
    );

    this.editor.on(
      'update',
      function () {
        const inputImage = document
          .querySelector('.fileAttachmentContainer')
          .querySelectorAll('.fileAttachment_item');
        inputImage.forEach((item) => {
          const imageLink = item.querySelector('a');
          const tiptapImage = document.querySelector(
            `.tiptap img[src="${imageLink.href}"]`
          );
          if (!tiptapImage) {
            let idx;
            for (let i = 0; i < this.images.length; ++i) {
              if (this.images[i].url == imageLink.href) {
                idx = i;
                break;
              }
            }
            this.images.splice(idx, 1);
            URL.revokeObjectURL(imageLink.href);
            item.remove();
          }
        });
      }.bind(this)
    );
  }
}

export default PostEditor;

import { Editor } from 'https://cdn.jsdelivr.net/npm/@tiptap/core@2.2.2/+esm';
import { StarterKit } from 'https://cdn.jsdelivr.net/npm/@tiptap/starter-kit@2.2.2/+esm';
import Underline from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-underline@2.2.2/+esm';
import Link from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-link@2.2.2/+esm';
import Image from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-image@2.2.2/+esm';
import Placeholder from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-placeholder@2.2.2/+esm';

class Upload {
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
  }
}
new Upload();

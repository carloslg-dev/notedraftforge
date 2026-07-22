import { Extension } from '@tiptap/core';

export const BlockIdExtension = Extension.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote'],
        attributes: {
          id: {
            default: () => crypto.randomUUID(),
            keepOnSplit: false,
            parseHTML: element => element.getAttribute('data-id'),
            renderHTML: attributes => {
              if (!attributes.id) {
                return {};
              }
              return {
                'data-id': attributes.id,
              };
            },
          },
        },
      },
    ];
  },
});

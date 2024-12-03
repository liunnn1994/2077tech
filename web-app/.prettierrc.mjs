import base from '../.prettierrc.mjs';
import { mergeWith } from 'lodash-es';

export default mergeWith(
  {},
  base,
  {
    plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
    overrides: [
      {
        files: ['*.astro'],
        options: {
          parser: 'astro',
        },
      },
    ],
  },
  function (a, b) {
    if (Array.isArray(a)) {
      return b.concat(a);
    }
  },
);

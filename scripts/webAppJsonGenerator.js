import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DEPTH = 2;
const JSON_FOLDER = path.resolve('./.json');

// get data from markdown
const getData = (folder, groupDepth) => {
  const getPath = fs.readdirSync(folder);
  const removeIndex = getPath.filter((item) => !item.startsWith('-'));

  const getPaths = removeIndex.flatMap((filename) => {
    const filepath = path.join(folder, filename);
    const stats = fs.statSync(filepath);
    const isFolder = stats.isDirectory();

    if (isFolder) {
      return getData(filepath, groupDepth);
    } else if (filename.endsWith('.md') || filename.endsWith('.mdx')) {
      const file = fs.readFileSync(filepath, 'utf-8');
      const { data, content } = matter(file);
      const pathParts = filepath.split(path.sep);
      const slug =
        data.slug ||
        pathParts
          .slice(CONTENT_DEPTH)
          .join('/')
          .replace(/\.[^/.]+$/, '');
      const group = pathParts[groupDepth];

      return {
        group: group,
        slug: slug,
        frontmatter: data,
        content: content,
      };
    } else {
      return [];
    }
  });

  const publishedPages = getPaths.filter((page) => !page.frontmatter?.draft && page);
  return publishedPages;
};

try {
  // create folder if it doesn't exist
  if (!fs.existsSync(JSON_FOLDER)) {
    fs.mkdirSync(JSON_FOLDER);
  }

  // create json files
  const postsJsonPath = path.join(`${JSON_FOLDER}/posts.json`);

  // merger json files for search
  const posts = fs.readFileSync(postsJsonPath, 'utf-8');
  const search = [...JSON.parse(posts)];
  fs.writeFileSync(`${JSON_FOLDER}/search.json`, JSON.stringify(search));
} catch (err) {
  console.error(err);
}

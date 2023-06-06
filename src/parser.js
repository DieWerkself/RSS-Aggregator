export default (rss, i18) => {
  const parser = new DOMParser();
  const rssDom = parser.parseFromString(rss, 'text/xml');
  if (rssDom.querySelector('parsererror')) {
    throw new Error(i18.t('invalidRss'));
  }
  const feedTitle = rssDom.querySelector('channel title').textContent;
  const feedDescription = rssDom.querySelector('channel description').textContent;
  const posts = [...rssDom.querySelectorAll('channel item')].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;
    return { title: postTitle, description: postDescription, url: postLink };
  });
  const feed = { title: feedTitle, description: feedDescription };
  return { feed, posts };
};

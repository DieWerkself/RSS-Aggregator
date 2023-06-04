import { init, t } from 'i18next';

const renderStatus = (elements, status) => {
  if (!status.error && status.successResponse) {
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.input.classList.remove('is-invalid');
    elements.feedback.textContent = status.successResponse;
    elements.form.reset();
    elements.input.focus();
  }
  if (status.error && !status.successResponse) {
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
    elements.input.classList.add('is-invalid');
    elements.feedback.textContent = status.error;
  }
};

const renderFeeds = (elements, feeds) => {
  elements.feeds.innerHTML = '';
  const feedsSection = document.createElement('div');
  feedsSection.classList.add('feeds_card');
  const feedsTitle = document.createElement('div');
  const h2Title = document.createElement('h2');
  h2Title.textContent = t('feeds');
  feedsTitle.append(h2Title);
  const ulFeeds = document.createElement('ul');
  ulFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  const feedsArray = [...feeds].map((feed) => {
    const liFeed = document.createElement('li');
    liFeed.classList.add('list-group-item', 'border-0', 'border-end-0');
    const titleFeed = document.createElement('h3');
    titleFeed.classList.add('h6', 'm-0');
    titleFeed.textContent = feed.title;
    const descriptionFeed = document.createElement('p');
    descriptionFeed.classList.add('m-0', 'small', 'text-white-50');
    descriptionFeed.textContent = feed.description;
    const hrFeed = document.createElement('hr');
    liFeed.append(titleFeed, descriptionFeed, hrFeed);
    return liFeed;
  });
  feedsSection.append(feedsTitle, ...feedsArray);
  elements.feeds.append(feedsSection);
};

const renderPosts = (elements, posts) => {
  elements.posts.innerHTML = '';
  const postsSection = document.createElement('div');
  postsSection.classList.add('feeds_card');
  const postsTitle = document.createElement('div');
  const postsH2Title = document.createElement('h2');
  postsH2Title.textContent = t('posts');
  postsTitle.append(postsH2Title);
  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
  const postsArray = [...posts].map((post) => {
    const liPost= document.createElement('li');
    liPost.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const linkPost = document.createElement('a');
    linkPost.classList.add('link_post', 'fw-bold');
    linkPost.setAttribute('data-id', post.id);
    linkPost.setAttribute('target', '_blank');
    linkPost.setAttribute('rel', 'noopener noreferrer');
    linkPost.href = post.url;
    linkPost.textContent = post.title;
    const buttonPost = document.createElement('button');
    buttonPost.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonPost.setAttribute('data-id', post.id);
    buttonPost.setAttribute('data-bs-toggle', 'modal');
    buttonPost.setAttribute('data-bs-target', '#modal');
    buttonPost.type = 'button';
    buttonPost.textContent = t('showModal');
    liPost.append(linkPost, buttonPost);
    return liPost;
  });
  postsSection.append(postsTitle, ...postsArray);
  elements.posts.append(postsSection);
};

export default (elements, initialState) => (path, value, prevValue) => {
  switch (path) {
    case 'feeds':
      renderFeeds(elements, value);
      break
    case 'posts':
      renderPosts(elements, value);
      break
    case 'status':
      renderStatus(elements, value, prevValue);
      break;
    default:
      break;
  }
};


const renderModal = (modal, title, description) => {
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  modalTitle.textContent = title;
  modalBody.textContent = description;
};

const renderStatus = (elements, status) => {
  const { feedback, input, form } = elements;
  if (status.validationState === 'invalid') {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
  }
  if (status.state === 'failed') {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  }
  if (status.state === 'success') {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    input.classList.remove('is-invalid');
    form.reset();
    input.focus();
  }
  feedback.textContent = status.message;
};

const renderFeeds = (elements, feedsList, i18) => {
  const { feeds } = elements;
  feeds.innerHTML = '';
  const feedsSection = document.createElement('div');
  feedsSection.classList.add('feeds_card');
  const feedsTitle = document.createElement('div');
  const h2Title = document.createElement('h2');
  h2Title.textContent = i18.t('feeds');
  feedsTitle.append(h2Title);
  const ulFeeds = document.createElement('ul');
  ulFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  const feedsArray = [...feedsList].map((feed) => {
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
  feeds.append(feedsSection);
};

const renderPosts = (elements, postsList, initialState, i18) => {
  const { posts, modal } = elements;
  posts.innerHTML = '';
  const postsSection = document.createElement('div');
  postsSection.classList.add('feeds_card');
  const postsTitle = document.createElement('div');
  const postsH2Title = document.createElement('h2');
  postsH2Title.textContent = i18.t('posts');
  postsTitle.append(postsH2Title);
  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
  const postsArray = [...postsList].map((post) => {
    const liPost = document.createElement('li');
    liPost.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const linkPost = document.createElement('a');
    linkPost.classList.add(initialState.uiState.visited.has(post.id) ? 'fw-normal' : 'fw-bold');
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
    buttonPost.textContent = i18.t('showModal');
    liPost.append(linkPost, buttonPost);
    liPost.addEventListener('click', (e) => {
      initialState.uiState.visited.add(e.target.dataset.id);
      if (e.target.type === 'button') {
        renderModal(modal, post.title, post.description);
      }
      renderPosts(elements, postsList, initialState, i18);
    });
    return liPost;
  });
  postsSection.append(postsTitle, ...postsArray);
  posts.append(postsSection);
};

export default (elements, initialState, i18) => (path, value) => {
  const { button } = elements;
  switch (path) {
    case 'feeds':
      renderFeeds(elements, value, i18);
      break;
    case 'posts':
      renderPosts(elements, value, initialState, i18);
      break;
    case 'loadingFeed':
      renderStatus(elements, value);
      break;
    case 'uiState.isProcess':
      button.disabled = value;
      break;
    default:
      break;
  }
};

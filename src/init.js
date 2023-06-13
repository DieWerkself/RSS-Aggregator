import 'bootstrap';
import './styles.scss';
import _ from 'lodash';
import axios from 'axios';
import * as yup from 'yup';
import render from './view.js';
import parseRss from './parser';

const createUrl = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', link);
  return url.href;
};

const updateFeeds = (state) => {
  setTimeout(() => {
    const promisesPosts = state.feeds.map(({ url }) => axios.get(createUrl(url))
      .then((response) => {
        const { posts } = parseRss(response.data.contents);
        const newPosts = _.differenceBy(posts, state.posts, 'url');
        const updatedPosts = newPosts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
        state.posts.unshift(...updatedPosts);
      })
      .catch(() => { }));
    Promise.all(promisesPosts).finally(() => updateFeeds(state));
  }, 5000);
};

export default (i18inst) => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('.modal-content'),
    button: document.querySelector('[aria-label="add"]'),
  };

  const initialState = {
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    form: {
      error: null,
      status: 'filling',
    },
    feeds: [],
    posts: [],
    uiState: {
      visited: new Set(),
      modal: {},
    },
  };

  yup.setLocale({
    string: {
      url: 'invalidUrl',
    },
    mixed: {
      notOneOf: 'existedUrl',
    },
  });

  const watchedState = render(elements, initialState, i18inst);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value;
    watchedState.form.status = 'processing';
    const loadedFeeds = () => initialState.feeds.map((item) => item.url);
    const existingUrls = loadedFeeds();
    const urlValidate = yup.string().url().notOneOf(existingUrls);
    urlValidate.validate(url)
      .then((validUrl) => {
        watchedState.form.status = 'success';
        watchedState.loadingProcess.status = 'loading';
        return axios.get(createUrl(validUrl));
      })
      .then((response) => {
        watchedState.loadingProcess.status = 'loaded';
        const { feed, posts } = parseRss(response.data.contents);
        watchedState.feeds.unshift({ ...feed, id: _.uniqueId('feedId_'), url });
        const postsWithId = posts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
        watchedState.posts.unshift(...postsWithId);
        watchedState.loadingProcess.error = null;
        watchedState.loadingProcess.status = 'responseSuccess';
        if (initialState.feeds.length === 1) updateFeeds(watchedState);
      })
      .catch((error) => {
        if (error.isAxiosError) {
          watchedState.loadingProcess.error = 'networkError';
          watchedState.loadingProcess.status = 'failed';
          return;
        }
        watchedState.form.error = error.isParsingError ? 'invalidRss' : error.message;
        watchedState.form.status = 'failed';
      });
  });
};

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

  const state = render(elements, initialState, i18inst);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value;
    state.form.status = 'processing';
    const loadedFeeds = () => initialState.feeds.map((item) => item.url);
    const existingUrls = loadedFeeds();
    const urlValidate = yup.string().url().notOneOf(existingUrls);
    urlValidate.validate(url)
      .then((validUrl) => {
        state.form.status = 'success';
        state.loadingProcess.status = 'loading';
        return axios.get(createUrl(validUrl));
      })
      .then((response) => {
        state.loadingProcess.status = 'loaded';
        const { feed, posts } = parseRss(response.data.contents);
        state.feeds.unshift({ ...feed, id: _.uniqueId('feedId_'), url });
        const postsWithId = posts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
        state.posts.unshift(...postsWithId);
        state.loadingProcess.error = null;
        state.loadingProcess.status = 'responseSuccess';
        if (initialState.feeds.length === 1) updateFeeds(state);
      })
      .catch((error) => {
        if (error.isAxiosError) {
          state.loadingProcess.error = 'networkError';
          state.loadingProcess.status = 'failed';
          return;
        }
        state.form.error = error.isParsingError ? 'invalidRss' : error.message;
        state.form.status = 'failed';
      });
  });
};

import 'bootstrap';
import './styles.scss';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';
import parseRss from './parser';
import resources from './localization/lang.js';

export default () => {
  const createUrl = (link) => {
    const url = new URL('https://allorigins.hexlet.app/get');
    url.searchParams.set('disableCache', 'true');
    url.searchParams.set('url', link);
    return url.href;
  };

  const i18inst = i18next.createInstance();
  i18inst.init({
    lng: 'ru',
    debug: false,
    resources,
  });

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
    loadingFeed: {
      message: null,
      state: 'init',
      validationState: 'valid',
    },
    status: {
      validation: null,
      network: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      visited: new Set(),
      isProcess: false,
    },
  };

  yup.setLocale({
    string: {
      url: i18inst.t('invalidUrl'),
    },
    mixed: {
      notOneOf: i18inst.t('existedUrl'),
    },
  });

  const state = onChange(initialState, render(elements, initialState, i18inst));

  const updateFeeds = () => {
    setTimeout(() => {
      const promisesPosts = initialState.feeds.map(({ url }) => axios.get(createUrl(url))
        .then((response) => {
          const { posts } = parseRss(response.data.contents, i18inst);
          const newPosts = _.differenceBy(posts, initialState.posts, 'url');
          const updatedPosts = newPosts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
          state.posts.unshift(...updatedPosts);
        })
        .catch(() => {}));
      Promise.all(promisesPosts).finally(() => updateFeeds());
    }, 5000);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.uiState.isProcess = true;
    const url = elements.input.value;
    const loadedFeeds = () => initialState.feeds.map((item) => item.url);
    const existingUrls = loadedFeeds();
    const urlValidate = yup.string().url().notOneOf(existingUrls);
    urlValidate.validate(url)
      .then((validUrl) => axios.get(createUrl(validUrl)))
      .then((response) => {
        const { feed, posts } = parseRss(response.data.contents);
        state.feeds.unshift({ ...feed, id: _.uniqueId('feedId_'), url });
        const postsWithId = posts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
        state.posts.unshift(...postsWithId);
        state.loadingFeed = { message: i18inst.t('responseSuccess'), state: 'success', validationState: 'valid' };
        if (initialState.feeds.length === 1) updateFeeds();
      })
      .catch((error) => {
        if (error.isParsingError) {
          state.loadingFeed = { message: i18inst.t('invalidRss'), state: 'failed', validationState: 'valid' };
          return;
        }
        if (error.isAxiosError) {
          state.loadingFeed = { message: i18inst.t('networkError'), state: 'failed', validationState: 'valid' };
          return;
        }
        state.loadingFeed = { message: error.message, state: 'init', validationState: 'invalid' };
      })
      .then(() => { state.uiState.isProcess = false; });
  });
};

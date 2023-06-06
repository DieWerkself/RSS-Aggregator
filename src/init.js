import 'bootstrap';
import './styles.scss';
import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';
import parseRss from './parser';
import i18 from './localization/lang.js';

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
    url: i18.t('invalidUrl'),
  },
  mixed: {
    notOneOf: i18.t('existedUrl'),
  },
});

export const state = onChange(initialState, render(elements, initialState, i18));

export default () => {
  const updateFeeds = () => {
    setTimeout(() => {
      const promisesPosts = initialState.feeds.map(({ url }) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
        .then((response) => {
          const { posts } = parseRss(response.data.contents, i18);
          const newPosts = _.differenceBy(posts, initialState.posts, 'url');
          const updatedPosts = newPosts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
          state.posts.unshift(...updatedPosts);
        })
        .catch(() => console.log(i18.t('networkError'))));
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
      .then((validUrl) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${validUrl}`))
      .then((response) => {
        const { feed, posts } = parseRss(response.data.contents, i18);
        state.feeds.unshift({ ...feed, id: _.uniqueId('feedId_'), url: response.data.status.url });
        const postsWithId = posts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
        state.posts.unshift(...postsWithId);
        state.status = { error: null, network: i18.t('responseSuccess') };
        if (initialState.feeds.length === 1) updateFeeds();
      })
      .catch((error) => {
        state.status = { error: error.message, network: null };
      })
      .then(() => { state.uiState.isProcess = false; });
  });
};

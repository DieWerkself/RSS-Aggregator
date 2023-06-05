import './styles.scss';
import render from './view.js';
import parseRss from './parser';
import 'bootstrap';
import * as yup from 'yup';
import axios from 'axios';
import onChange from 'on-change';
import { init, t } from 'i18next';
import _ from 'lodash';

init({
  lng: 'ru', 
  debug: false,
  resources: {
    ru: {
      translation: {
        "invalidUrl": 'Ссылка должна быть валидным URL',
        "invalidRss": 'Ресурс не содержит валидный RSS',
        "existedUrl": 'RSS уже существует',
        "responseSuccess": 'RSS успешно загружен',
        "feeds": 'Фиды',
        "posts": 'Посты',
        "showModal": 'Просмотр',
      }
    }
  }
});

yup.setLocale({
  string: {
    url: t('invalidUrl'),
  },
  mixed: {
    notOneOf: t('existedUrl'),
  },
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
  status: {
    validation: null,
    network: null,
  },
  feeds: [],
  posts: [],
  uiState: {
    visited: new Set(),
    process: false,
  }
};

const updateFeeds = () => {
  setTimeout(() => {
    const promisesPosts = initialState.feeds.map(({ url }) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
        .then((response) => {
          const { posts } = parseRss(response.data.contents);
          const newPosts = _.differenceBy(posts, initialState.posts, 'url');
          const updatedPosts = newPosts.map((post) => ({ ...post, id: _.uniqueId('postId_') }));
          state.posts.unshift(...updatedPosts);
        })
        .catch((e) => console.log(e.message))
    );
    Promise.all(promisesPosts).finally(() => updateFeeds());
  }, 5000)
};

export const state = onChange(initialState, render(elements, initialState));

const loadedFeeds = () => initialState.feeds.map((item) => item.url);

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.uiState.process = true;
  const data = new FormData(e.target);
  const url = data.get('url');
  const existingUrls = loadedFeeds();
  const urlValidate = yup.string().url().notOneOf(existingUrls);
  urlValidate.validate(url)
    .then((validUrl) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${validUrl}`))
    .then((response) => {
      const { feed, posts } = parseRss(response.data.contents);
      state.feeds.unshift({ ...feed, id: _.uniqueId('feedId_'), url: response.data.status.url });
      const postsWithId = posts.map((post) => ({ ...post, id: _.uniqueId('postId_')}));
      state.posts.unshift(...postsWithId);
      state.status = { error: null, successResponse: t('responseSuccess') };
      state.uiState.process = false;
      if (initialState.feeds.length === 1) updateFeeds();
    })
  .catch((error) => {
    state.status = { error: error.message, successResponse: null } ;
  });
})

// https://news.yandex.ru/daily.rss (пустышка, не содержит rss - "Ресурс не содержит валидный RSS")
// Отечественные и зарубежные rss - каналы:
// https://aljazeera.com/xml/rss/all.xml
// https://buzzfeed.com/world.xml
// https://thecipherbrief.com/feed
// https://feeds.washingtonpost.com/rss/world (отвечает долго, в районе 4-5 секунд, иногда и до 10 доходит)
// https://rt.com/rss/news
// http://www.dp.ru/exportnews.xml
// http://www.fontanka.ru/fontanka.rss
// http://lenta.ru/l/r/EX/import.rss

// .then((correctUrl) => {
// state.feeds.push({ feedUrl: correctUrl });
// state.status = { validation: null, network: t('responseSuccess') };
//   })
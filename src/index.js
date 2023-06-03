import './styles.scss';
import render from './view.js';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import { init, t } from 'i18next';

init({
  lng: 'ru', 
  debug: true,
  resources: {
    ru: {
      translation: {
        "invalidUrl": 'Ссылка должна быть валидным URL',
        "existedUrl": 'RSS уже существует',
        "responseSuccess": 'RSS успешно загружен',
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
};

const initialState = {
  status: {
    validation: null,
    network: null,
  },
  feeds: [],
};

const state = onChange(initialState, render(elements, initialState));

const loadedFeeds = () => initialState.feeds.map((item) => item.feedUrl);

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const url = data.get('url');
  const existingUrls = loadedFeeds();
  const urlValidate = yup.string().url().notOneOf(existingUrls);
  urlValidate.validate(url).then((correctUrl) => {
    state.feeds.push({ feedUrl: correctUrl });
    state.status = { validation: null, network: t('responseSuccess') };
  }).catch((error) => {
    state.status = { validation: error.message, network: null } ;
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
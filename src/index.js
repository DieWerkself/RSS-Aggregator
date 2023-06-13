import i18next from 'i18next';
import runApp from './init.js';
import resources from './localization/lang.js';

const i18inst = i18next.createInstance();
i18inst.init({
  lng: 'ru',
  debug: false,
  resources,
}).then(() => runApp(i18inst));

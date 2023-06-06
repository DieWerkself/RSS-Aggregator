import i18next from 'i18next';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru: {
      translation: {
        invalidUrl: 'Ссылка должна быть валидным URL',
        invalidRss: 'Ресурс не содержит валидный RSS',
        networkError: 'Ошибка сети',
        existedUrl: 'RSS уже существует',
        responseSuccess: 'RSS успешно загружен',
        feeds: 'Фиды',
        posts: 'Посты',
        showModal: 'Просмотр',
      },
    },
  },
});

export default i18nextInstance;

const renderStatus = (elements, status) => {
  if (!status.validation && status.network) {
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = status.network;
    elements.form.reset();
    elements.input.focus();
  }
  if (status.validation && !status.network) {
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = status.validation;
  }

};

const renderFeeds = (elements, error) => {
  return
};

export default (elements, initialState) => (path, value, prevValue) => {
  console.log(path, value);
  switch (path) {
    case 'feeds':
      renderFeeds(elements, value);
      break
    case 'status':
      renderStatus(elements, value, prevValue);
      break;
    default:
      break;
  }
};


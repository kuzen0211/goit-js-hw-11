import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

const inputValue = document.querySelector('.search-form__input');
const searchBtn = document.querySelector('.search-form__btn');
const gallery = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.photo-card__item', {
  captionsData: 'alt',
  captionDelay: 100,
});

searchBtn.addEventListener('click', event => {
  event.preventDefault();
});

searchBtn.addEventListener('submit', event => {
  event.preventDefault();
});

inputValue.addEventListener(
  'input',
  debounce(() => {
    values = inputValue.value.trim();

    if (values === '') {
      return clearMarkup();
    }
    fetchImages(values);
  }, 300)
);

let counter = 1;
function fetchImages(values) {
  const searchParams = new URLSearchParams({
    key: '31282764-0017d0f99317739c03b205fc8',
    q: `${values}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: `${counter}`,
    per_page: 40,
  });

  fetch(`https://pixabay.com/api/?${searchParams}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then(data => {
      const { hits: dataArray } = data;

      if (dataArray.length === 0) {
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      console.log(dataArray);
      renderPhotos(dataArray);
      counter++;
    })
    .catch(error => error);
}

function clearMarkup() {
  gallery.innerHTML = '';
}

function renderPhotos(data) {
  let markup = '';

  markup = [...data]
    .map(
      ({
        webformatURL,
        tags,
        largeImageURL,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a class='photo-card__item' href='${largeImageURL}'>
   <img class='photo-card__img' src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info__item">
      <b>Likes</b>${likes}
    </p>
    <p class="info__item">
      <b>Views</b>${views}
    </p>
    <p class="info__item">
      <b>Comments</b>${comments}
    </p>
    <p class="info__item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
  </a>
  `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

window.addEventListener('scroll', () => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
  if (scrollHeight - clientHeight === scrollTop) {
    fetchImages(values);
  }
});

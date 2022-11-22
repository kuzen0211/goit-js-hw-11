import { getImages } from './js/get_images';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
const formEl = document.querySelector('#search-form');
export const {
  elements: { searchQuery },
} = formEl;

const lightbox = new SimpleLightbox('.photo-card__item', {
  captionsData: 'alt',
  captionDelay: 100,
});

function normalize(text) {
  searchQuery.value = searchQuery.value.trim().toLowerCase();
  if (text === ' ') {
    searchQuery.value += ' ';
  }
}

searchQuery.addEventListener('input', event => {
  normalize(event.data);
});

export let COUNTER = 1;
export let PER_PAGE = 40;
let TOTAL_IMAGES = 0;

const onScrollWindow = debounce(() => {
  const { height: cardHeight } = gallery.firstChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}, 1500);

window.addEventListener('scroll', onScrollWindow);

formEl.addEventListener('submit', event => {
  event.preventDefault();
  searchQuery.value = searchQuery.value.trim().toLowerCase();
  COUNTER = 1;
  clearMarkup();

  getImages()
    .then(response => {
      const { hits: images, totalHits: totalAmount } = response;

      if (images.length === 0) {
        loadMore.classList.add('not-visible');
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      if (COUNTER === 1) {
        Notiflix.Notify.success(`Hooray! We found ${totalAmount} images.`);
      }

      TOTAL_IMAGES = Math.floor(totalAmount / PER_PAGE);
      if (totalAmount % PER_PAGE !== 0) {
        TOTAL_IMAGES += 1;
      }

      renderPhotos(images);
      loadMore.classList.remove('not-visible');
    })
    .catch(error => {
      Notiflix.Notify.failure(error.message);
    });
});

function renderPhotos(data, totalAmount) {
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
  if (COUNTER === TOTAL_IMAGES) {
    loadMore.classList.add('not-visible');
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
  }
  lightbox.refresh();
}

function clearMarkup() {
  gallery.innerHTML = '';
}

loadMore.addEventListener('click', () => {
  COUNTER++;
  getImages().then(response => {
    return renderPhotos(response.hits);
  });
});

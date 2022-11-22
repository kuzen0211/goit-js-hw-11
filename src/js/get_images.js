import { COUNTER } from '../index';
import { PER_PAGE } from '../index';
import axios from 'axios';
import { searchQuery } from '../index';

export async function getImages() {
  try {
    const searchParams = new URLSearchParams({
      key: '31282764-0017d0f99317739c03b205fc8',
      q: searchQuery.value.split(' ').join('+'),
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: `${COUNTER}`,
      per_page: `${PER_PAGE}`,
    });

    const response = await axios.get(
      `https://pixabay.com/api/?${searchParams}`
    );

    if (response.status !== 200) {
      throw new Error(response.status);
    }
    return response.data;
  } catch (error) {
    error.message;
  }
}

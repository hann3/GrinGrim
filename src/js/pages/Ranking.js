import axios from 'axios';
import render from '../router.js';

export default () => ({
  async getData(query) {
    query = query || 'categoryId=1';
    const [_, categoryId] = query.split('=');
    try {
      const { data: categoryName } = await axios.get(`category/${categoryId}/name`);
      const { data: maxLength } = await axios.get(`category/length`);
      const { data: ranking } = await axios.get(`drawings/category/${categoryId}?sortBy=like`);
      return { data: { categoryId, categoryName, maxLength, ranking } };
    } catch (error) {
      console.error();
    }
  },

  getHtml({ userId, categoryId, categoryName, maxLength, ranking }) {
    const rankingElement = ranking
      .map(
        ({ id, likedUserId, url, nickname, profile }) => `
			<figure data-id="${id}">
				<div class="img-container">
					<img src="${url}" alt="${categoryName}">
				</div>
				<figcaption>
					<img src="${profile}" alt="${nickname}" class="profile"/>
					<div class="info-container">
						<span class="nickname">${nickname}</span>
						<div class="like--group">
							<i class="${likedUserId.includes(userId) ? 'fas fa-heart' : 'far fa-heart'} like"></i>
							<span>${likedUserId.length}</span>
						</div>
					</div>
				</figcaption>
			</figure>
			`
      )
      .join('');

    return `
			<section class="ranking-container">
				<div class="ranking-subject">
				<h2 data-id="${categoryId}" data-length="${maxLength}" class="category-title">주제: ${categoryName}</h2>
				<div class="buttonContainer">
				<button class="prev"><</button>
				<button class="next">></button>
				
				</div>
				</div>
				<div class="drawings">
					${rankingElement}
				</div>
				<a href="/" class="fas fa-3x fa-home home"></a>
			</section>`;
  },

  eventBinding(el, userId) {
    const $drawings = el.querySelector('.drawings');
    const $prevButton = el.querySelector('.prev');
    const $nextButton = el.querySelector('.next');
    const $categoryTitle = el.querySelector('.category-title');
    const id = +$categoryTitle.dataset.id;
    const length = +$categoryTitle.dataset.length;

    const renderLikeGroup = (el, likedUserId) => {
      el.innerHTML = `
        <i class="${likedUserId.includes(userId) ? 'fas fa-heart' : 'far fa-heart'} like"></i>
        <span>${likedUserId.length}</span>
      `;
    };

    const toggleLiked = async ({ target }) => {
      if (!target.matches('.like')) return;
      const { id } = target.closest('figure').dataset;
      const $likeGroup = target.closest('.like--group');
      const { data: likedUserId } = await axios.patch(`/drawings/${id}`, {
        userId
      });

      renderLikeGroup($likeGroup, likedUserId);
    };

    const getPrevCategory = e => {
      const prevId = id - 1 === 0 ? length : id - 1;
      const query = prevId === 1 ? '' : `?categoryId=${prevId}`;
      window.history.pushState({}, null, `/ranking${query}`);
      render(document.querySelector('#root'), '/ranking', query);
    };

    const getNextCategory = e => {
      const query = id === length ? '' : `?categoryId=${id + 1}`;
      window.history.pushState({}, null, `/ranking${query}`);
      render(document.querySelector('#root'), '/ranking', query);
    };

    $prevButton.addEventListener('click', getPrevCategory);
    $nextButton.addEventListener('click', getNextCategory);

    $drawings.addEventListener('click', toggleLiked);
  }
});

import axios from 'axios';

export default () => ({
  async getData() {
    const { data: userId } = await axios.get('/auth');
    const { data: mydrawings } = await axios.get(`/drawings/userid/${userId}`);
    const { data: categories } = await axios.get('/category');

    const getCategoryName = categoryId => categories.find(({ id }) => id === categoryId).name;
    const mydrawingsWithCategoryName = mydrawings.map(mydrawing => ({
      ...mydrawing,
      categoryName: getCategoryName(mydrawing.categoryId)
    }));

    return { data: mydrawingsWithCategoryName };
  },

  getHtml({ userId, ...rest }) {
    const { length } = Object.keys(rest);
    const mydrawings = Array.from({ ...rest, length });

    const myDrawingElement = mydrawings.length
      ? mydrawings
          .map(
            ({ categoryName, likedUserId, url }) => `
            <figure>
                <div class="img-container">
                  <img src="${url}" alt="${categoryName}">
                </div>
                <figcaption>
                  <p>주제: ${categoryName}</p>
                  <div class="like-group">
                    <i class="fas fa-heart like"></i>
                    <span>${likedUserId.length}</span>
                  </div>
                </figcaption>
            </figure>	`
          )
          .join('')
      : `
          <div class="no-data-found message">
            <span class="message-title">이런!</span>
            <span>아직 활동 내역이 없어요.</span>
            <span>나만의 작품을 만들어 볼까요?</span>
          </div>
          <img src="/img/icon-giraffe.svg" alt="기린" class="icon-giraffe"></img>`;

    return `
      <section class="mydrawings-container">
        <h2 class="title">내 작품 보기</h2>
        <div class="drawings">
          ${myDrawingElement}
        </div>
        <a href="/" class="fas fa-3x fa-home home"></a>
      </section>`;
  },

  eventBinding() {
    return null;
  }
});

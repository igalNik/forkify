import View from './view.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  _generateMarkup() {
    const currentPage = this._data.page;
    let markup = '';

    // if prev page exist, define prev button
    if (this._isPrevPage()) {
      markup += `
        <button class="btn--inline pagination__btn--prev" data-goto="${
          currentPage - 1
        }">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
        <span>Page ${currentPage - 1}</span>
        </button>`;
    }
    // if next page exist
    if (this._isNextPage()) {
      markup += `
        <button class="btn--inline pagination__btn--next" data-goto="${
          currentPage + 1
        }">
            <span>Page ${currentPage + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>`;
    }
    return markup;
  }

  _isPrevPage() {
    return this._data.page > 1;
  }

  _isNextPage() {
    return (
      this._data.page < this._data.results.length / this._data.resultsPerPage
    );
  }

  addPaginationHandler(handler) {
    this._parentElement.addEventListener('click', function (e) {
      e.preventDefault();

      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      // get the number of page to go
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }
}

export default new PaginationView();

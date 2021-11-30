import View from './view.js';
import icons from 'url:../../img/icons.svg';
import previewView from './PreviewView.js';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _message = ``;
  _errorMessage = `No recipes found for your query! Please try again`;

  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new ResultsView();
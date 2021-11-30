// import model
import * as model from './model.js';
// import reset hash function
import { resetHash, changeIdUrl, timeout } from './helpers.js';
// import the timeout for close window
import { MODAL_CLOSE_SEC } from './config.js';
// import views
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// add polyfills for ES6 version
import 'core-js/stable'; // everything except async/await
import 'regenerator-runtime'; // async/await

if (module.hot) module.hot.accept;

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    // 1. update active result in resultsView
    resultsView.update(model.getSearchResultsPage());

    // 2. Loading recipe
    await model.loadRecipe(id);

    // 3. Rendering recipe
    recipeView.render(model.state.recipe);

    // 4. update active bookmark
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearch = async function () {
  try {
    resultsView.renderSpinner();

    // 1. get search query
    const query = searchView.getQuery();

    if (!query) return;

    // 2. load search results to model state
    await model.loadSearchResults(query);

    // 3. render results
    resultsView.render(model.getSearchResultsPage());

    // 4. render pagination buttons
    paginationView.render(model.state.search);

    // 5. render message to recipe view
    recipeView.renderMessage(
      `${model.state.search.results.length} results found!`
    );
    resetHash();
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // 1. render new page results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. render pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (updateTo) {
  if (updateTo === 0) return;
  // update the recipe servings (in state)
  model.updateServings(updateTo);
  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // add bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  // delete bookmark
  else model.deleteBookmark(model.state.recipe.id);
  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks view
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // 1. Show loading Spinner
    addRecipeView.renderSpinner();

    // 2. Upload the new recipe
    await model.uploadRecipe(newRecipe);

    // 3. Render recipe
    recipeView.render(model.state.recipe);

    // 4. Success message
    addRecipeView.renderMessage();

    // 5. Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // 6. Change ID in URL
    changeIdUrl(model.state.recipe.id);
  } catch (err) {
    console.error('💥', err);
  } finally {
    await timeout(2);
    addRecipeView.toggleWindow();
    await timeout(2);
    addRecipeView.render(null, true, false);
  }
};

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearch);
  paginationView.addPaginationHandler(controlPagination);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

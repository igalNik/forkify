import { async } from 'regenerator-runtime';
import { API_URL, API_KEY, RESULTS_PER_PAGE, NOT_FOUND } from './config';
// import { AJAX, AJAX } from './helpers';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    state.recipe = createRecipeObject(data);

    const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);

    if (index === NOT_FOUND) state.recipe.bookmark = false;
    else {
      // set as bookmarked
      state.recipe.bookmarked = true;
      // update bookmark result
      state.bookmarks[index] = state.recipe;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    // 1. set query on search state
    state.search.query = query;

    // 2. reset page number on search state
    state.search.page = 1;

    // 3. get data from API
    const { data } = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    // 4. compile data and set it on search state results
    state.search.results = data.recipes.map(recipe => {
      return {
        id: recipe.id,
        image: recipe.image_url,
        publisher: recipe.publisher,
        title: recipe.title,
        ...(recipe.key && { key: recipe.key }),
      };
    });
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  const factor = newServings / state.recipe.servings;

  // update ingredients
  state.recipe.ingredients.forEach(ing => (ing.quantity *= factor));
  //   update servings
  state.recipe.servings = newServings;
};

export const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookMark = function (recipe) {
  // 1. add bookmark
  state.bookmarks.push(recipe);

  // 2. Mark current recipe as bookmark
  recipe.id === state.recipe.id
    ? (state.recipe.bookmarked = true)
    : (state.recipe.bookmarked = false);

  // 3. save bookmarks on local storage
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);

  if (index === NOT_FOUND) return;
  // 1. delete bookmark
  state.bookmarks.splice(index, 1);
  // 2. set recipe as not bookmarked
  state.recipe.bookmarked = false;

  // 3. save bookmarks on local storage
  persistBookmarks();
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format, Please use the correct format :)'
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      id: newRecipe.id,
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookMark(state.recipe);
    console.log(state.recipe);
  } catch (err) {
    throw err;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');

  if (!storage) return;

  state.bookmarks = JSON.parse(storage);

  //   console.log(state.bookmarks);
};
init();

// for debugging propose
const clearAllBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearAllBookmarks();

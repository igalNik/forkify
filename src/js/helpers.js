import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config';

export const timeout = async function (seconds) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(
        new Error(`Request took too long! Timeout after ${seconds} seconds`)
      );
    }, seconds * 1000);
  });
};

// getJSON and sendJSON in one function
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await response.json();

    if (!response.ok)
      throw new Error(`${response.statusText} (${data.message})`);

    return data;
  } catch (err) {
    throw err;
  }
};

export const getJSON = async function (url) {
  try {
    const response = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await response.json();
    if (!response.ok)
      throw new Error(`${response.statusText} (${data.message})`);

    return data;
  } catch (err) {
    throw err;
  }
};

export const sendJSON = async function (url, uploadData) {
  try {
    const sendOptions = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    };

    const fetchPro = fetch(url, sendOptions);

    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await response.json();
    if (!response.ok)
      throw new Error(`${response.statusText} (${data.message})`);

    return data;
  } catch (err) {
    throw err;
  }
};

export const resetHash = function () {
  if (!window.location.hash) return;
  window.location.hash = '';
};

export const changeIdUrl = function (id) {
  window.history.pushState(null, '', `#${id}`);
};

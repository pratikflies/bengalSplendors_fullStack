/* elsint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login.js';
import { signup } from './signup.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

//DELEGATION

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  document.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    login(email, password);
  });
}
if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm) {
  document.querySelector('.btn--save').addEventListener('click', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  document
    .querySelector('.btn--password')
    .addEventListener('click', async (e) => {
      e.preventDefault();
      document.querySelector('.btn--password').textContent =
        'Updating Password';
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );

      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
      document.querySelector('.btn--password').textContent = 'Save Password';
    });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (signupForm) {
  document.querySelector('.btn-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.btn-signup').textContent =
      'Signing Up Please Wait';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

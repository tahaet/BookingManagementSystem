/* eslint-disable */
//import 'core-js/stable';
// import { displayMap } from './mapbox.js';
import { login, logout } from './login.js';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe.js';
import { signup } from './signup.js';
// DOM ELEMENTS
// const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.signup-form');
// DELEGATION
// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);
//   displayMap(locations);
// }

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    const photoInput = document.getElementById('photo');

    if (photoInput.files[0]) {
      form.append('photo', photoInput.files[0]);
    } else {
      console.log('No file selected');
    }

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'processing...';
    bookTour(e.target.dataset.tourId);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    await signup(name, email, password, passwordConfirm);
  });
}

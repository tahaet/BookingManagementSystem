/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set the Content-Type
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    if (res.ok) {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const logout = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/logout', {
      method: 'GET',
    });
    console.log(res);
    if (res.ok) location.assign('/login');
  } catch (err) {
    console.log(err.message);
    showAlert('error', 'Error logging out! Try again.');
  }
};

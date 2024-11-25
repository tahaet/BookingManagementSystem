import { showAlert } from './alerts.js';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set the Content-Type
      },
      body: JSON.stringify({
        name,
        email,
        password,
        passwordConfirm,
      }),
    });

    if (res.ok) {
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        location.assign('/'); // Redirect to home or dashboard
      }, 1500);
    } else {
      const data = await res.json();
      showAlert(
        'error',
        data.message || 'Something went wrong. Please try again.',
      );
    }
  } catch (err) {
    showAlert(
      'error',
      err.message || 'An error occurred. Please try again later.',
    );
  }
};

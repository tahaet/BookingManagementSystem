/* eslint-disable */
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/changePassword'
        : 'http://localhost:3000/api/v1/users/updateMe';

    const res = await fetch(url, {
      method: 'PATCH',
      //problem was here due to JSON.stringify() and setting header
      body: data,
    });
    if (res.ok) {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

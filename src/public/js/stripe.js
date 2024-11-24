/*eslint-disable*/
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51QOTBVGugdTeA3IV44fIbSKl3v1rX5oULaBu6bzsDiSbIGDNglLWT2I0fl0nUcj2CbhwmhJ6rruXy8lVdXvskJG1005jCgblvp',
);

export const bookTour = async (tourId) => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    const session = await res.json();
    stripe.redirectToCheckout({ sessionId: session.data.id });
  } catch (err) {
    showAlert('error', err);
  }
};

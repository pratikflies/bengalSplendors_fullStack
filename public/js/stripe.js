/* eslint-disable */
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alerts.js';
export const bookTour = async (tourId) => {
  //1) Get checkout session from API
  try {
    const stripe = await loadStripe(
      'pk_test_51NXTRMSBAFmVUQWneRkNvp6iDb9xK25y9RtB3ROjdsHBl03AZxO8fulh957fN5Ia0SPS1MDDVBiI2ML5K61auW1U00ShfeXM62'
    );
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    });

    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }

  //2) Create checkout form + charge credit card
};

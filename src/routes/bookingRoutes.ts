import express from 'express';
import authController from '../controllers/authController';
import bookingController from '../controllers/bookingController';
import SD from '../utils/SD';
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo(SD.roleAdmin, SD.roleGuide));

router
  .route('/')
  .get(bookingController.setTourBookingIds, bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

export default router;

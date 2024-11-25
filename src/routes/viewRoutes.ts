import express from 'express';
import viewController from '../controllers/viewController';
import authController from '../controllers/authController';
import bookingController from '../controllers/bookingController';

const router = express.Router();
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.overview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/signup', viewController.getSignup);
router.get(
  '/me',
  authController.isLoggedIn,
  authController.protect,
  viewController.getAccount,
);
router.get('/my-tours', authController.protect, viewController.getMyTours);
export default router;

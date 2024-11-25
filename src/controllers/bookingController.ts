import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Tour from '../models/tourModel';
import Stripe from 'stripe';
import Booking from '../models/bookingModel';
import factoryController from './factoryController';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const setTourBookingIds = (req: any, res: Response, next: NextFunction) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // if (!req.body.user) req.body.user = req.user.id;
  next();
};
const getCheckoutSession = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.tourId);
    // console.log(tour);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour?.name} Tour`, // Name of the product
              description: tour?.summary,
              images: [`https://www.natours.dev/img/tours/${tour?.imageCover}`],
            },
            unit_amount: (tour?.price || 0) * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour?.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour?.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
    });

    res.status(200).json({
      status: 'success',
      data: session,
    });
  },
);

const createBookingCheckout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();
    console.log(await Booking.create({ tour, user, price }));
    res.redirect(req.originalUrl.split('?')[0]);
  },
);
const createBooking = factoryController.createModel(Booking);
const getBooking = factoryController.getModelById(Booking);
const getAllBookings = factoryController.getAll(Booking);
const updateBooking = factoryController.updateModel(Booking);
const deleteBooking = factoryController.deleteModel(Booking);

export default {
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
  setTourBookingIds,
};

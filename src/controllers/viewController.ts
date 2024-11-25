import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import Tour, { ITour } from '../models/tourModel';
import AppError from '../AppError';
import Booking from '../models/bookingModel';

const overview = catchAsync(async (req: Request, res: Response) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'Home', tours });
});

const getTour = catchAsync(async (req: any, res: Response) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'reviews rating',
  });
  if (!tour) throw new AppError('there is no tour with that id', 404);
  res.status(200).render('tour', { title: `${tour?.name}`, tour });
});
const getLogin = (req: Request, res: Response) => {
  res.status(200).render('login', { title: 'login' });
};
const getSignup = (req: Request, res: Response) => {
  res.status(200).render('signup', { title: 'sign up' });
};
const getAccount = (req: Request, res: Response) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

const getMyTours = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    let tours = await Booking.aggregate([
      {
        $lookup: {
          from: 'tours',
          localField: 'tour',
          foreignField: '_id',
          as: 'tours',
        },
      },
      {
        $unwind: '$tours',
      },
      {
        $replaceRoot: { newRoot: '$tours' },
      },
      // {
      //   $project: {
      //     _id: 0,
      //     tours: 1,
      //   },
      // },
    ]);
    // console.log(tours);
    res.status(200).render('overview', { title: 'My Tours', tours });
  },
);
export default {
  overview,
  getTour,
  getLogin,
  getAccount,
  getMyTours,
  getSignup,
};

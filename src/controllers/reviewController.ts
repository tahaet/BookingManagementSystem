import { Request, Response, NextFunction } from 'express';
import Review from '../models/reviewModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../AppError.js';
import APIFeatures from '../utils/APIFeatures.js';
import factoryController from './factoryController.js';

const setTourUserIds = (req: any, res: Response, next: NextFunction) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

const getAllReviews = factoryController.getAll(Review);
const getReviewById = factoryController.getModelById(Review);
const createReview = factoryController.createModel(Review);
const updateReview = factoryController.updateModel(Review);
const deleteReview = factoryController.deleteModel(Review);

export default {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
};

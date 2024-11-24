import { Model, Document } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Response, Request } from 'express';
import AppError from '../AppError';
import APIFeatures from '../utils/APIFeatures';

const deleteModel = <T>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      throw new AppError('No document associated with that id', 404);
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const updateModel = <T>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      throw new AppError('there is no document associated with that id', 404);
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

const createModel = <T>(Model: Model<T>) =>
  catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
const getModelById = <T>(Model: Model<T>, popOptions?: any) =>
  catchAsync(async (req: any, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc)
      throw new AppError('there is no document associated with that id', 404);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
const getAll = <T>(Model: Model<T>) =>
  catchAsync(async (req: any, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .sort()
      .filter()
      .project()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
export default {
  deleteModel,
  updateModel,
  createModel,
  getModelById,
  getAll,
};

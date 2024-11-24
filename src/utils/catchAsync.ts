import { NextFunction, Request, Response } from 'express';
import AppError from '../AppError';

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: AppError) => next(err));
  };
};

export default catchAsync;

import express, { Request, Response, NextFunction } from 'express';
import userRouter from './routes/userRoutes.js';
import tourRouter from './routes/tourRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import viewRouter from './routes/viewRoutes.js';
import errorController from './controllers/errorController.js';
import morgan from 'morgan';
import AppError from './AppError.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet, { contentSecurityPolicy } from 'helmet';
import hpp from 'hpp';
// @ts-ignore
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(helmet({ contentSecurityPolicy: false }));
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after an hour',
});
app.use(cors());

app.options('*', cors());
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ['duration'],
  }),
);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);
app.use(compression());
// app.use('/api/v1/tests', (req: Request, res: Response) => {
//   res.status(200).send('Test endpoint');
// });

app.all('*', (err: any, req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController.globalErrorHandler);
export default app;

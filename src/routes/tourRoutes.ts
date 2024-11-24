import express from 'express';
import tourController from '../controllers/tourController.js';
import authController from '../controllers/authController.js';
import SD from '../utils/SD.js';
import reviewRoutes from './reviewRoutes.js';
import reviewController from '../controllers/reviewController.js';
import bookingRoutes from './bookingRoutes.js';
const router = express.Router();
// router.param(
//   'id',
//   (req: Request, res: Response, next: NextFunction, val: any) => {
//     console.log(`param middleware get hit with value =${val}`);
//     next();
//   }
// );
router.route('/tours-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo(SD.roleAdmin, SD.roleTourLead),
    tourController.getMonthlyPlan,
  );
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo(SD.roleAdmin, SD.roleTourLead),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo(SD.roleAdmin, SD.roleTourLead),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo(SD.roleAdmin, SD.roleTourLead),
    tourController.deleteTour,
  );
router.use('/:tourId/reviews', reviewRoutes);
router.use('/:tourId/bookings', bookingRoutes);
export default router;

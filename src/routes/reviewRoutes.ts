import express from 'express';
import authController from '../controllers/authController';
import reviewController from '../controllers/reviewController';
import SD from '../utils/SD';

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(
    authController.protect,
    reviewController.setTourUserIds,
    reviewController.getAllReviews,
  )
  .post(
    authController.restrictTo(SD.roleUser),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );
router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo(SD.roleUser, SD.roleAdmin),

    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo(SD.roleUser, SD.roleAdmin),
    reviewController.deleteReview,
  );

export default router;

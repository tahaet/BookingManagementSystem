import mongoose, { Model, model, Query, Schema } from 'mongoose';
import Tour from './tourModel';

export interface IReview {
  review: string;
  rating: number;
  createdAt: Date;
  user: mongoose.Schema.Types.ObjectId;
  tour: mongoose.Schema.Types.ObjectId;
}
interface ReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: mongoose.Schema.Types.ObjectId): Promise<void>;
}
const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
    },
    rating: {
      type: Number,
      required: [true, "rating can't be empty"],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to one user'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must be on one tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.pre<Query<IReview, IReview>>(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});
reviewSchema.statics.calcAverageRatings = async function (
  tourId: mongoose.Schema.Types.ObjectId,
) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};

reviewSchema.post<IReview>(/^findOneAnd/, async function (doc) {
  if (doc) {
    const ReviewModel = doc.constructor as ReviewModel;

    await ReviewModel.calcAverageRatings(doc.tour);
  }
});

reviewSchema.post<IReview>('save', async function () {
  await (this.constructor as ReviewModel).calcAverageRatings(this.tour);
});
const Review: Model<IReview> = model<IReview>('Review', reviewSchema);
export default Review;

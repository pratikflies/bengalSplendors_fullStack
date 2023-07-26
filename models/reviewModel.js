// review / rating /createdAt // ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./tourModel.js');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    //child referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      reqired: [true, 'Review must belong to a user!'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//this means that each combination of tour and user must be unique
//to ensure only review for one user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//calculating average ratings using aggregation pipeline
//statics methods are available on schemas
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

//query middleware for calculation of review statistics when a review is updated (Update or Delete)
reviewSchema.post(/^findOneAnd/, async function (doc) {
  //We calculate average ratings using post middleware so that we have updated values after the document has been saved
  //In post query middleware, we get "docs" parameter which is
  // nothing but the executed document. Since we have the document,
  //we can use constructor on that to get the model ie docs.constructor .
  // Now since we have model, we know that we can directly call statics method on that.
  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const APIFeatures = require('./../utils/apiFeatures.js');
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID!', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //to check automatically if the data type sent by the user is correct
    });
    if (!doc) {
      return next(new AppError('No Document found with that ID!', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No Document found with that ID!', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews in tour(hack)
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain(); // to get stats of executon
    const doc = await features.query;
    //query.sort().select().limit().skip();............
    //SENDING RESPONSE

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

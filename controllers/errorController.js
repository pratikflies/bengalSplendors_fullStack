const AppError = require('./../utils/appError.js');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const dupField = Object.keys(err.keyValue)[0];
  console.log(dupField);
  const message = `Duplicate field value: ${dupField}:${err.keyValue[dupField]}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data!${errors.join('.')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);
const sendErrorDev = (err, req, res) => {
  //FOR API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //RENDERED WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //FOR API

    //OPERATIONAL,TRUSTED ERROR: SEND MESSAGE TO CLIENT
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      //PROGRAMMING OR OTHER UNKNOWN ERROR:DON'T LEAK ERROR DETAILS
    }
    //1) log error
    console.log('ERROR!!!!!', err);

    //SEND GENERIC ERROR MESSAGE
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  //FOR RENDERING WEBSITE

  //OPERATIONAL,TRUSTED ERROR: SEND MESSAGE TO CLIENT
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
    //PROGRAMMING OR OTHER UNKNOWN ERROR:DON'T LEAK ERROR DETAILS
  }
  //1) log error
  console.log('ERROR!!!!!', err);

  //SEND GENERIC ERROR MESSAGE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { name: err.name, ...err, message: err.message };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};

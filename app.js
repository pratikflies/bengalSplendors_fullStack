const path = require('path');
const exp = require('constants');

const express = require('express');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const AppError = require('./utils/appError.js');

const hpp = require('hpp'); //for preventing parameter polltion

const globalErrorHandler = require('./controllers/errorController.js');

const tourRouter = require('./routes/tourRoutes.js');

const userRouter = require('./routes/userRoutes.js');
const cors = require('cors');
const reviewRouter = require('./routes/reviewRoutes.js');
const bookingRouter = require('./routes/bookingRoutes.js');
const viewRouter = require('./routes/viewRoutes.js');
const cookieParser = require('cookie-parser');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL middlewares

//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
//SET SECURITY HTTP HEADERS
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      baseUri: ["'self'"],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrc: ["'self'", 'https://*.stripe.com'],

      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

      frameSrc: ["'self'", 'https://*.stripe.com'],

      objectSrc: ["'none'"],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      workerSrc: ["'self'", 'data:', 'blob:'],

      childSrc: ["'self'", 'blob:'],

      imgSrc: ["'self'", 'data:', 'blob:'],

      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

      upgradeInsecureRequests: [],
    },
  })
);
app.use(cors());

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') app.use(morgan('dev')); //for logging

//LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour!',
});

app.use('/api', limiter);

//BODY PARSER,DATA FROM BODY INTO req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(cookieParser());
//DATA SANITISATION AGAINST NoSQL quert INJECTION
app.use(mongoSanitize());
//DATA SANITISATION AGAINST XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//EXAMPLES OF MIDDLEWARES
// app.use((req, res, next) => {
//   // console.log('Hello from middleware!');
//   next();
// });

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//SERVER
//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
//HANDLING ROUTES THAT HAVE NOT BEEN DEFINED IN OUR API
app.all('*', function (req, res, next) {
  //OLD WAY OF HANDLING AN ERROR
  //   res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on this server`,
  //   });
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //REFACTORED WAY OF HANDLING ERRORS

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
//HANDLING ERRORS GLOBALLY
// app.use((err, req, res, next) => {
//   // console.log(err.stack);
//   err.statusCode = err.statusCode || 500; //500 means internal server error
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });
app.use(globalErrorHandler);
module.exports = app;

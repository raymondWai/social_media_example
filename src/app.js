const express = require('express'),
  swaggerJsdoc = require('swagger-jsdoc'),
  swaggerUi = require('swagger-ui-express'),
  bodyParser = require('body-parser');
const log4js = require('log4js');
const cors = require('cors');

log4js.configure({
  appenders: {
    root: {
      type: 'console',
    },
  },
  categories: {
    default: {
      appenders: ['root'],
      level:
        process.env.NODE_ENV == 'testing'
          ? 'fatal'
          : process.env.ENV === 'dev'
          ? 'debug'
          : 'error',
    },
  },
  globalLogLevel:
    process.env.NODE_ENV == 'testing'
      ? 'fatal'
      : process.env.ENV === 'dev'
      ? 'debug'
      : 'error',
});
const logger = log4js.getLogger('/');
const rootRouter = require('./routes');

const app = express();
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Speer Social Network API with Swagger',
      version: '0.1.0',
      description:
        'This is a social network application which similar with Twitter',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Raymond Wai',
        url: 'https://github.com/raymondWai',
        email: 'waimanho2765galois@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./src/routes/user.js'],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);
app.use(bodyParser.json());
app.use(
  cors({
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use('/api', rootRouter);
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  } else {
    logger.error(err.stack);
    res.status(400).send({
      message: err.message,
    });
  }
});
module.exports = app;

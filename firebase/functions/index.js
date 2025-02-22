const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { routesConfig } = require('./users/routes-config');

dotenv.config();

admin.initializeApp();

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://projekt-inwentarza.web.app',
      'https://projekt-inwentarza.firebaseapp.com',
    ],
  })
);
routesConfig(app);

module.exports = { api: functions.https.onRequest(app) };

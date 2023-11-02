const utils = require('../index')
const config = require('dotenv').config().parsed
utils.cdn['getTest']({config})
const utils = require('../index')
const path = require('path')

const cdn = utils.getAction('cdn', path.join(__dirname,'../.env'))
cdn.getTest()
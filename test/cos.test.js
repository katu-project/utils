const utils = require('../index')
const path = require('path')

const cos = utils.getAction('cos', path.join(__dirname,'../.env'))
cos.getTest()
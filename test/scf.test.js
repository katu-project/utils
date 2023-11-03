// @ts-nocheck
const utils = require('../src/index')
const config = require('dotenv').config().parsed
const commonConfig = {config, namespace:'katu'}
utils.scf.getFuncList(commonConfig)
.then(list=>{
    console.table(list.map(e=>{
        return [
            e.FunctionId,
            e.FunctionName,
            e.Description
        ]
    }))
})
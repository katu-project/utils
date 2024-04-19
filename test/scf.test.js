// @ts-nocheck
const utils = require('../src/index')
const config = require('dotenv').config().parsed
const commonConfig = {config, namespace:'default'}
const persistentInstanceConfig = {
    config: Object.assign({}, config, {
        Region: config.PersistentInstanceFunctionRegion,
    }),
    namespace: config.PersistentInstanceFunctionNamespace
}

const testFucntion = process.argv[2]

if(testFucntion === 'startPersistentInstance'){
    utils.scf.startPersistentInstance(config.PersistentInstanceFunction, persistentInstanceConfig)
}

if(testFucntion === 'cancelPersistentInstance'){
    utils.scf.cancelPersistentInstance(config.PersistentInstanceFunction, persistentInstanceConfig)
}

if(!testFucntion){
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
}
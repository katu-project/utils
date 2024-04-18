const tencentcloud = require('tencentcloud-sdk-nodejs');
const ScfClient = tencentcloud.scf.v20180416.Client
const utils = require('uni-utils')

function getClient(config){
    config = {
        credential: {
            secretId: config.SecretId,
            secretKey: config.SecretKey
        },
        region: config.Region
    };
    if(!config.region || !config.credential.secretId || !config.credential.secretKey ) throw Error('no SecretID/Key or region set')
    return new ScfClient(config)
}
exports.getClient = getClient

const waitFunctionActive = exports.waitFunctionActive = async (name, version, options)=>{
    const waitCount = 3
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)

    for (let index = 0; index < waitCount; index++) {
        await utils.sleep(3000)
        const functionDetail = await client.GetFunction({
            Namespace: namespace,
            FunctionName: name,
            Qualifier: version || '$LATEST'
        })
        if(functionDetail.Status === 'Active'){
            return functionDetail
        }
    }
    throw Error('wait timeout')
}

exports.getFuncList = async function(options){
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)
    return client.ListFunctions({
        Namespace: namespace
    }).then(res=>res.Functions)
}

exports.getFunc = async function(name, options){
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)
    const funcInfo = await client.GetFunction({
        Namespace: namespace,
        FunctionName: name
    })
    const { Triggers } = await client.ListTriggers({
        Namespace: namespace,
        FunctionName: name
    })
    return {
        detail: funcInfo,
        url: Triggers
    }
}

exports.getLayer = async function(name, options){
  const { config={},  } = options || {}
  const client = getClient(config)
  const layerInfo = await client.ListLayers({
    SearchKey: name
  })
  return layerInfo.Layers.length === 1 && layerInfo.Layers[0].LayerName === name ? layerInfo.Layers[0] : layerInfo.Layers
}

exports.getLayerVersion = async function(name, ver, options){
  const { config={},  } = options || {}
  const client = getClient(config)
  const layerInfo = await client.GetLayerVersion({
      LayerName: name,
      LayerVersion: ver
  })
  return layerInfo
}

exports.deleteLayerVersion = async function(name, ver, options){
  const { config={} } = options || {}
  const client = getClient(config)
  const layerInfo = await client.DeleteLayerVersion({
      LayerName: name,
      LayerVersion: ver
  })
  return layerInfo
}

exports.createLayerVersionFromCos = async function(name, layer, options){
  const { config={} } = options || {}
  const client = getClient(config)
  const layerInfo = await client.PublishLayerVersion({
      LayerName: name,
      CompatibleRuntimes: layer.runtime || ['Nodejs18.15', 'Nodejs16.13'],
      Content: {
        CosBucketName: layer.cosBucket,
        CosObjectName: layer.cosObject,
        CosBucketRegion: layer.cosRegion
      },
      Description: layer.desc || ''
  })
  return layerInfo.LayerVersion
}

exports.updateCodeByCos = async function(name, cos, options){
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)
    return client.UpdateFunctionCode({
        Namespace: namespace,
        FunctionName: name,
        CodeSource: 'Cos',
        CosBucketName: cos.name,
        CosBucketRegion: cos.region,
        CosObjectName: cos.filename,
    })
}

exports.deleteFunc = async function(name, options){
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)
    return client.DeleteFunction({
        Namespace: namespace,
        FunctionName: name
    })
}

exports.updateFuncEnv = async function(name, env, options){
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)
    return client.UpdateFunctionConfiguration({
        Namespace: namespace,
        FunctionName: name,
        Environment: {
            Variables: env
        }
    })
}

exports.updateFuncLayerConfig = async function(name, layerConfig, options){
  const { config={}, namespace='' } = options || {}
  const client = getClient(config)
  return client.UpdateFunctionConfiguration({
      Namespace: namespace,
      FunctionName: name,
      Layers: [
        layerConfig
      ]
  })
}

exports.startPersistentInstance = async function(name, options){
    const VersionToken = 'persistent'
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)
    const newVersion = await client.PublishVersion({
        Namespace: namespace,
        FunctionName: name,
        Description: VersionToken
    })
    console.log('1. 发布长驻版本:',newVersion.Description,newVersion.FunctionVersion)
    const version = newVersion.FunctionVersion
    await waitFunctionActive(name, version, options)
 
    client.UpdateAlias({
        Namespace: namespace,
        FunctionName: name,
        Name: '$DEFAULT',
        FunctionVersion: '$LATEST',
        RoutingConfig: {
            AdditionalVersionWeights: [
                {
                    Version: version,
                    Weight: 1.0
                }
            ]
        }
    })
    await waitFunctionActive(name, version, options)
    console.log('2. 把流量转移到长驻版本:',newVersion.Description,newVersion.FunctionVersion)

    await client.PutProvisionedConcurrencyConfig({
        Namespace: namespace,
        FunctionName: name,
        Qualifier: version,
        VersionProvisionedConcurrencyNum: 1
    })
    console.log('3. 激活长驻版本实例:',newVersion.Description,newVersion.FunctionVersion)
}


exports.cancelPersistentInstance = async function(name, options){
    const VersionToken = 'persistent'
    const { config={}, namespace='' } = options || {}
    const client = getClient(config)
    await client.UpdateAlias({
        Namespace: namespace,
        FunctionName: name,
        Name: '$DEFAULT',
        FunctionVersion: '$LATEST'
    })
    await waitFunctionActive(name, '$LATEST', options)

    const listVersion = await client.ListVersionByFunction({
        Namespace: namespace,
        FunctionName: name  
    })
    for (const v of listVersion.Versions) {
        if(v.Description === VersionToken){
            const version = v.Version
            console.log('删除存在的长驻实例版本',version)  
            await client.DeleteFunction({
                Namespace: namespace,
                FunctionName: name,
                Qualifier: version
            })
            await waitFunctionActive(name, null, options)
        }
    }
}
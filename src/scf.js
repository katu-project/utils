const tencentcloud = require('tencentcloud-sdk-nodejs');
const ScfClient = tencentcloud.scf.v20180416.Client

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

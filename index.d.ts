import { Client as ScfClient } from 'tencentcloud-sdk-nodejs/tencentcloud/services/scf/v20180416/scf_client'

type CloudConfig = {
    SecretId: string
    SecretKey: string
    Region?: string
    Bucket?: string
}
type CloudOptions = {
    config?: CloudConfig
}

type UpdateFuncEnvConfig = {
  Key?: string
  Value?: string
}[]

type UpdateFuncLayerConfig = {
  LayerName: string,
  LayerVersion: number
}

declare namespace utils {
    namespace cos {
        function getList<T>(dir:string, options:CloudOptions): Promise<T[]>
        function deleteFile<T>(filepath:string, options:CloudOptions): Promise<T>
        function deleteDir<T>(dir:string, options:CloudOptions): Promise<T>
        function uploadFolder<T>(localFolder:string, remotePrefix:string, options:CloudOptions): Promise<T>
        function uploadFile<T>(localPath:string, remotePath:string, options:CloudOptions): Promise<T>
        function createCompressTask<T>(
            compressDir: string,
            options: {
                config: CloudConfig
                compressConfig: {
                    Flatten?: string
                    Format?: string
                    Type?: string
                    CompressKey?: string
                    UrlList?: string
                    Prefix?: string
                    Key?: string[]
                    IgnoreError?: string
                }
                outputConfig: {
                    Bucket?: string
                    Region?: string
                    Object: string
                }
            }
        ): Promise<T>
    }
    namespace cdn {
        function refreshDirs<T>(name:string[], options?:CloudOptions): Promise<T>
        function getDomainList(options?:CloudOptions): Promise<any>
    }
    namespace scf {  
      function getClient(config:CloudConfig): ScfClient
      function getFuncList(options?:CloudOptions): Promise<any[]>
      function getFunc(name:string, options?:CloudOptions): Promise<any>
      function getLayer(name:string, options?:CloudOptions)
      function getLayerVersion(name:string, ver:number, options?:CloudOptions)
      function deleteLayerVersion(name:string, ver:number, options?:CloudOptions)
      function createLayerVersionFromCos(name:string, layer: {
        runtime: string[]
        cosBucket: string
        cosObject: string
        cosRegion: string
        desc: string
      }, options?:CloudOptions):Promise<number>
      function updateCodeByCos(name:string, cos:{
        name: string
        region: string
        filename: string
      },options?:CloudOptions)
      function deleteFunc(name:string, options?:CloudOptions)
      function updateFuncEnv(name:string, env: UpdateFuncEnvConfig, options?:CloudOptions)
      function updateFuncLayerConfig(name:string, layerConfig:UpdateFuncLayerConfig, options?:CloudOptions)
      function waitFunctionActive(name:string, version:string, options?:CloudOptions)
      function startPersistentInstance(name:string, options?:CloudOptions)
      function cancelPersistentInstance(name:string, options?:CloudOptions)
    }
}

export = utils
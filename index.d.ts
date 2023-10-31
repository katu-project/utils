type cdn = {
    refreshDirs(name:string): any
}

type cos = {
    uploadFolder(localFolder:string, remotePrefix:string): any
}

type csf = {
}

interface IActions {
    cdn: cdn,
    cos: cos
    csf: csf
}

export function getAction<T extends keyof IActions>(name: T, configPath?:string): IActions[T]
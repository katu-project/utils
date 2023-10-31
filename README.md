## 卡兔项目 utils 库

### Usage
1. 安装
```
npm i -D @katucloud/utils
```
1. 加载
```
const utils = require('@katucloud/utils')
const cdn = utils.getAction('cdn')
```

1. cdn 刷新
```
utils.cdn.refreshDirs(dirs)
```

2. cos 上传
```
utils.cos.push(localDirs, remotePrefix)
```
## yapi-plugin-import-postman2

支持导入 Postman Collection V2 的 json 数据，生成接口文档

效果如下：

![](https://user-gold-cdn.xitu.io/2020/4/30/171c908a4f52af2d?w=745&h=418&f=png&s=32397)

### 安装插件

安装 `ykit`（已安装请忽略）

```
npm install -g ykit
```

安装 `yapi-cli`（已安装请忽略）

```
npm install -g yapi-cli --registry https://registry.npm.taobao.org
```

安装插件

```
yapi plugin --name yapi-plugin-import-postman2
```

使用 `yapi plugin` 命令会自动在 config.json 添加

```json
   "plugins": [
      {
         "name": "import-postman2"
      }
   ]
```

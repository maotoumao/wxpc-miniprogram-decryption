## Overview
pc端微信小程序包wxapkg文件解密，nodejs版本。

## 原理
pc端小程序是被加密过的，所以打开看到的是一堆乱码，需要解密之后才可以看到正确的内容。  

原理及go语言版本参考：https://github.com/BlackTrace/pc_wxapkg_decrypt

## 使用方法
``` javascript
    node wxmd.js decry <微信小程序id> <wxapkg包的路径> [解密包的输出路径(可不填)] 
```
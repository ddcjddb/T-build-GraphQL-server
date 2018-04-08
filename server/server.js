//import   需要转义，require是es5写法 不需要babel,暂时不会配置
// import express from "express";
//node运行需要相对完全路径至具体文件

const express = require("express");
const expressGraphQL = require("express-graphql");
const schema = require("./schema.js");

const app = express();

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    //boolean, 让我们能够用graphql的IDE来测试
    graphql: true
  })
);
//graphql  运行在port4000    json 运行在port 3000
app.listen(4000, () => {
  console.log("Server is running on localhost:4000..");
});

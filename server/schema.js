const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");
const axios = require("axios");

//Hardcoded data
// const customers = [
//   //值的类型一定要对上customertype的对应类型
//   { id: "1", name: "John Doe", email: "john@gmail.com", age: 35 },
//   { id: "2", name: "Steve Smith", email: "steve@gmail.com", age: 25 },
//   { id: "3", name: "Sara Williams", email: "sara@gmail.com", age: 32 }
// ];

//CustomerType
const CustomerType = new GraphQLObjectType({
  name: "Customer",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt }
  })
});

//Root Query
const RootQuery = new GraphQLObjectType({
  //all object type need a name
  name: "RootQueryType",
  fields: {
    //自定义对象名
    customer: {
      type: CustomerType,
      args: {
        //通过id匹配customer
        id: { type: GraphQLString }
      },
      //chrome graphql插件中
      // {
      //   customers(key:"value"){
      //     key
      //   }
      // }
      resolve(parentValue, args) {
        //for loop 同步操作时查看
        // for (let i = 0; i < customers.length; i++) {
        //   if (customers[i].id == args.id) {
        //     return customers[i];
        //   }
        // }

        //异步axios json-server 监听data.json(直接针对文件名，不需要路径)  并运行在port3000
        //http://localsost:3000/customers/  显示data中customers所有数据
        //http://localsost:3000/customers/id(id是customers中的子对象的id)
        //+args.id 是字符串拼接，在graphql中传入的（id：“num”）
        //axios 返回一个promise，所以可以链式调用then方法
        return (
          axios
            .get("http://localhost:3000/customers/" + args.id)
            //res.data 是json格式   返回的promise就是{json}
            .then(res => res.data)
        );
      }
    },
    //chrome graphql插件中
    // {
    //    customers{
    //      key
    //    }
    // }
    customers: {
      type: new GraphQLList(CustomerType),
      resolve(parentValue, args) {
        //同步请求
        //return customers;

        //异步请求
        return axios
          .get("http://localhost:3000/customers")
          .then(res => res.data);
      }
    }
  }
});

//Mutation
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    //chrome graphql插件中
    //   mutation{
    //     addCustomer(name:"Herry White", email:"herry@gmail.com",age:41){
    //       id,
    //       name,
    //       email,
    //       age
    //     }
    //   }
    addCustomer: {
      type: CustomerType,
      args: {
        //NonNull 保证添加的customer非空
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parentValue, args) {
        //研究下有没有同步方法？
        //异步的 数据发送至port3000  通过json-server连接至data.json
        return (
          axios
            .post("http://localhost:3000/customers", {
              name: args.name,
              email: args.email,
              age: args.age
            })
            //post 过去也是个promise？then 怎么解释？
            .then(res => res.data)
        );
      }
    },
    //chrome graphql插件中
    // mutation{
    //     deleteCustomer(id:"3"){
    //       id
    //     }
    //   }
    deleteCustomer: {
      type: CustomerType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, args) {
        return axios
          .delete("http://localhost:3000/customers/" + args.id)
          .then(res => res.data);
        //删除是因为axios.delete  请求头删除
      }
    },
    //chrome graphql插件中
    // mutation{
    //     editCustomer(id:"3",age:100){  //需要改什么就写什么属性
    //       id                 //内部至少需要一个属性（随意，能识别即可），不能为空
    //     }
    //   }
    editCustomer: {
      type: CustomerType,
      args: {
        //name,email,age 三者不需要GraphQLNonNull，如果不填写则对原对象不进行修稿==修改
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        age: { type: GraphQLInt }
      },
      resolve(parentValue, args) {
        return (
          axios
            //patch是进行修改覆盖   直接传入args 理解为类似react 的setState 有则改，无则不变
            .patch("http://localhost:3000/customers/" + args.id, args)
            .then(res => res.data)
        );
      }
    }
  }
});

module.exports = new GraphQLSchema({
  //RootQuery，必须设置好参数，不然server.js里的schema就会报错undefined
  query: RootQuery,
  //新方法需要加入到exports中
  mutation
});

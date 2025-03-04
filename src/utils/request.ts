 // 对于axios函数库进行二次封装
 import axios from 'axios';
 //利用axios.create方法创建一个axios实例:可以设置基础路径、超时的时间的设置
 //日的1:利用axios请求、响应拦截器功能
 //目的2:请求拦截器,一般可以在请求头中携带公共的参数:token
 //目的3:响应拦截器,可以简化服务器返回的数据,处理http网络错误
 const request = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,//求的基础路径的设置
     timeout: 5000//时的时间的设置,超出五秒请求就是失败的
 });
 // 请求拦截器
 request.interceptors.request.use((config)=>{
     return config;
 });
 // 响应拦截器
 request.interceptors.response.use((response)=>{
     // 响应拦截成功的回调，一般会进行简化数据
     return response.data;
 },(error)=>{
     // 处理网络错误
     let status = error.response.status;
     switch(status){
         case 404:
             
             break;
         case 503|501|502|503|504|505:
             
             break;
         case 402:
             
             break;
     }
     return Promise.reject(new Error(error.message));
 });
 export default request;
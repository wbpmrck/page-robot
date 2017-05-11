/** http接口调用辅助
 * Created by kaicui on 17/5/11.
 */

var config = require("config");
const logger = require('../log/logger');
const path = require("path");
const request = require("request-promise-native");

//去除prefix配置中的http://
let prefix = config.httpInterface.prefix;
prefix = prefix.split("//");
if(prefix.length>1){
    prefix = prefix[1]
}else{
    prefix = prefix[0];
}

module.exports={
    async post(url,formData){
        logger.debug(`http post:${url}`);
        try{
            url = `http://${path.join(prefix,url)}`;
            let ret = await request.post(url, {form:formData});
            return {resp:JSON.parse(ret),err:undefined};
        }catch (e){
            return{resp:undefined,err:e}
        }
    },
    async get(url){
        logger.debug(`http get:${url}`);
        try{
            url = `http://${path.join(prefix,url)}`;
            let ret = await request.get(url);
            return {resp:JSON.parse(ret),err:undefined};
        }catch (e){
            return{resp:undefined,err:e}
        }
    }
}

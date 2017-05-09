/** 活动相关业务操作
 * Created by kaicui on 17/5/5.
 */


const logger = require('../../log/logger');

module.exports={
  async beginActivity({activityId,pluginType,phoneNumber}){
      logger.debug(`准备调用:beginActivity`);
    
      logger.debug(`模拟调用接口之后，返回活动参加记录id`);
      // todo:这里先用延迟模拟调用http业务接口，后续改为调用道富的接口
      let  result = await new Promise((resolve,reject)=>{
          logger.debug(`模拟接口发出...3s返回`);
          setTimeout(()=>{
              var id = (+new Date()).toString();
              logger.debug(`生成id:${id}`);
              resolve({
                  returnCode:"0000",
                  data:id
              })
          },3000)
      }) ;
      logger.debug(`result =${JSON.stringify(result)}`);
      return result.data;
  }
};



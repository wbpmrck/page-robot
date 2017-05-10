/** 验证码相关业务操作
 * Created by kaicui on 17/5/5.
 */


const logger = require('../../log/logger');

module.exports={
  async newValidateCodeRecord({activityId,activityRecordId,base64}){
      logger.debug(`准备调用:newValidateCode`);
    
      logger.debug(`模拟调用接口之后，返回打码记录id`);
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
  },
    /**
     * 业务接口，记录验证码识别结果
     * @param vcodeId：验证码Id
     * @param vresult:识别成功(bool)
     * @returns {Promise.<*>}
     */
  async saveValidateResult({vcodeId,vresult}){
      logger.debug(`准备调用:saveValidateResult，vcodeId=${vcodeId},vresult=${vresult}`);
    
      // todo:后续改为调用道富的接口
      let  result = await new Promise((resolve,reject)=>{
          logger.debug(`模拟接口发出...3s返回`);
          setTimeout(()=>{
              resolve({
                  code:"0000"
              })
          },3000)
      }) ;
      return result;
  }
};



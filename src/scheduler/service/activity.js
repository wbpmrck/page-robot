/** 活动相关业务操作
 * Created by kaicui on 17/5/5.
 */


const logger = require('../../log/logger');
var http = require("../../framework/httpHelper");
var recordStatus = require("../../consts/activityRecordStatus");


module.exports={
  async beginActivity({activityRecordId,activityId,pluginType,phoneNumber}){
    
      //:这里先用延迟模拟调用http业务接口，后续改为调用道富的接口
      // let  result = await new Promise((resolve,reject)=>{
      //     logger.debug(`模拟接口发出...3s返回`);
      //     setTimeout(()=>{
      //         var id = (+new Date()).toString();
      //         logger.debug(`生成id:${id}`);
      //         resolve({
      //             returnCode:"0000",
      //             data:id
      //         })
      //     },3000)
      // }) ;
      
      let {resp,err} = await http.post("/part/active/update",{id:parseInt(activityRecordId),status:recordStatus.ORDERING,failReason:"",failDesc:""})
      return resp;
  },
  async endActivityRecord({activityRecordId,successFlag,failedReason,failedDesc}){
      // logger.debug(`准备调用:endActivityRecord`);
      //
      // logger.debug(`模拟调用接口`);
      // 后续改为调用道富的接口
      // let  result = await new Promise((resolve,reject)=>{
      //     logger.debug(`模拟接口发出...3s返回`);
      //     setTimeout(()=>{
      //         resolve({
      //             code:"0000"
      //         })
      //     },3000)
      // }) ;
    
      let {resp,err} = await http.post("/part/active/update",{id:parseInt(activityRecordId),status:successFlag?recordStatus.ORDER_SUCCESS:recordStatus.ORDER_FAILED,failReason:failedReason,failDesc:failedDesc})
      return resp;
  }
};



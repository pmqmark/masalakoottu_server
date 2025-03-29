const { default: axios } = require("axios");

const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === "production";

const base_url = isProduction ? process.env.lp_prod_base_url : process.env.lp_test_base_url;
const token = process.env.lp_access_token

const delhiveryApi = axios.create({
    baseURL: base_url,
    timeout: 5000,
})

delhiveryApi.interceptors.request.use(async (config) => {
    config.headers["Authorization"] = `Token ${token}`

    return config;
})

module.exports.getPincodeServicibility = async (pincode) => {
    const response = await delhiveryApi.get(`/c/api/pin-codes/json/?token=${token}&filter_codes=${pincode}`)


}


module.exports.calculateShippingCost = async (params) => {
    const { md, cgm, o_pin, d_pin, ss } = params
    
    const response = await delhiveryApi.get(`/api/kinko/v1/invoice/charges/.json?md=${md}&cgm=${cgm}&o_pin=${o_pin}&d_pin=${d_pin}&ss=${ss}`)


}
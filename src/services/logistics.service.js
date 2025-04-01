const { default: axios } = require("axios");
const { Order } = require("../models/order.model");

const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === "production";

const base_url = isProduction ? process.env.lp_prod_base_url : process.env.lp_test_base_url;
const token = process.env.lp_access_token

const pickup_location = {
    name: "Merchant Name",
    pin: "560001",
    city: "Bangalore",
    phone: "9876543210",
    address: "Merchant Address"
}

const delhiveryApi = axios.create({
    baseURL: base_url,
    timeout: 5000,
})

delhiveryApi.interceptors.request.use(async (config) => {
    config.headers["Authorization"] = `Token ${token}`

    return config;
})

// API Call Order
// 1️. Serviceability Check (to verify delivery availability)
// 2️. Create Shipment (to generate waybill)
// 3️. Generate Shipping Label (print & attach label)
// 4️. Schedule Pickup (courier picks up the package)
// 5️. Track Shipment (real-time updates)
// 6️. Delivery Confirmation (receive webhook notification)

module.exports.getPincodeServicibility = async (pincode) => {
    const response = await delhiveryApi.get(`/c/api/pin-codes/json/?token=${token}&filter_codes=${pincode}`)

    if (!response?.data) {
        throw new Error('Failed')
    }

    const deliveryCode = response?.data?.delivery_codes[0]
    const codAvailabilty = deliveryCode?.cod;
    const prepaidAvailabilty = deliveryCode?.pre_paid;

    if (codAvailabilty || prepaidAvailabilty) {
        return true;
    }

    return false;
}


module.exports.calculateShippingCost = async (params) => {
    const { md, cgm, o_pin, d_pin, ss } = params

    const response = await delhiveryApi.get(`/api/kinko/v1/invoice/charges/.json?md=${md}&cgm=${cgm}&o_pin=${o_pin}&d_pin=${d_pin}&ss=${ss}`)

    if (isNaN(response?.data?.Total_amount)) {
        throw new Error('Invalid Value')
    }

    return response?.data?.Total_amount;
}


module.exports.createAShipment = async (shipment) => {
    const dataObj = {
        pickup_location,
        shipments: [shipment]
    }

    const response = await delhiveryApi.post("/api/cmu/create.json", dataObj)

    return response.data
}

module.exports.updateAShipment = async (shipment) => {
    const dataObj = {
        pickup_location,
        shipments: [shipment]
    }

    const response = await delhiveryApi.post("/api/p/edit", dataObj)

    return response.data
}

module.exports.cancelAShipment = async () => {
    const response = await delhiveryApi.post("/api/p/edit", { cancellation: true })

    return response.data
}


module.exports.genShipLabel = async (waybill) => {
    const response = await delhiveryApi.get(`/api/p/packing_slip?wbns=${waybill}&pdf=true`)

    return response.data;
}

module.exports.schedulePickup = async (shipments) => {
    const dataObj = {
        pickup_location,
        shipments
    }

    const response = await delhiveryApi.post(`/fm/request/new/`, dataObj)

    return response.data
}

module.exports.trackShipStatus = async (waybill) => {
    const response = await delhiveryApi.get(`/api/v1/packages/json/?waybill=${waybill}&token=${token}`)

    return response.data;
}

// Service for Webhook Controller 
module.exports.deliveryConfirmation = async (waybill, delivered_on) => {
    await Order.findOneAndUpdate({ waybill }, {
        $set: {
            status: 'delivered',
            waybill,
            delivered_on
        }
    })
}
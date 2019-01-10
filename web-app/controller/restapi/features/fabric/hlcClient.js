/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';
let fs = require('fs');
let path = require('path');

let itemTable = null;
const svc = require('./Z2B_Services');
const financeCoID = 'easymoney@easymoneyinc.com';

// Bring Fabric SDK network class
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use
let walletDir = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric/_idwallet');
const wallet = new FileSystemWallet(walletDir);

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);


/**
 * get orders for buyer with ID =  _id
 * @param {express.req} req - the inbound request object from the client
 *  req.body.id - the id of the buyer making the request
 *  req.body.userID - the user id of the buyer in the identity table making this request
 *  req.body.secret - the pw of this user.
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} an array of assets
 * @function
 */
exports.getMyOrders = async function (req, res, next) {
    // connect to the network
    let method = 'getMyOrders';
    console.log(method+' req.body.userID is: '+req.body.userID );
    let allOrders = new Array();

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to contract
        const contract = await network.getContract('globalfinancing');

        // Get member state
        const responseMember = await contract.submitTransaction('GetState', req.body.userID);
        console.log('responseMember: ');
        console.log(JSON.parse(responseMember.toString()));
        let member = JSON.parse(JSON.parse(responseMember.toString()))

        // Get the orders for the member including their state
        for (let orderNo of member.orders) { 
            const response = await contract.submitTransaction('GetState', orderNo);
            console.log('response: ');
            console.log(JSON.parse(response.toString()));
            var _jsn = JSON.parse(JSON.parse(response.toString()));
            var _jsnItems = JSON.parse(_jsn.items);
            _jsn.items = _jsnItems;
            allOrders.push(_jsn);            
        }

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('getMyOrders Complete');
        await gateway.disconnect();
        res.send({'result': 'success', 'orders': allOrders});
        
    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.stack});
    } 
};


/**
 * return a json object built from the item table created by the autoload function
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * return {Array} an array of assets
 * @function
 */
exports.getItemTable = function (req, res, next)
{
    
    if (itemTable === null)
    {
        let newFile = path.join(path.dirname(require.main.filename),'startup','itemList.txt');
        itemTable = JSON.parse(fs.readFileSync(newFile));
    }
    res.send(itemTable);
};

/**
 * orderAction - act on an order for a buyer
 * @param {express.req} req - the inbound request object from the client
 * req.body.action - string with buyer requested action
 * buyer available actions are:
 * Pay  - approve payment for an order
 * Dispute - dispute an existing order. requires a reason
 * Purchase - submit created order to seller for execution
 * Cancel - cancel an existing order
 * req.body.participant - string with buyer id
 * req.body.orderNo - string with orderNo to be acted upon
 * req.body.reason - reason for dispute, required for dispute processing to proceed
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} an array of assets
 * @function
 */
exports.orderAction = async function (req, res, next) {
    let method = 'orderAction';
    console.log(method+' req.body.participant is: '+req.body.participant );
    
    if ((req.body.action === 'Dispute') && (typeof(req.body.reason) !== 'undefined') && (req.body.reason.length > 0) )
    {/*let reason = req.body.reason;*/}
    else {
        if ((req.body.action === 'Dispute') && ((typeof(req.body.reason) === 'undefined') || (req.body.reason.length <1) ))
            {res.send({'result': 'failed', 'error': 'no reason provided for dispute'});}
    }
    if (svc.m_connection === null) {svc.createMessageSocket();}

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('globalfinancing');


        // Get state of order
        const responseOrder = await contract.submitTransaction('GetState', req.body.orderNo);
        console.log('responseOrder: ');
        console.log(JSON.parse(responseOrder.toString()));
        let order = JSON.parse(JSON.parse(responseOrder.toString()));
        
        // Perform action on the order
        switch (req.body.action)
        {
        case 'Pay':
            console.log('Pay entered');
            const payResponse = await contract.submitTransaction('Pay', order.orderNumber, order.sellerId, financeCoID);
            console.log('payResponse: ');
            console.log(JSON.parse(payResponse.toString()));
            break;
        case 'Dispute':
            console.log('Dispute entered');
            const disputeResponse = await contract.submitTransaction('Dispute', order.orderNumber, order.buyerId, order.sellerId, financeCoId, req.body.reason);
            console.log('disputeResponse_response: ');
            console.log(JSON.parse(disputeResponse.toString()));            
            break;
        case 'Purchase':
            console.log('Purchase entered');
            const buyResponse = await contract.submitTransaction('Buy', order.orderNumber, order.buyerId, order.sellerId);
            console.log('buyResponse: ');
            console.log(JSON.parse(buyResponse.toString()));             
            break;
        case 'Order From Supplier':
            console.log('Order from Supplier entered for '+order.orderNumber+ ' inbound id: '+ req.body.participant+' with order.seller as: '+order.sellerId+' with provider as: '+req.body.provider);
            const orderSupplierResponse = await contract.submitTransaction('OrderFromSupplier', order.orderNumber, order.sellerId, req.body.provider);
            console.log('orderSupplierResponse: ')
            console.log(JSON.parse(orderSupplierResponse.toString()));
            break;
        case 'Request Payment':
            console.log('Request Payment entered');
            const requestPaymentResponse = await contract.submitTransaction('RequestPayment', order.orderNumber, order.sellerId, financeCoID);
            console.log('requestPaymentResponse_response: ');
            console.log(JSON.parse(requestPaymentResponse.toString()));
            break;
        case 'Refund':
            console.log('Refund Payment entered');
            const refundResponse = await contract.submitTransaction('Refund', order.orderNumber, order.sellerId, financeCoID, req.body.reason);
            console.log('refundResponse_response: ');
            console.log(JSON.parse(refundResponse.toString()));            
            break;
        case 'Resolve':
            console.log('Resolve entered');
            const resolveResponse = await contract.submitTransaction('Resolve', order.orderNumber, order.buyerId, order.sellerId, order.shipperId, order.providerId, financeCoID, req.body.reason);
            console.log('resolveResponse_response: ');
            console.log(JSON.parse(resolveResponse.toString()));
            break;
        case 'Request Shipping':
            console.log('Request Shipping entered');
            const requestShippingResponse = await contract.submitTransaction('RequestShipping', order.orderNumber, order.providerId, req.body.shipper);
            console.log('requestShippingResponse: ');
            console.log(JSON.parse(requestShippingResponse.toString()));
            break;
        case 'Update Delivery Status':
            console.log('Update Delivery Status');
            const deliveringResponse = await contract.submitTransaction('Delivering', order.orderNumber, order.shipperId, req.body.delivery);
            console.log('deliveringResponse: ');
            console.log(JSON.parse(deliveringResponse.toString()));
            break;
        case 'Delivered':
            console.log('Delivered entered');
            console.log('participant: ' + req.body.participant);
            const deliverResponse = await contract.submitTransaction('Deliver', order.orderNumber, req.body.participant);
            console.log('deliverResponse_response: ');
            console.log(JSON.parse(deliverResponse.toString()));
            break;
        case 'BackOrder':
            console.log('BackOrder entered');
            const backOrderResponse = await contract.submitTransaction('BackOrder', order.orderNumber, order.providerId, req.body.reason);
            console.log('backOrderResponse_response: ');
            console.log(JSON.parse(backOrderResponse.toString()));            
            break;
        case 'Authorize Payment':
            console.log('Authorize Payment entered');
            const authorizePaymentResponse = await contract.submitTransaction('AuthorizePayment', order.orderNumber, order.buyerId, financeCoID);
            console.log('authorizePaymentResponse: ');
            console.log(JSON.parse(authorizePaymentResponse.toString()));
            break;
        case 'Cancel':
            console.log('Cancel entered');
            const orderCancelResponse = await contract.submitTransaction('OrderCancel', order.orderNumber, order.sellerId, order.providerId);
            console.log('orderCancelResponse_response: ')
            console.log(JSON.parse(orderCancelResponse.toString()));            
            break;
        default :
            console.log('default entered for action: '+req.body.action);
            res.send({'result': 'failed', 'error':' order '+req.body.orderNo+' unrecognized request: '+req.body.action});
        }
        
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('orderAction Complete');
        await gateway.disconnect();
        res.send({'result': ' order '+req.body.orderNo+' successfully updated to '+req.body.action});
            
    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.stack});
    } 

};

/**
 * adds an order to the blockchain
 * @param {express.req} req - the inbound request object from the client
 * req.body.seller - string with seller id
 * req.body.buyer - string with buyer id
 * req.body.items - array with items for order
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} an array of assets
 * @function
 */
exports.addOrder = async function (req, res, next) {
    let method = 'addOrder';
    console.log(method+' req.body.buyer is: '+req.body.buyer );
    let ts = Date.now();
    let orderNo = req.body.buyer.replace(/@/, '').replace(/\./, '')+ts;
    if (svc.m_connection === null) {svc.createMessageSocket();}

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('globalfinancing');

        let items;
        let amount;
        for (let each in req.body.items){
            (function(_idx, _arr){   
                _arr[_idx].description = _arr[_idx].itemDescription;
                order.items.push(JSON.stringify(_arr[_idx]));
                order.amount += parseInt(_arr[_idx].extendedPrice);
            })(each, req.body.items);
        }
        
        items = JSON.stringify(items);
        amount = amount.toString();

        const createOrderResponse = await contract.submitTransaction('CreateOrder', req.body.buyer, req.body.seller, financeCoID, orderNo, items, amount);
        console.log('createOrderResponse: ')
        console.log(JSON.parse(createOrderResponse.toString()));

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('addOrder Complete');
        await gateway.disconnect();
        res.send({'result': ' order '+orderNo+' successfully added'});

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.stack});
    } 
    
};




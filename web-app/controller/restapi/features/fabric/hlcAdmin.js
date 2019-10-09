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

const fs = require('fs');
const path = require('path');

// Bring Fabric SDK network class
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use
let walletDir = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric/_idwallet');
const wallet = new FileSystemWallet(walletDir);

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);


/**
 * retrieve array of member registries
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Object} array of registries
 * @function
 */
exports.getRegistries = function(req, res, next)
{
    let allRegistries = [
        [ 'Buyer' ],
        [ 'FinanceCo' ],
        [ 'Provider' ],
        [ 'Seller' ],
        [ 'Shipper' ]
    ];
    res.send({result: 'success', registries: allRegistries});

};


/**
 * retrieve array of members from specified registry type
 * @param {express.req} req - the inbound request object from the client
 *  req.body.registry: _string - type of registry to search; e.g. 'Buyer', 'Seller', etc.
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Object} an array of members
 * @function
 */
exports.getMembers = async function(req, res, next) {

    console.log('getMembers');
    let allMembers = new Array();
    let members;

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('globalfinancing');

        switch (req.body.registry)
        {
        case 'Buyer':{
            const responseBuyer = await contract.evaluateTransaction('GetState', 'buyers');
            console.log('responseBuyer: ');
            console.log(JSON.parse(responseBuyer.toString()));
            members = JSON.parse(responseBuyer.toString());
            break;
        }
        case 'Seller': {
            const responseSeller = await contract.evaluateTransaction('GetState', 'sellers');
            console.log('responseSeller: ');
            console.log(JSON.parse(responseSeller.toString()));
            members = JSON.parse(responseSeller.toString());
            break;
        }
        case 'Provider':{
            const responseProvider = await contract.evaluateTransaction('GetState', 'providers');
            console.log('responseProvider: ');
            console.log(JSON.parse(responseProvider.toString()));
            members = JSON.parse(responseProvider.toString());
            break;
        }
        case 'Shipper':{
            const responseShipper = await contract.evaluateTransaction('GetState', 'shippers');
            console.log('responseShipper: ');
            console.log(JSON.parse(responseShipper.toString()));
            members = JSON.parse(responseShipper.toString());
            break;
        }
        case 'FinanceCo':{
            const responseFinanceCo = await contract.evaluateTransaction('GetState', 'financeCos');
            console.log('responseFinanceCo: ');
            console.log(JSON.parse(responseFinanceCo.toString()));
            members = JSON.parse(responseFinanceCo.toString());
            break;
        }
        default:
            res.send({error: 'body registry not found'});
        }

        // Get state of the members
        for (const member of members) {
            const response = await contract.evaluateTransaction('GetState', member);
            console.log('response: ');
            console.log(JSON.parse(response.toString()));
            let _jsn = JSON.parse(response.toString());
            allMembers.push(_jsn);
        }

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('getMembers Complete');
        await gateway.disconnect();
        res.send({result: 'success', members: allMembers});

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({error: error.stack});
    }

};



/**
 * gets the assets from the order registry
 * @param {express.req} req - the inbound request object from the client
 *  req.body.type - the type of individual making the request (admin, buyer, seller, etc)
 *  req.body.id - the id of the individual making the request
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {Array} - an array of assets
 * @function
 */
exports.getAssets = async function(req, res, next) {

    console.log('getAssets');
    let allOrders = new Array();

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('globalfinancing');

        const responseBuyer = await contract.evaluateTransaction('GetState', 'buyers');
        console.log('responseBuyer: ');
        console.log(JSON.parse(responseBuyer.toString()));
        let buyers = JSON.parse(responseBuyer.toString());

        for (let buyer of buyers) {
            const buyerResponse = await contract.evaluateTransaction('GetState', buyer);
            console.log('response: ');
            console.log(JSON.parse(buyerResponse.toString()));
            let _buyerjsn = JSON.parse(buyerResponse.toString());

            for (let orderNo of _buyerjsn.orders) {
                const response = await contract.evaluateTransaction('GetState', orderNo);
                console.log('response: ');
                console.log(JSON.parse(response.toString()));
                let _jsn = JSON.parse(response.toString());
                let _jsnItems = JSON.parse(_jsn.items);
                _jsn.items = _jsnItems;
                allOrders.push(_jsn);
            }
        }

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('getAssets Complete');
        await gateway.disconnect();
        res.send({result: 'success', orders: allOrders});

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({error: error.stack});
    }
};


/**
 * Adds a new member to the specified registry
 * @param {express.req} req - the inbound request object from the client
 *  req.body.companyName: _string - member company name
 *  req.body.type: _string - member type (registry type); e.g. 'Buyer', 'Seller', etc.
 *  req.body.id: _string - id of member to add (email address)
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * @returns {JSON} object with success or error results
 * @function
 */
exports.addMember = async function(req, res, next) {

    console.log('addMember');
    let members;

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('globalfinancing');

        switch (req.body.type)
        {
        case 'Buyer': {
            const responseBuyer = await contract.evaluateTransaction('GetState', 'buyers');
            members = JSON.parse(responseBuyer.toString());
            break;
        }
        case 'Seller': {
            const responseSeller = await contract.evaluateTransaction('GetState', 'sellers');
            members = JSON.parse(responseSeller.toString());
            break;
        }
        case 'Provider': {
            const responseProvider = await contract.evaluateTransaction('GetState', 'providers');
            members = JSON.parse(responseProvider.toString());
            break;
        }
        case 'Shipper': {
            const responseShipper = await contract.evaluateTransaction('GetState', 'shippers');
            members = JSON.parse(responseShipper.toString());
            break;
        }
        case 'FinanceCo': {
            const responseFinanceCo = await contract.evaluateTransaction('GetState', 'financeCos');
            members = JSON.parse(responseFinanceCo.toString());
            break;
        }
        default:
            res.send({error: 'body type not found'});
        }

        for (let member of members) {
            if (member === req.body.id) {
                res.send({error: 'member id already exists'});
            }
        }

        console.log('\nreq.body.id: ' + req.body.id);
        console.log('member.type: ' + req.body.type);
        console.log('member.companyName: ' + req.body.companyName);

        let transaction = 'Register' + req.body.type;
        console.log('transaction: ' + transaction);

        //register
        const response = await contract.submitTransaction(transaction, req.body.id, req.body.companyName);
        console.log('transaction response: ');
        console.log(JSON.parse(response.toString()));

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('AutoLoad Complete');
        await gateway.disconnect();
        res.send(req.body.companyName+' successfully added');

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({error: error.stack});
    }

};


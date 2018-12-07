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

 /**
 * This file is used to automatically populate the network with Order assets and members
 * The opening section loads node modules required for this set of nodejs services
 * to work. This module also uses services created specifically for this tutorial, 
 * in the Z2B_Services.js.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Bring key classes into scope, most importantly Fabric SDK network class
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use
let walletDir = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric/_idwallet');
const wallet = new FileSystemWallet(walletDir);

const financeCoID = 'easymoney@easymoneyinc.com';
const svc = require('./Z2B_Services');

/**
 * itemTable are used by the server to reduce load time requests
 * for member secrets and item information
 */
let itemTable = new Array();

/**
 * autoLoad reads the memberList.json file from the Startup folder and adds members,
 * executes the identity process, and then loads orders
 *
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 * saves a table of members and a table of items
 * @function
 */
exports.autoLoad = async function autoLoad(req, res, next) {

    console.log('autoload');

    // get the autoload file
    let newFile = path.join(path.dirname(require.main.filename),'startup','memberList.json');
    let startupFile = JSON.parse(fs.readFileSync(newFile));    

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // define the identity to use
        const identityLabel = 'User1@org1.example.com';

        // Load connection profile; will be used to locate a gateway
        let yamlFile = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric','network-vs.yaml');
        let connectionProfile = yaml.safeLoad(fs.readFileSync(yamlFile, 'utf8'));        

        // Set connection options; use 'admin' identity from application wallet
        let connectionOptions = {
            identity: identityLabel,
            wallet: wallet
        };

        // Connect to gateway using application specified parameters
        await gateway.connect(connectionProfile, connectionOptions);

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('globalfinancing');

        //iterate through the list of members in the memberList.json file        
        for (let member of startupFile.members) {

            console.log('\nmember.id: ' + member.id);
            console.log('member.type: ' + member.type);
            console.log('member.companyName: ' + member.companyName);
            console.log('member.pw: ' + member.pw);

            var transaction = 'Register' + member.type;
            console.log('transaction: ' + transaction);
                        
            //register a buyer, seller, provider, shipper, financeCo
            const response = await contract.submitTransaction(transaction, member.id, member.companyName);
            console.log('transaction response: ')
            console.log(JSON.parse(response.toString()));  
                                               
            await sleep(500);
            console.log('Next');                

        }                
        
        // iterate through the order objects in the memberList.json file.
        for (let each in startupFile.items){(function(_idx, _arr){itemTable.push(_arr[_idx]);})(each, startupFile.items);}
        svc.saveItemTable(itemTable);

        for (let order of startupFile.assets) {

            let _tmp = svc.addItems(order, itemTable);
            let items = JSON.stringify(_tmp.items);
            let amount = _tmp.amount.toString();

            console.log('\norder.id: ' + order.id);
            console.log('order.buyer: ' + order.buyer);
            console.log('order.seller: ' + order.seller);
            console.log('financeCoID: ' + financeCoID);
            console.log('items: ' + items);
            console.log('amount: ' + amount);

            const createOrderResponse = await contract.submitTransaction('CreateOrder', order.buyer, order.seller, financeCoID, order.id, items, amount);
            console.log('createOrderResponse: ')
            console.log(JSON.parse(createOrderResponse.toString()));

            await sleep(500);
            console.log('Next');
                      
        }

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.stack});
    } finally {
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        console.log('AutoLoad Complete');
        gateway.disconnect();
        res.send({'result': 'Success'});
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
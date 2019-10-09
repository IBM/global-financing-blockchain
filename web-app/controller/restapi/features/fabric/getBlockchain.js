'use strict';

const Fabric_Client = require('fabric-client');
let path = require('path');
let fs = require('fs');

let fabric_client = new Fabric_Client();

// setup the fabric network
let channel = fabric_client.newChannel('mychannel');
const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
let peer = fabric_client.newPeer(ccp.peers['peer0.org1.example.com'].url);
channel.addPeer(peer);
let order = fabric_client.newOrderer(ccp.orderers['orderer.example.com'].url);
channel.addOrderer(order);

let store_path = path.join(__dirname, '_idwallet', 'User1@org1.example.com');
//console.log('Store path:'+store_path);

exports.getBlockchain = async function(req, res, next) {
    try {

        let returnBlockchain = [];

        let state_store = await Fabric_Client.newDefaultKeyValueStore({
            path: store_path
        });

        fabric_client.setStateStore(state_store);
        let crypto_suite = Fabric_Client.newCryptoSuite();
        // use the same location for the state store (where the users' certificate are kept)
        // and the crypto store (where the users' keys are kept)
        let crypto_store = Fabric_Client.newCryptoKeyStore({
            path: store_path
        });
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);

        // get the enrolled user from persistence, this user will sign all requests
        let user_from_store = await fabric_client.getUserContext('User1@org1.example.com', true);
        if (user_from_store && user_from_store.isEnrolled()) {
            //console.log('Successfully loaded User1@org1.example.com from persistence');
        } else {
            throw new Error('Failed to get User1@org1.example.com.... run registerUser.js');
        }

        let blockchainInfo = await channel.queryInfo();
        let height = blockchainInfo.height.low;

        for (let i = 0; i < height; i++) {

            let returnBlock = {};
            let block = await channel.queryBlock(i);

            returnBlock.number = block.header.number;
            returnBlock.data_hash = block.header.data_hash;

            let transactions = [];
            let ns_rwsets = [];
            if (block.data.data && block.data.data.length) {
                returnBlock.num_transactions = block.data.data.length;

                for (let j = 0; j < returnBlock.num_transactions; j++) {
                    let transaction = {};

                    transaction.id = block.data.data[j].payload.header.channel_header.tx_id;
                    transaction.timestamp = block.data.data[j].payload.header.channel_header.timestamp;

                    if (block.data.data[j].payload.data.actions && block.data.data[j].payload.data.actions.length) {
                        let actions_length = block.data.data[j].payload.data.actions.length;
                        for (let k = 0; k < actions_length; k++) {

                            if (block.data.data[j].payload.data.actions[k].payload.action.proposal_response_payload.extension.results.ns_rwset && block.data.data[j].payload.data.actions[k].payload.action.proposal_response_payload.extension.results.ns_rwset.length) {
                                let ns_rwset_length = block.data.data[j].payload.data.actions[k].payload.action.proposal_response_payload.extension.results.ns_rwset.length;

                                for (let l = 0; l < ns_rwset_length; l++) {
                                    let ns_rwset = block.data.data[j].payload.data.actions[k].payload.action.proposal_response_payload.extension.results.ns_rwset[l].rwset;
                                    ns_rwsets.push(ns_rwset);
                                }
                            }
                        }
                    }

                    transaction.ns_rwsets = ns_rwsets;
                    transactions.push(transaction);

                }
            }

            returnBlock.transactions = transactions;
            returnBlockchain.push(returnBlock);


        }
        //console.log('returnBlockchain');
        //console.log(returnBlockchain);
        res.send({
            result: 'Success',
            returnBlockchain: returnBlockchain
        });

    } catch (error) {
        console.error(`Failed to get blockchain: ${error}`);
        console.log(error.stack);
        res.send({
            error: error.message
        });
    }
};

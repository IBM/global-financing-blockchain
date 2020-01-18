[![Build Status](https://travis-ci.org/IBM/global-financing-blockchain.svg?branch=master)](https://travis-ci.org/IBM/global-financing-blockchain)

*Read this in other languages: [日本語](README-ja.md)* 

# Global financing with blockchain

The Global Finance application using blockchain technology tracks actions on an order by the various members of a network -- buyer, seller, provider, shipper, and finance company. These actions include:

* Buyer creates the order
* Seller contacts a provider for the items
* Shipper delivers the items
* Finance company processes payments to the seller

This use case addresses dispute resolution and can be applied across industry verticals to resolve disputes. This [use case](https://www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/crse0401.html?Open) is inspired by the RedBook tutorial by Bob Dill and uses the same application interface. This use case employs a Node.js smart contract and a Node.js web application.

The code pattern demonstrates how a Node.js smart contract can be packaged using the IBM Blockchain Platform Extension for VS Code. Then, using the extension, you can set up a local instance of the Hyperledger Fabric network, on which you can install and instantiate the contract. The Node.js web application can interact with the network using the 'fabric-network' sdk.

When you have completed this code pattern, you will understand how to:

* Develop a Node.js smart contract
* Package and deploy the smart contract to a local instance of Hyperledger Fabric using IBM Blockchain Platform Extension for VS Code
* Develop a Node.js blockchain web application to interact with the deployed Fabric network

**Note: For deploying the smart contract to IBM Blockchain Platform (on IBM Cloud) instead, follow [this code pattern](https://developer.ibm.com/patterns/build-a-global-finance-application-on-blockchain/).**


## Architecture flow

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/72633938-7ead0f00-3927-11ea-94af-7043d1c6ad53.png">
</p>

The developer uses the IBM Blockchain Platform Extension for VS Code to:

1. Package a smart contract.
1. Launch a local Hyperledger Fabric Network.
1. Install chaincode on the peer node.
1. Instantiate the chaincode on the peer node.
1. Use a Global Finance application to interact with the Hyperledger Fabric network through API calls using the `fabric-network` npm library. Admins can also use the application to create new participants.


## Included components

* [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) is designed to assist users in developing, testing, and deploying smart contracts -- including connecting to Hyperledger Fabric environments.
* [Hyperledger Fabric v1.4](https://hyperledger-fabric.readthedocs.io) is a platform for distributed ledger solutions, underpinned by a modular architecture that delivers high degrees of confidentiality, resiliency, flexibility, and scalability.
* [Visual Studio Code](https://code.visualstudio.com/download) is a code editor that's redefined and optimized for building and debugging modern web and cloud applications.


## Featured technologies
+ [Node.js](https://nodejs.org/en/) is an open source, cross-platform JavaScript run-time environment that executes server-side JavaScript code.
+ [Bootstrap](https://getbootstrap.com/) is an open source toolkit for developing with HTML, CSS, and JavaScript.


## Running the application

Follow these steps to set up and run this code pattern. The steps are described in detail below.


### Prerequisites

You will need to follow the requirements for the [IBM Blockchain Platform Extension for VS Code](https://github.com/IBM-Blockchain/blockchain-vscode-extension/blob/master/README.md#requirements):

- [VSCode version 1.38.0 or greater](https://code.visualstudio.com)
- [Node v8.x or v10.x and npm v6.x or greater](https://nodejs.org/en/download/)
- [Docker version v17.06.2-ce or greater](https://www.docker.com/get-docker)
- [Docker Compose v1.14.0 or greater](https://docs.docker.com/compose/install/)


### Steps

1. [Clone the repo](#1-clone-the-repo)
2. [Use the VS Code extension to set up a smart contract on a basic Fabric network](#2-use-the-vs-code-extension-to-set-up-a-smart-contract-on-a-basic-fabric-network)
3. [Run the application](#3-run-the-application)


## 1. Clone the repo

Clone this repository in a folder your choice:

```
git clone https://github.com/IBM/global-financing-blockchain.git
```


## 2. Use the VS Code extension to set up a smart contract on a basic Fabric network

Open Visual Studio code and open the `contract` folder.

### Package the smart contract

Press the `F1` key to see the different VS code options. Choose `IBM Blockchain Platform: Package Open Project`.

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71910509-05036d00-3140-11ea-8b15-7c8aeb403974.png">
</p>

Click the `IBM Blockchain Platform` extension button on the left. This will show the packaged contracts on top and the blockchain connections on the bottom.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72377051-0f43df00-36dd-11ea-8e54-93c1d21f1853.png">
</p>

### Setup fabric locally

You should see `FABRIC ENVIRONMENTS` on the left side of the editor. Under this section, you should see `Local Fabric`. Click it to start the Local Fabric.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72295829-54f1a080-3626-11ea-8977-7dafef591eb6.png">
</p>

The extension will now provision the Docker containers that will act as nodes in your network. Once the provisioning is finished and the network is up and running, you will see the options to install and instantiate the smart contract, the `Channels` information, the `Nodes` and the organization msps under `Organizations`. You are now ready to install the smart contract.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72297496-0ba35000-362a-11ea-9f37-e5819b0dd751.png">
</p>


### Install and instantiate the smart contract

#### Install

* In the `FABRIC ENVIRONMENTS` section near the bottom, click on `Smart Contracts` > `Installed` > `+ Install`.  You will see a pop-up similar to the graphic below. 

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72640815-a9529400-3936-11ea-9257-f021aa8438c5.png">
</p>

* Then select the packaged contract: `globalfinancing@0.0.1 Packaged`  **Note** The 0.0.1 comes from your `package.json` line:  `"version": "0.0.1"`

After the install is complete, you should get a message `Successfully installed on peer peer0.org1.example.com`.  You should also see that the contract is listed under `Installed` under `FABRIC ENVIRONMENTS`.

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72640898-d737d880-3936-11ea-9d60-ad6629c148e6.png">
</p>


#### Instantiate

* Under **Smart Contracts** you will see a section that says **Instantiated**. Click on `+ Instantiate` under it.

* The extension will then ask you which contract and version to instantiate — choose `globalfinancing@0.0.1 Installed`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72640977-03ebf000-3937-11ea-8945-dc9e53ded253.png">
</p>

* The extension will then ask you which function to call on instantiate — type in `instantiate`

<p align="center">
  <img width="500" width="300" src="https://user-images.githubusercontent.com/8854447/72641008-149c6600-3937-11ea-9598-43004c3d8b76.png">
</p>

* Next, it will ask you for the arguments to the function. There are none, so just hit enter.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641072-43b2d780-3937-11ea-8cbc-ab4e757367d1.png">
</p>

* Next, the extension will then ask you do you want to use a provide a private data collection configuration file? - Click on `No`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641080-4a414f00-3937-11ea-8f2b-37b85090fd6c.png">
</p>

* Lastly, the extension will then ask you do you want to choose a smart contract endorsement policy. Choose `Default (single endorser, any org)`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641101-53322080-3937-11ea-89f8-4db2f23a8b27.png">
</p>

Once instantiation of the contract completes, you should get the message `Successfully instantiated smart contract` and you should see `globalfinancing@0.0.1` under `Instantiated` under `FABRIC ENVIRONMENTS`.

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72641288-c63b9700-3937-11ea-85cf-ceae22ffcf85.png">
</p>


### Add Identity on CA Node

We will now create an identity using the CA (Certificate Authority) node. The identity information and key files are needed in order to authenticate and run the application.

Under `FABRIC ENVIRONMENTS` section in the left hand pane,  expand `Nodes` and right click on `ca.org1.example.com`. Choose `Create Identity (register and enroll)`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641326-e53a2900-3937-11ea-84a6-785f11a6cbe6.png">
</p>

Type `User1@org1.example.com` and press the enter key.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641663-a3f64900-3938-11ea-823a-2021c7860f63.png">
</p>

The extension will then ask if you want to add any attributes to this identity. Click on `No`.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641770-e455c700-3938-11ea-8358-ada659c4b26a.png">
</p>

Once the identity is successfully created, you should get the message `Successfully created identity 'User1@org1.example.com'`. You can now see `User1@org1.example.com` in the `FABRIC WALLETS` section under `Local Fabric Wallet`.

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72641825-03ecef80-3939-11ea-9e1e-70bf3b88242e.png">
</p>

### Export Wallet

Under `FABRIC WALLETS`, right click on `Local Fabric Wallet` and select `Export Wallet`.

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72641899-31399d80-3939-11ea-86ff-3e1de927416d.png">
</p>

You can save the exported files anywhere. 

From the exported directory, copy the folder for `User1@org1.example.com` to the following location in the directory where you have cloned this repo:

  ```
  /global-financing-blockchain/web-app/controller/restapi/features/fabric/_idwallet/User1@org1.example.com
  ```

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72642245-e5d3bf00-3939-11ea-9deb-e7a68c5aec41.png">
</p>

Almost done, you can run the application.


## 3. Run the application

In a new terminal, navigate to the `web-app` directory:

  ```bash
  cd global-financing-blockchain/web-app/
  ```

  Build the node dependencies:
  ```bash
  npm install
  ```

  Run the application:
  ```bash
  npm start
  ```

<div style='border: 2px solid #f00;'>
  <img width="1000" src="https://user-images.githubusercontent.com/8854447/72450728-d5c8ad80-3788-11ea-83c4-1f0cf1c8e432.png">
</div>

Unified member's view:
<div style='border: 2px solid #f00;'>
  <img width="1000" src="https://user-images.githubusercontent.com/8854447/72450727-d5c8ad80-3788-11ea-8b40-549187431d33.png">
</div>


## Troubleshooting

* If you run into an error like this one:
`error: [Remote.js]: Error: Failed to connect before the deadline URL:grpc://localhost:17051
error: [Network]: _initializeInternalChannel: Unable to initialize channel. Attempted to contact 1 Peers. Last error was Error: Failed to connect before the deadline URL:grpc://localhost:17051`

  This error has occurred because the ports used for the orderer/certificate authority/peer in the connection.json file are not the same as the ones specified as the default ports in the settings.json file for the IBM Blockchain Platform Extension for VSCode. You will need to update the ports in the connection.json file to match the ones specified in the settings.json file.
  
  Click on the Gear symbol in the bottom left corner and select `Settings`. Expand `Extensions` in the left navigation pane in the newly opened "Settings" tab and select `Blockchain configuration`. Click on `Edit in settings.json` to open the settings.json file for the Blockchain platform extension. You should see a file with contents like this:
```
{
    "ibm-blockchain-platform.fabric.runtime": {
        "ports": {
            "orderer": 17053,
            "peerRequest": 17057,
            "peerChaincode": 17058,
            "peerEventHub": 17059,
            "certificateAuthority": 17060,
            "couchDB": 17061,
            "logs": 17062
        },
        "developmentMode": false
    },
    "ibm-blockchain-platform.fabric.wallets": [],
    "ibm-blockchain-platform.fabric.gateways": []
}
```
  
  Replace the orderer, peer and CA ports in the connection.json file for your project with the `orderer`, `peerRequest` and `certificateAuthority` ports specified in this settings.json file.


## Extending the code pattern
This application can be expanded in a couple of ways:
* Create a wallet for every member and use the member's wallet to interact with the application.
* Update the application to interact through the IBM Blockchain Platform starter plan on IBM Cloud.


## Links
* [Hyperledger Fabric Docs](http://hyperledger-fabric.readthedocs.io/en/latest/)
* [Zero to Blockchain](https://www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/crse0401.html?Open)
* [IBM Code Patterns for Blockchain](https://developer.ibm.com/patterns/category/blockchain/)


## License
This code pattern is licensed under the Apache Software License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)

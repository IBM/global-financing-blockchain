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

let express = require('express');
let router = express.Router();
let format = require('date-format');

let multi_lingual = require('./features/multi_lingual');
let resources = require('./features/resources');

let hlcAdmin = require('./features/fabric/hlcAdmin');
let hlcClient = require('./features/fabric/hlcClient');
let setup = require('./features/fabric/autoLoad');

router.post('/setup/autoLoad*', setup.autoLoad);

module.exports = router;
let count = 0;

/**
 * This is a request tracking function which logs to the terminal window each request coming in to the web serve and
 * increments a counter to allow the requests to be sequenced.
 * @param {express.req} req - the inbound request object from the client
 * @param {express.res} res - the outbound response object for communicating back to client
 * @param {express.next} next - an express service to enable post processing prior to responding to the client
 *
 * @function
 */
router.use(function(req, res, next) {
    count++;
    console.log('['+count+'] at: '+format.asString('hh:mm:ss.SSS', new Date())+' Url is: ' + req.url);
    next(); // make sure we go to the next routes and don't stop here
});

// the following get and post statements tell nodeJS what to do when a request comes in
// The request is the single quoted phrase following the get( or post( statement.
// the text at the end identifies which function in which require(d) module to implement
// These are searched in order by get/post request.
// The asterisk (*) means 'ignore anything following this point'
// which means we have to be careful about ordering these statements.
//
router.get('/api/getSupportedLanguages*',multi_lingual.languages);
router.get('/api/getTextLocations*',multi_lingual.locations);
router.post('/api/selectedPrompts*',multi_lingual.prompts);

router.get('/resources/getDocs*',resources.getDocs);
router.get('/resources/getEducation*',resources.getEducation);

router.get('/fabric/admin/getRegistries*', hlcAdmin.getRegistries);
router.post('/fabric/admin/getMembers*', hlcAdmin.getMembers);
router.post('/fabric/admin/getAssets*', hlcAdmin.getAssets);
router.post('/fabric/admin/addMember*', hlcAdmin.addMember);

// router requests specific to the participant
router.get('/fabric/client/getItemTable*', hlcClient.getItemTable);
router.post('/fabric/client/getMyOrders*', hlcClient.getMyOrders);
router.post('/fabric/client/addOrder*', hlcClient.addOrder);
router.post('/fabric/client/orderAction*', hlcClient.orderAction);
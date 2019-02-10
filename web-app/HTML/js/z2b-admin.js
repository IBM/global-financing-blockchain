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

// z2b-admin.js

'use strict';

let creds;
let connection;
let _blctr = 0;

/**
 * load the administration User Experience
 */
function loadAdminUX ()
{
    let toLoad = 'admin.html';
    $.when($.get(toLoad)).done(function (page)
        {$('#body').empty();
        $('#body').append(page);
        updatePage('admin');
        listMemRegistries();
    });
}


/**
 * pre-load network from startup folder contents
 */
function preLoad()
{
    $('#body').empty();
    let options = {};
    showLoad();
    $.when($.post('/setup/autoLoad', options)).done(function (_results)
    { 
        hideLoad();
        if (_results.result === 'Success')
        {
            console.log('success'); 
            $('#body').append('<h2>Autoload Successful</h2>'); 
        } else {
            console.log('error'); 
            console.log(_results);
            $('#body').append('<h4>' + _results.error + '</h4>');             
        }
        
    });
}

function showBlockchain()
{
    $('#body').empty();
    let options = {};
    showLoad();
    $.when($.post('/fabric/getBlockchain', options)).done(function (_results)
    { 
        hideLoad();
        if (_results.result === 'Success')
        {
            console.log('success'); 
            console.log('_results'); 
            console.log(_results); 
            $('#body').append('<h2>Blockchain</h2>'); 
            $('#body').append('<br><br>'); 
            
            if ( _results.returnBlockchain && _results.returnBlockchain.length) {
                var displayBlockchain = _results.returnBlockchain;
                var displayBlockchainLength = displayBlockchain.length;                            
                for (var l = displayBlockchainLength -1 ; l >= 0; l--) {
                    var str = '<div class="showBlock"><p><b>Block Number:</b> ' + displayBlockchain[l].number + '</p>'; 
                    str += '<p><b>Data Hash:</b> ' + displayBlockchain[l].data_hash + '</p>';
                    str += '<p><b>Number of Transactions:</b> ' + displayBlockchain[l].num_transactions + '</p>' ;

                    if ( displayBlockchain[l].transactions && displayBlockchain[l].transactions.length) {
                        str += '<div class="showTransactions"><p><b>Transactions:</b></p>' ;
                    for (var k = 0 ; k < displayBlockchain[l].transactions.length; k++) {

                        str += '<p><b>tx_id:</b> ' + displayBlockchain[l].transactions[k].id + '</p>' ;
                        str += '<p><b>timestamp:</b> ' + displayBlockchain[l].transactions[k].timestamp + '</p>' ;
                        str += '<p><b>writes</b></p>'                        
                        if ( displayBlockchain[l].transactions[k].ns_rwsets && displayBlockchain[l].transactions[k].ns_rwsets.length) {
                            var rwsets = displayBlockchain[l].transactions[k].ns_rwsets;
                            for (var j = 0 ; j < rwsets.length; j++) {
                                if (rwsets[j].writes && rwsets[j].writes.length ) {
                                    for (var i = 0 ; i < rwsets[j].writes.length; i++) {
                                        str += '<div class="showWrites">';
                                        str += '<p>key: ' + rwsets[j].writes[i].key + '</p>';
                                        str += '<p>value: ' + rwsets[j].writes[i].value + '</p>';
                                        str += '</div>';
                                    }
                                }
                            }
                        }
                        
                        //str += '<p>----]</p>' ;
                        str += '</div><br>';
                    }    
                    }
                    
                    //str += '<p>]</p></div><br>';
                    str += '</div><br>';
                    $('#body').append(str); 
                }
            }
            
        } else {
            console.log('error'); 
            console.log(_results);
            $('#body').append('<h4>' + _results.error + '</h4>');             
        }
        
    });
    
}

/**
 * get member registries
 */
function listMemRegistries()
{
    showLoad();
    $.when($.get('/fabric/admin/getRegistries')).done(function (_results)
    {
        hideLoad();
        $('#registryName').empty();
        let _str = '';
        _str +='<h2>Registry List</h2>';
        _str += '<h4>Network update results: '+_results.result+'</h4>';
        _str += '<ul>';
        for (let each in _results.registries)
        {(function(_idx, _arr){
            _str += '<li>'+_arr[_idx]+'</li>';
            $('#registryName').append('<option value="'+_arr[_idx]+'">' +_arr[_idx]+'</option>');
            $('#registryName2').append('<option value="'+_arr[_idx]+'">' +_arr[_idx]+'</option>');
            $('#registryName3').append('<option value="'+_arr[_idx]+'">' +_arr[_idx]+'</option>');
            $('#registryName4').append('<option value="'+_arr[_idx]+'">' +_arr[_idx]+'</option>');
            $('#registryName5').append('<option value="'+_arr[_idx]+'">' +_arr[_idx]+'</option>');
        })(each, _results.registries);}
        _str += '</ul>';
        $('#admin-forms').empty();
        $('#admin-forms').append(_str);
    });
}
/**
 * get member in a registry
 */
function listRegistry()
{
    let options = {};
    options.registry = $('#registryName').find(':selected').text();
    showLoad();
    $.when($.post('/fabric/admin/getMembers', options)).done(function (_results)
    {
        hideLoad();
        let _str = '';
        _str +='<h2>Registry List</h2>';
        _str += '<h4>Network update results: '+_results.result+'</h4>';
        _str += '<table width="100%"><tr><th>Type</th><th>Company</th><th>email</th></tr>';
        for (let each in _results.members)
        {(function(_idx, _arr){
            _str += '<tr><td>'+_arr[_idx].type+'</td><td>'+_arr[_idx].companyName+'</td><td>'+_arr[_idx].id+'</td></tr>';
        })(each, _results.members);}
        _str += '</ul>';
        $('#admin-forms').empty();
        $('#admin-forms').append(_str);
    });
}

/**
 * get asset list
 */
function listAssets()
{
    let options = {};
    options.registry = 'Order';
    options.type='admin';
    showLoad();
    $.when($.post('/fabric/admin/getAssets', options)).done(function (_results)
    {
        hideLoad();
        let _str = '';
        _str +='<h2>Registry List</h2>';
        _str += '<h4>Network update results: '+_results.result+'</h4>';
        if (_results.result === 'success')
        {
            _str += '<table width="100%"><tr><th>Order Number</th><th>Status</th><th>Buyer/Seller</th><th>Amount</th></tr>';
            for (let each in _results.orders)
            {(function(_idx, _arr){
                _str += '<tr><td align="center">'+_arr[_idx].orderNumber+'</td><td>'+JSON.parse(_arr[_idx].status).text+'</td><td>'+_arr[_idx].buyerId+'<br/>'+_arr[_idx].sellerId+'</td><td align="right">$'+_arr[_idx].amount+'.00</td></tr>';
            })(each, _results.orders);}
            _str += '</ul>';
        } else {_str += '<br/>'+_results.error;}
        $('#admin-forms').empty();
        $('#admin-forms').append(_str);
    });
}
/**
 * add a member to a registry
 */
function addMember()
{
    $.when($.get('createMember.html')).done(function (_page)
    {
        $('#admin-forms').empty();
        $('#admin-forms').append(_page);
        updatePage('createMember');
        let _cancel = $('#cancel');
        let _submit = $('#submit');
        $('#messages').empty();
        $('#messages').append('<br/>Please fill in add member form.');
        _cancel.on('click', function (){$('#admin-forms').empty();});
        _submit.on('click', function(){
            $('#messages').append('<br/>starting add member request.');
            let options = {};
            options.companyName = $('#companyName').val();
            options.id = $('#participant_id').val();
            options.type = $('#member_type').find(':selected').text();
            showLoad();
            $.when($.post('/fabric/admin/addMember', options)).done(function(_res)
            {
                hideLoad(); 
                $('#messages').append(formatMessage(_res)); 
            });
        });
    });
}



/**
 * display member information using the provided id and table
 * @param {String} id - string with member id
 * @param {JSON} _list - array of JSON member objects
 */
function displayMember(id, _list)
{
    let member = findMember(id, _list);
    $('#companyName').empty();
    $('#companyName').append(member.companyName);
    $('#participant_id').empty();
    $('#participant_id').append(member.id);
}

/**
 * find the member identified by _id in the array of JSON objects identified by _list
 * @param {String} _id - string with member id
 * @param {JSON} _list - array of JSON member objects
 * @returns {JSON} - {'id': Member ID, 'companyName': 'not found ... or company name if found'}
 */
function findMember(_id, _list)
{
    let _mem = {'id': _id, 'companyName': 'not found'};
    for (let each in _list){(function(_idx, _arr)
    {
        if (_arr[_idx].id === _id)
        {_mem = _arr[_idx]; }
    })(each, _list);}
    return(_mem);
}

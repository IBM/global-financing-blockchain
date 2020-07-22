/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

// predefined order states
const orderStatus = {
    Created: {code: 1, text: 'Order Created'},
    Bought: {code: 2, text: 'Order Purchased'},
    Cancelled: {code: 3, text: 'Order Cancelled'},
    Ordered: {code: 4, text: 'Order Submitted to Provider'},
    ShipRequest: {code: 5, text: 'Shipping Requested'},
    Delivered: {code: 6, text: 'Order Delivered'},
    Delivering: {code: 15, text: 'Order being Delivered'},
    Backordered: {code: 7, text: 'Order Backordered'},
    Dispute: {code: 8, text: 'Order Disputed'},
    Resolve: {code: 9, text: 'Order Dispute Resolved'},
    PayRequest: {code: 10, text: 'Payment Requested'},
    Authorize: {code: 11, text: 'Payment Approved'},
    Paid: {code: 14, text: 'Payment Processed'},
    Refund: {code: 12, text: 'Order Refund Requested'},
    Refunded: {code: 13, text: 'Order Refunded'}
};

// Global Finance contract
class GlobalFinance extends Contract {

    // instantiate with keys to collect participant ids
    async instantiate(ctx) {

        let emptyList = [];
        await ctx.stub.putState('buyers', Buffer.from(JSON.stringify(emptyList)));
        await ctx.stub.putState('sellers', Buffer.from(JSON.stringify(emptyList)));
        await ctx.stub.putState('shippers', Buffer.from(JSON.stringify(emptyList)));
        await ctx.stub.putState('providers', Buffer.from(JSON.stringify(emptyList)));
        await ctx.stub.putState('financeCos', Buffer.from(JSON.stringify(emptyList)));
    }

    // add a buyer object to the blockchain state identifited by the buyerId
    async RegisterBuyer(ctx, buyerId, companyName) {

        let buyer = {
            id: buyerId,
            companyName: companyName,
            type: 'buyer',
            orders: []
        };
        await ctx.stub.putState(buyerId, Buffer.from(JSON.stringify(buyer)));

        //add buyerId to 'buyers' key
        let data = await ctx.stub.getState('buyers');
        if (data) {
            let buyers = JSON.parse(data.toString());
            buyers.push(buyerId);
            await ctx.stub.putState('buyers', Buffer.from(JSON.stringify(buyers)));
        } else {
            throw new Error('buyers not found');
        }

        // return buyer object
        return JSON.stringify(buyer);
    }

    // add a seller object to the blockchain state identifited by the sellerId
    async RegisterSeller(ctx, sellerId, companyName) {

        let seller = {
            id: sellerId,
            companyName: companyName,
            type: 'seller',
            orders: []
        };
        await ctx.stub.putState(sellerId, Buffer.from(JSON.stringify(seller)));

        // add sellerId to 'sellers' key
        let data = await ctx.stub.getState('sellers');
        if (data) {
            let sellers = JSON.parse(data.toString());
            sellers.push(sellerId);
            await ctx.stub.putState('sellers', Buffer.from(JSON.stringify(sellers)));
        } else {
            throw new Error('sellers not found');
        }

        // return seller object
        return JSON.stringify(seller);
    }

    // add a shipper object to the blockchain state identifited by the shipperId
    async RegisterShipper(ctx, shipperId, companyName) {

        let shipper = {
            id: shipperId,
            companyName: companyName,
            type: 'shipper',
            orders: []
        };
        await ctx.stub.putState(shipperId, Buffer.from(JSON.stringify(shipper)));

        // add shipperId to 'shippers' key
        let data = await ctx.stub.getState('shippers');
        if (data) {
            let shippers = JSON.parse(data.toString());
            shippers.push(shipperId);
            await ctx.stub.putState('shippers', Buffer.from(JSON.stringify(shippers)));
        } else {
            throw new Error('shippers not found');
        }

        // return shipper object
        return JSON.stringify(shipper);
    }

    // add a provider object to the blockchain state identifited by the providerId
    async RegisterProvider(ctx, providerId, companyName) {

        let provider = {
            id: providerId,
            companyName: companyName,
            type: 'provider',
            orders: []
        };
        await ctx.stub.putState(providerId, Buffer.from(JSON.stringify(provider)));

        //add providerId to 'providers' key
        let data = await ctx.stub.getState('providers');
        if (data) {
            let providers = JSON.parse(data.toString());
            providers.push(providerId);
            await ctx.stub.putState('providers', Buffer.from(JSON.stringify(providers)));
        } else {
            throw new Error('providers not found');
        }

        // return provider object
        return JSON.stringify(provider);
    }

    // add a financeCompany object to the blockchain state identifited by the financeCoId
    async RegisterFinanceCo(ctx, financeCoId, companyName) {

        //store finance company data identified by financeCoId
        let financeCo = {
            id: financeCoId,
            companyName: companyName,
            type: 'financeCo',
            orders: []
        };
        await ctx.stub.putState(financeCoId, Buffer.from(JSON.stringify(financeCo)));

        //add financeCoId to 'financeCos' key
        const data = await ctx.stub.getState('financeCos');
        if (data) {
            let financeCos = JSON.parse(data.toString());
            financeCos.push(financeCoId);
            await ctx.stub.putState('financeCos', Buffer.from(JSON.stringify(financeCos)));
        } else {
            throw new Error('financeCos not found');
        }

        // return financeCo object
        return JSON.stringify(financeCo);
    }

    // add an order object to the blockchain state identifited by the orderNumber
    async CreateOrder(ctx, buyerId, sellerId, financeCoId, orderNumber, items, amount) {

        // verify buyerId
        let buyerData = await ctx.stub.getState(buyerId);
        let buyer;
        if (buyerData) {
            buyer = JSON.parse(buyerData.toString());
            if (buyer.type !== 'buyer') {
                throw new Error('buyer not identified');
            }
        } else {
            throw new Error('buyer not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // verify financeCoId
        let financeCoData = await ctx.stub.getState(financeCoId);
        let financeCo;
        if (financeCoData) {
            financeCo = JSON.parse(financeCoData.toString());
            if (financeCo.type !== 'financeCo') {
                throw new Error('financeCo not identified');
            }
        } else {
            throw new Error('financeCo not found');
        }

        let order = {
            orderNumber: orderNumber,
            items: items,
            status: JSON.stringify(orderStatus.Created),
            dispute: null,
            resolve: null,
            backOrder: null,
            refund: null,
            amount: amount,
            buyerId: buyerId,
            sellerId: sellerId,
            shipperId: null,
            providerId: null,
            financeCoId: financeCoId
        };

        //add order to buyer
        buyer.orders.push(orderNumber);
        await ctx.stub.putState(buyerId, Buffer.from(JSON.stringify(buyer)));

        //add order to financeCo
        financeCo.orders.push(orderNumber);
        await ctx.stub.putState(financeCoId, Buffer.from(JSON.stringify(financeCo)));

        //store order identified by orderNumber
        await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

        // return financeCo object
        return JSON.stringify(order);
    }

    async Buy(ctx, orderNumber, buyerId, sellerId) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify buyerId
        let buyerData = await ctx.stub.getState(buyerId);
        let buyer;
        if (buyerData) {
            buyer = JSON.parse(buyerData.toString());
            if (buyer.type !== 'buyer') {
                throw new Error('buyer not identified');
            }
        } else {
            throw new Error('buyer not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // update order status
        if (order.status === JSON.stringify(orderStatus.Created)) {
            order.status = JSON.stringify(orderStatus.Bought);
            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

            //add order to seller
            seller.orders.push(orderNumber);
            await ctx.stub.putState(sellerId, Buffer.from(JSON.stringify(seller)));

            return JSON.stringify(order);
        } else {
            throw new Error('order not created');
        }
    }


    async OrderCancel(ctx, orderNumber, sellerId, buyerId) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify buyerId
        let buyerData = await ctx.stub.getState(buyerId);
        let buyer;
        if (buyerData) {
            buyer = JSON.parse(buyerData.toString());
            if (buyer.type !== 'buyer') {
                throw new Error('buyer not identified');
            }
        } else {
            throw new Error('buyer not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        //update order
        if (order.status === JSON.stringify(orderStatus.Created) || order.status === JSON.stringify(orderStatus.Bought) || order.status === JSON.stringify(orderStatus.Backordered)  ) {
            order.status = JSON.stringify(orderStatus.Cancelled);
            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
            return JSON.stringify(order);
        } else {
            throw new Error('order not created, bought or backordered');
        }
    }


    async OrderFromSupplier(ctx, orderNumber, sellerId, providerId) {

        //get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        //verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // verify providerId
        let providerData = await ctx.stub.getState(providerId);
        let provider;
        if (providerData) {
            provider = JSON.parse(providerData.toString());
            if (provider.type !== 'provider') {
                throw new Error('provider not identified');
            }
        } else {
            throw new Error('provider not found');
        }

        //update order
        if (order.status === JSON.stringify(orderStatus.Bought) ) {
            order.providerId = providerId;
            order.status = JSON.stringify(orderStatus.Ordered);
            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

            // add order to provider
            provider.orders.push(orderNumber);
            await ctx.stub.putState(providerId, Buffer.from(JSON.stringify(provider)));

            return JSON.stringify(order);
        } else {
            throw new Error('order status not bought');
        }
    }

    async RequestShipping(ctx, orderNumber, providerId, shipperId) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify providerId
        let providerData = await ctx.stub.getState(providerId);
        let provider;
        if (providerData) {
            provider = JSON.parse(providerData.toString());
            if (provider.type !== 'provider') {
                throw new Error('provider not identified');
            }
        } else {
            throw new Error('provider not found');
        }

        // verify shipperId
        let shipperData = await ctx.stub.getState(shipperId);
        let shipper;
        if (shipperData) {
            shipper = JSON.parse(shipperData.toString());
            if (shipper.type !== 'shipper') {
                throw new Error('shipper not identified');
            }
        } else {
            throw new Error('shipper not found');
        }

        // update order
        if (order.status === JSON.stringify(orderStatus.Ordered) || order.status === JSON.stringify(orderStatus.Backordered) ) {

            order.shipperId = shipperId;
            order.status = JSON.stringify(orderStatus.ShipRequest);
            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));

            // add order to shipper
            shipper.orders.push(orderNumber);
            await ctx.stub.putState(shipperId, Buffer.from(JSON.stringify(shipper)));

            return JSON.stringify(order);

        } else {
            throw new Error('order status not ordered or backordered');
        }
    }

    async Delivering(ctx, orderNumber, shipperId, deliveryStatus) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify shipperId
        let shipperData = await ctx.stub.getState(shipperId);
        let shipper;
        if (shipperData) {
            shipper = JSON.parse(shipperData.toString());
            if (shipper.type !== 'shipper') {
                throw new Error('shipper not identified');
            }
        } else {
            throw new Error('shipper not found');
        }

        // update order
        if (order.status === JSON.stringify(orderStatus.ShipRequest) || order.status.code === JSON.stringify(orderStatus.Delivering.code) ) {

            let _status = orderStatus.Delivering;
            _status.text += '  '+deliveryStatus;
            order.status = JSON.stringify(_status);

            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
            return JSON.stringify(order);
        } else {
            throw new Error('order status not shipping requested or delivering');
        }
    }


    async Deliver(ctx, orderNumber, shipperId) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify shipperId
        let shipperData = await ctx.stub.getState(shipperId);
        let shipper;
        if (shipperData) {
            shipper = JSON.parse(shipperData.toString());
            if (shipper.type !== 'shipper') {
                throw new Error('shipper not identified');
            }
        } else {
            throw new Error('shipper not found');
        }

        // update order
        if (order.status === JSON.stringify(orderStatus.ShipRequest) || (JSON.parse(order.status).code === orderStatus.Delivering.code) ) {

            order.status = JSON.stringify(orderStatus.Delivered);
            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
            return JSON.stringify(order);
        } else {
            throw new Error('order status not shipping requested or delivering');
        }
    }

    async RequestPayment(ctx, orderNumber, sellerId, financeCoId) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // verify financeCoId
        let financeCoData = await ctx.stub.getState(financeCoId);
        let financeCo;
        if (financeCoData) {
            financeCo = JSON.parse(financeCoData.toString());
            if (financeCo.type !== 'financeCo') {
                throw new Error('financeCo not identified');
            }
        } else {
            throw new Error('financeCo not found');
        }

        // update order
        if ((JSON.parse(order.status).text === orderStatus.Delivered.text) || (JSON.parse(order.status).text === orderStatus.Resolve.text)) {

            order.status = JSON.stringify(orderStatus.PayRequest);

            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
            return JSON.stringify(order);
        } else {
            throw new Error('order status not delivered or resolved');
        }
    }


    async AuthorizePayment(ctx, orderNumber, buyerId, financeCoId) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify buyerId
        let buyerData = await ctx.stub.getState(buyerId);
        let buyer;
        if (buyerData) {
            buyer = JSON.parse(buyerData.toString());
            if (buyer.type !== 'buyer') {
                throw new Error('buyer not identified');
            }
        } else {
            throw new Error('buyer not found');
        }

        // verify financeCoId
        let financeCoData = await ctx.stub.getState(financeCoId);
        let financeCo;
        if (financeCoData) {
            financeCo = JSON.parse(financeCoData.toString());
            if (financeCo.type !== 'financeCo') {
                throw new Error('financeCo not identified');
            }
        } else {
            throw new Error('financeCo not found');
        }

        //update order
        if ((JSON.parse(order.status).text === orderStatus.PayRequest.text ) || (JSON.parse(order.status).text === orderStatus.Resolve.text )) {

            order.status = JSON.stringify(orderStatus.Authorize);

            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
            return JSON.stringify(order);
        } else {
            throw new Error('order status not payment requested or resolved');
        }
    }

    async Pay(ctx, orderNumber, sellerId, financeCoId) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // verify financeCoId
        let financeCoData = await ctx.stub.getState(financeCoId);
        let financeCo;
        if (financeCoData) {
            financeCo = JSON.parse(financeCoData.toString());
            if (financeCo.type !== 'financeCo') {
                throw new Error('financeCo not identified');
            }
        } else {
            throw new Error('financeCo not found');
        }

        // update order
        if (JSON.parse(order.status).text === orderStatus.Authorize.text ) {

            order.status = JSON.stringify(orderStatus.Paid);

            await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
            return JSON.stringify(order);
        } else {
            throw new Error('order status not authorize payment');
        }
    }

    async Dispute(ctx, orderNumber, buyerId, sellerId, financeCoId, dispute) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // verify financeCoId
        let financeCoData = await ctx.stub.getState(financeCoId);
        let financeCo;
        if (financeCoData) {
            financeCo = JSON.parse(financeCoData.toString());
            if (financeCo.type !== 'financeCo') {
                throw new Error('financeCo not identified');
            }
        } else {
            throw new Error('financeCo not found');
        }

        // verify buyerId
        let buyerData = await ctx.stub.getState(buyerId);
        let buyer;
        if (buyerData) {
            buyer = JSON.parse(buyerData.toString());
            if (buyer.type !== 'buyer') {
                throw new Error('buyer not identified');
            }
        } else {
            throw new Error('buyer not found');
        }

        //update order
        order.status = JSON.stringify(orderStatus.Dispute);
        order.dispute = dispute;
        await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
        return JSON.stringify(order);

    }

    async Resolve(ctx, orderNumber, buyerId, sellerId, shipperId, providerId, financeCoId, resolve) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify buyerId
        let buyerData = await ctx.stub.getState(buyerId);
        let buyer;
        if (buyerData) {
            buyer = JSON.parse(buyerData.toString());
            if (buyer.type !== 'buyer') {
                throw new Error('buyer not identified');
            }
        } else {
            throw new Error('buyer not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // verify shipperId
        let shipperData = await ctx.stub.getState(shipperId);
        let shipper;
        if (shipperData) {
            shipper = JSON.parse(shipperData.toString());
            if (shipper.type !== 'shipper') {
                throw new Error('shipper not identified');
            }
        } else {
            throw new Error('shipper not found');
        }

        // verify providerId
        let providerData = await ctx.stub.getState(providerId);
        let provider;
        if (providerData) {
            provider = JSON.parse(providerData.toString());
            if (provider.type !== 'provider') {
                throw new Error('provider not identified');
            }
        } else {
            throw new Error('provider not found');
        }

        // verify financeCoId
        let financeCoData = await ctx.stub.getState(financeCoId);
        let financeCo;
        if (financeCoData) {
            financeCo = JSON.parse(financeCoData.toString());
            if (financeCo.type !== 'financeCo') {
                throw new Error('financeCo not identified');
            }
        } else {
            throw new Error('financeCo not found');
        }

        // update order
        order.status = JSON.stringify(orderStatus.Resolve);
        order.resolve = resolve;
        await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
        return JSON.stringify(order);

    }


    async Refund(ctx, orderNumber, sellerId, financeCoId, refund) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify sellerId
        let sellerData = await ctx.stub.getState(sellerId);
        let seller;
        if (sellerData) {
            seller = JSON.parse(sellerData.toString());
            if (seller.type !== 'seller') {
                throw new Error('seller not identified');
            }
        } else {
            throw new Error('seller not found');
        }

        // verify financeCoId
        let financeCoData = await ctx.stub.getState(financeCoId);
        let financeCo;
        if (financeCoData) {
            financeCo = JSON.parse(financeCoData.toString());
            if (financeCo.type !== 'financeCo') {
                throw new Error('financeCo not identified');
            }
        } else {
            throw new Error('financeCo not found');
        }

        order.status = JSON.stringify(orderStatus.Refund);
        order.refund = refund;

        await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
        return JSON.stringify(order);
    }


    async BackOrder(ctx, orderNumber, providerId, backorder) {

        // get order json
        let data = await ctx.stub.getState(orderNumber);
        let order;
        if (data) {
            order = JSON.parse(data.toString());
        } else {
            throw new Error('order not found');
        }

        // verify providerId
        let providerData = await ctx.stub.getState(providerId);
        let provider = JSON.parse(providerData.toString());
        if (provider.type !== 'provider' || order.providerId !== providerId) {
            throw new Error('provider not identified');
        }

        // update order
        order.status = JSON.stringify(orderStatus.Backordered);
        order.backOrder = backorder;
        await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
        return JSON.stringify(order);
    }

    // get the state from key
    async GetState(ctx, key) {
        let data = await ctx.stub.getState(key);
        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);
    }

}

module.exports = GlobalFinance;

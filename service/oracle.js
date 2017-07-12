"use strict";

let request = require("request");
Promise = require("bluebird");
const URL_BASE = "https://apex.oracle.com/pls/apex/" + process.env.ORACLE_WORKSPACE + "/kasidasi/" + process.env.ORACLE_ACCESS_TOKEN;

Promise.promisifyAll(request);

module.exports = class ServiceOracle {
    static toggle_leng_flag(serial){
        let url = URL_BASE + "/product/toggle/" + encodeURIComponent(serial);
        let headers = {
            "Content-Type": "application/json"
        }
        return request.putAsync({
            url: url,
            headers: headers,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    return Promise.reject(new Error("ServiceOracle.toggle_lend_flag() failed."));
                }
                return response;
            }
        );
    }

    static get_product_list(){
        let url = URL_BASE + "/product/list";
        let headers = {
            "Content-Type": "application/json"
        }
        return request.getAsync({
            url: url,
            headers: headers,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    return Promise.reject(new Error("ServiceOracle.get_product_list() failed."));
                }
                return response.body.items;
            }
        );
    }

    static search_product(key){
        let url = URL_BASE + "/product/search?key=" + encodeURIComponent(key);
        let headers = {
            "Content-Type": "application/json"
        }
        return request.getAsync({
            url: url,
            headers: headers,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    return Promise.reject(new Error("ServiceOracle.search_product() failed."));
                }
                return response.body.items;
            }
        );
    }

    static get_product_by_id(id){
        let url = URL_BASE + "/product?id=" + encodeURIComponent(id);
        let headers = {
            "Content-Type": "application/json"
        }
        console.log(url);
        return request.getAsync({
            url: url,
            headers: headers,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    return Promise.reject(new Error("ServiceOracle.get_product_by_id() failed."));
                }
                return response.body.items;
            }
        );
    }

    static get_product_by_name(name){
        let url = URL_BASE + "/product?name=" + encodeURIComponent(name);
        let headers = {
            "Content-Type": "application/json"
        }
        return request.getAsync({
            url: url,
            headers: headers,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    return Promise.reject(new Error("ServiceOracle.get_product_by_name() failed."));
                }
                return response.body.items;
            }
        );
    }
}

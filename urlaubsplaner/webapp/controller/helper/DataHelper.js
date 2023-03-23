sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./ResponseStatusHelper"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ResponseStatusHelper) {
        "use strict";

        return{
           
            read: function(URL, Params, oController){
                
                return new Promise(function(resolve, reject) {
                    jQuery.ajax({
                        type: "GET",
                        contentType: "application/json",
                        url: URL,
                        dataType: "json",
                        data: Params,
                        async: true,
                        success: function (oResponse) {
                            resolve(oResponse);
                        },
                        error: function (oResponse) {
                            ResponseStatusHelper.handleStatusCode(oResponse,oController);
                            reject(oResponse);

                        }
                    })
                }.bind(this))
                
            },
            update: function(URL, Params, oController){
                
                return new Promise(function(resolve, reject) {
                    jQuery.ajax({
                        type: "PUT",
                        contentType: "application/json",
                        url: URL,
                        dataType: "json",
                        data: Params,
                        async: true,
                        success: function (oResponse) {
                            resolve(oResponse);
                        },
                        error: function (oResponse) {
                            ResponseStatusHelper.handleStatusCode(oResponse,oController);
                            reject(oResponse);

                        }
                    })
                }.bind(this))
                
            }
        };
    })

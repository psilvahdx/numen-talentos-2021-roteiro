sap.ui.define([], function () {
	"use strict";
	return {
		statusFlTime: function (flTime) {

            if ( flTime < 300) {
                    return "sap-icon://message-success";           
                }

            if ( flTime < 600) {
                   return "sap-icon://alert";          
                }    
            
            
             if ( flTime > 600) {
                    return "sap-icon://error";        
                }   

		}
	};
});
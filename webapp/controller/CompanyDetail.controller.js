
sap.ui.define([
    "numen/talentos/roteiro/controller/BaseController",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, History, MessageToast, MessageBox) {
    "use strict";
    return BaseController.extend("numen.talentos.roteiro.controller.CompanyDetail", {
        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("RouteCompanyDetail").attachMatched(this._onRouteMatched, this);

        },
        _onRouteMatched: function (oEvent) {
            var oArgs, oView;
            oArgs = oEvent.getParameter("arguments");
            oView = this.getView();

            var oEditModel = this.getView().getModel("editCompanyModel");
            oEditModel.setProperty("/isNew", false);

            if (oArgs.Carrid !== 'New') {
                oView.bindElement({
                    path: "/ScarrSet('" + oArgs.Carrid + "')",
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function (oEvent) {
                            oView.setBusy(true);
                        },
                        dataReceived: function (oEvent) {
                            oView.setBusy(false);
                        }
                    }
                });
            } else {

                this._initNewCompany();

            }


        },
        _onBindingChange: function (oEvent) {
            // No data for the binding
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }

        },

        _initNewCompany: function () {
            var oEditModel = this.getView().getModel("editCompanyModel");
            oEditModel.setProperty("/isNew", true);

            var oModel = this.getView().getModel();

            oModel.setDeferredGroups(["creategroupId"]);
            oModel.setChangeGroups({
                "ScarrSet": {
                    groupId: "creategroupId",
                    changeSetId: "ID"
                }
            });

            var oContext = oModel.createEntry("/ScarrSet", {
                groupId: "creategroupId",
                properties: {}
            });

            var oView = this.getView();
            oView.bindElement(oContext.getPath());

        },

        onBtnSavePress: function (oEvent) {
            var oModel = this.getView().getModel();

            oModel.submitChanges({
                success: this.handleSuccessSave.bind(this),
                error: this.handleSaveError.bind(this),
            });


        },

         onBtnDeletePress: function (oEvent) {
            var oModel = this.getView().getModel(),
                oContext =  this.getView().getBindingContext(),
                that = this;

           MessageBox.warning(
				"O Registro Será excluído! Deseja continuar?",
				{
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],					
					onClose: function(sAction) {
						if (sAction == MessageBox.Action.OK) {
                            oModel.remove(oContext.getPath(), {
                                success: that.handleSuccessDelete.bind(that), 
                                error: that.handleErrorDelete.bind(that),
                            });
                        }
					}
				}
			);


        },

        handleSuccessSave: function (oRes, oData) {

            var oModel = this.getView().getModel();
            if (oRes.__batchResponses) {

                if (oRes.__batchResponses[0].response) {
                     var status = parseInt(oRes.__batchResponses[0].response.statusCode);

                    if (status >= 400) {

                        var oResponseBody = JSON.parse(oRes.__batchResponses[0].response.body);
                        MessageBox.alert("Erro ao Salvar. ERRO:" + oResponseBody.error.message.value);
                        oModel.resetChanges();
                        oModel.refresh();

                    } else {
                        MessageToast.show("Salvo com sucesso!");
                        this.onNavBack();

                    }
                }else if(oRes.__batchResponses[0].__changeResponses){
                    var aChangeRes =  oRes.__batchResponses[0].__changeResponses;

                     var status = parseInt(aChangeRes[0].statusCode);

                    if (status >= 400) {
                      
                        MessageBox.alert("Erro ao Salvar");
                        oModel.resetChanges();
                        oModel.refresh();

                    } else {
                        MessageToast.show("Salvo com sucesso!");
                        this.onNavBack();

                    }

                }
               

            }else{
                 MessageToast.show("Salvo com sucesso!");
                 this.onNavBack();
            }

        },

        handleSaveError: function (oError) {
            if (oError) {
                if (oError.responseText) {
                    var oErrorMessage = JSON.parse(oError.responseText);
                    MessageBox.alert(oErrorMessage.error.message.value);
                }
            }
        },

         handleSuccessDelete: function(oRes){
             MessageToast.show("Registro Excluído com sucesso!");
             this.onNavBack();
         },

         handleErrorDelete: function(oError){
             if (oError) {
                if (oError.responseText) {
                    var oErrorMessage = JSON.parse(oError.responseText);
                    MessageBox.alert(oErrorMessage.error.message.value);
                }
            }
         }


    });
});

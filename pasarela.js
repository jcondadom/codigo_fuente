jQuery(function() {

    var loader = $(".preloader");
    var explorers = [];
    explorers['BTC'] = 'https://live.blockcypher.com/btc-testnet/tx/';
    explorers['LTC'] = 'https://chain.so/tx/LTCTEST/';
    explorers['ETH'] = '';
    explorers['DASH'] = '';

    //traslate
    var t = {        
        "Pasarela de Pago": {      
          en: "Payment Gateway",      
        },   
        "Trasladar a Ingles":{
          en: "Translate to English"
        },
        "Trasladar a Español":{
          en: "Translate to Spanish"
        },
        "Seleccionar moneda":{
          en: "Select currency"
        },
        "Tarifa de la red:":{
          en: "Network rate:"
        },
        "Pagos realizados":{
          en: "Payments"
        },
        "Transacción":{
          en: "Transaction"
        },
        "Monto":{
          en: "Amount"
        },
        "Regresar":{
          en: "To return"
        },
        "Excedente":{
          en: "Surplus"
        },
        "Faltante por pagar":{
          en: "Missing to pay"
        },
        "Monto del pago":{
          en: "Payment amount"
        },
        "Tarifa de la red":{
          en: "Network Rate"
        },
        "Total":{
          en: "Total"
        },
        "Algo ha ido mal":{
          en: "Something went wrong"
        },
        "Estas son alguna de las posibles causas del error:":{
          en: "These are some of the possible causes of the error:"
        },
        "Parámetro incorrecto":{
          en: "Wrong parameter"
        },
        "URL inválida":{
          en: "Invalid URL"
        },
        "Elegir moneda":{
          en: "Choose currency"
        },
        "Para completar su pago, elija una de las siguientes opciones de moneda.":{
          en: "To complete your payment, choose one of the following currency options."
        },
        "Seleccione una opcion para realizar el pago.":{
          en: "Select an option to make the payment."
        },
        "Escanee el código QR o copie la dirección de la billetera.":{
          en: "Scan the QR code or copy the wallet address."
        },
        "Active ultrasonic o copie la dirección de la billetera.":{
          en: "Activate ultrasonic or copy the wallet address."
        },
        "No ha seleccionado ninguna criptomoneda.":{
          en: "You have not selected any cryptocurrency."
        },
        "En espera de pago":{
          en: "Awaiting payment"
        },
        "La factura esta por expirar.":{
          en: "The invoice is about to expire."
        },
        "¡Factura pagada con éxito!":{
          en: "Invoice paid successfully!"
        },
        "Factura expirada.":{
          en: "Invoice expired."
        },
        "Factura expirada. Pago no completado.":{
          en: "Invoice expired. Payment not completed."
        },
        " (SIN REEMBOLSOS)":{
          en: "(NO REFUNDS)"
        },
        "Monto a pagar USD. ":{
          en: "Amount to pay USD."
        },
        'Copiar dirección <i class="fa fa-copy"></i>':{
          en: 'Copy address <i class="fa fa-copy"></i>'
        },   
        'Copiado!':{
            en: 'Copied!'
        },
        'Pronto Disponible':{
            en: 'Soon Avalaible'
        },     

    };
    var lang_origen = $(".idioma").val();
    var _t = $('body').translate({lang: lang_origen, t: t});
    var str = _t.g("translate");          
    $(".lang_selector").click(function(ev) {
        var lang = $(this).attr("data-value");
        _t.lang(lang);       
        $(".idioma").val(lang);
        ev.preventDefault();           
    });   
    var app = {

        translate: function(msj)
        {
            var lang_origen = $(".idioma").val();
            _t.lang(lang_origen); 
            //console.log(msj);                          
        },

        initialize: function()
        {            
            this.api = 'http://core-pg.tinscorp.com:8280/invoicepay';
            this.invoice = app.getURLParameter('invoice');
            this.interval = 10000; // milisegundos
            this.currentInvoice;
            this.registerEvents();            
        },

        registerEvents: function()
        {
            $('body').on('click', 'div[data-currency]', this.handleCurrencyChoose);
            $('body').on('click', '.copy', this.handleCopy);
            $('.card-stage').perfectScrollbar();
        },

        handleCurrencyChoose: function(e)
        {            
            var card = $(this);
            var currency = card.data('currency');            
            app.sendInvoiceRequest(app.invoice, currency);
            e.preventDefault();
        },

        handleCopy: function(e)
        {
            var tmp = $("<input>");
            $("body").append(tmp);
            tmp.val($(this).data('wallet')).select();
            document.execCommand("copy");
            tmp.remove();                              
        },

        getTotalPagado: function(transacciones)
        {
            var monto = 0;
            if (!(transacciones === null))
            if (transacciones.transaccion.length === undefined) {
                monto = transacciones.transaccion.monto;
            } else {
                for (var i = 0; i < transacciones.transaccion.length; i++) {
                    monto = monto + transacciones.transaccion[i].monto;
                }
            }
            return monto;
        },

        createTemplateCurrency: function(crypto)
        {
            return $('<div>', {
                'class': 'card',
                'style': 'margin-bottom:10px; cursor: pointer;',
                'data-currency': crypto.id,
                'title': 'Seleccionar moneda'
            }).append(
                $('<div>', {
                    'class': 'row justify-content-center align-items-center'
                }).append(
                    $('<div>', {
                        'class': 'p-2 col col-3 text-center b-r'
                    }).append(
                        $('<img>', {
                            'width': 30,
                            'src': './images/currency/' + crypto.siglas.toLowerCase() + '.png'
                        })
                    ),
                    $('<div>', {
                        'class': 'p-2 col col-7'
                    }).append(
                        $('<h5>', {'class': 'text-capitalize'}).text(crypto.nombre),
                        $('<small>', {'class': 'text-muted trn'}).text('Tarifa de la red:'),
                        $('<small>', {'class': 'text-muted'}).text(' '+crypto.fee_network)
                    ),
                    $('<div>', {
                        'class': 'p-0 col col-2'
                    }).append(
                        $('<small>', {'class': 'text-muted text-uppercase'}).text(crypto.siglas + ' ').append($('<i>', {'class': 'fa fa-chevron-right'}))
                    )
                )
            )
        },

        createTableTransaction: function(response, template)
        {            
                if ($('.stage-body').length==0) {
                    template.append(
                        $('<div>', {
                            'class': 'card-body p-0 m-t-20',
                            'id': 'card-transacciones'
                        }).append(
                            $('<div>', {
                                'class': 'row'
                            }).append(
                                $('<div>', {
                                    'class': 'col col-md-12'
                                }).append(
                                    $('<p>', {'class':'trn'}).append('Pagos realizados'),
                                    $('<table>', {
                                        'class': 'table table-hover table-striped rounded small bg-white',
                                        'id': 'table-transacciones'
                                    }).append(
                                        $('<thead>').append($('<tr>').append($('<th>',{'class':'text-center p-0 trn'}).text('Transacción'),$('<th>',{'class':'text-center p-0 trn'}).text('Monto'))),
                                        $('<tbody>')
                                    )
                                )
                            )
                        )
                    );
            }
            
            
            if (!(response.transacciones === null)){
                if (response.transacciones.transaccion.length === undefined) {
                    template.find('#table-transacciones tbody').append(
                        $('<tr>').append(
                            $('<td>', {
                                'class': 'text-center p-0'
                            }).append(
                                $('<a>', {
                                    'href': explorers[response.crypto.siglas] + response.transacciones.transaccion.txid,
                                    'title': response.transacciones.transaccion.txid,
                                    'target': 'blank'
                                }).text(response.transacciones.transaccion.txid.substring(0,10) + '...')
                            ),
                            $('<td>', {
                                'class': 'text-right p-0'
                            }).text(response.transacciones.transaccion.monto.toFixed(8))
                        )
                    );
                } else {
                    for (var i = 0; i < response.transacciones.transaccion.length; i++) {
                        template.find('#table-transacciones tbody').append(
                            $('<tr>').append(
                                $('<td>', {
                                    'class': 'text-center  p-0'
                                }).append(
                                    $('<a>', {
                                        'href': explorers[response.crypto.siglas] + response.transacciones.transaccion[i].txid,
                                        'title': response.transacciones.transaccion[i].txid,
                                        'target': 'blank'
                                    }).text(response.transacciones.transaccion[i].txid.substring(0,10) + '...')
                                ),
                                $('<td>', {
                                    'class': 'text-right p-0'
                                }).text(response.transacciones.transaccion[i].monto.toFixed(8))
                            )
                        );                        
                    }                    
                }
            }
            var monto_parcial = app.getTotalPagado(response.transacciones);
            var diferencia = response.crypto.total_con_fee - monto_parcial;
            diferencia = diferencia.toFixed(8);
            $('.faltante').text(diferencia);
            if (!(response.cripto_monto_real === null) && !(response.cripto_monto_real === undefined))
            if (response.etapa > 2) {
                template.find('#table-transacciones').append(
                    $('<tfoot>').append($('<tr>').append($('<th>',{'class':'text-right p-0'}).text('Total'), $('<th>',{'class':'text-right p-0'}).text(response.cripto_monto_real.toFixed(8))))
                );
            }           
            
        },

        createButtonReturn: function(response, template)
        {
            template.append(
                $('<div>', {'class': 'row m-t-20'}).append(
                    $('<div>',{'class':'col col-12 text-center'}).append(
                        $('<a>', {
                            'class': 'btn btn-secondary btn-sm btn-rounded trn',
                            'href': response.url_callback
                        }).text('Regresar')
                    )
                )
            );
            closeSession();
        },

        createInfoCrytoSelected: function(response)
        {
            return $('<div>', { //Moneda seleccionada
                'class': 'card-body card-header-status'
            }).append(
                $('<div>', {
                    'class': 'row'
                }).append(
                    $('<div>', {
                        'class': 'col col-6'
                    }).append(
                        $('<img>', {
                            'width': 20,
                            'src': './images/currency/' + response.crypto.siglas.toLowerCase() + '.png'
                        }),
                        $('<span>').text(' ' + response.crypto.nombre)
                    ),
                    $('<div>', {
                        'class': 'col col-6 text-right'
                    }).append(
                        $('<small>').text(response.crypto.precio.toFixed(2))
                    )
                )
            );            
        },

        createInfoPay: function(response)
        {                     
            var monto_parcial = app.getTotalPagado(response.transacciones);
            var diferencia = response.crypto.total_con_fee - monto_parcial;
            diferencia = diferencia.toFixed(8);
            var objDiferencia = isNaN(diferencia)
                ? ''
                : $('<div>', {'class': 'row small font-bold'}).append(
                    $('<div>', {'class': 'col col-6'}).append(
                        $('<span>',{'class':'trn'}).text(
                             (diferencia>0)?'Excedente':'Faltante por pagar'
                        )
                    ),
                    $('<div>', {
                        'class': 'col col-6 text-right'
                    }).append(
                        $('<span>',{
                            'class':(diferencia>=0)?'text-success faltante':'text-danger faltante'
                        }).text(diferencia)
                    )
                );

            return $('<div>', { //Información de pago
                'class': 'card-body card-header-status bg-gray-light'
            }).append(
                $('<div>', {'class': 'row'}).append(
                    $('<div>', {'class': 'col col-6'}).append(
                        $('<small>', {'class': 'trn'}).text('Monto del pago')
                    ),
                    $('<div>', {'class': 'col col-6 text-right'}).append(
                        $('<small>').text(response.crypto.total.toFixed(8))
                    )
                ),
                $('<div>', {'class': 'row'}).append(
                    $('<div>', {'class': 'col col-6'}).append(
                        $('<small>', {'class': 'trn'}).text('Tarifa de la red')
                    ),
                    $('<div>', {'class': 'col col-6 text-right'}).append(
                        $('<small>').text(response.crypto.fee_network.toFixed(8))
                    )
                ),
                $('<div>', {'class': 'row small font-bold'}).append(
                    $('<div>', {'class': 'col col-6'}).append(
                        $('<span>',{'class':'trn'}).text('Total')
                    ),
                    $('<div>', {'class': 'col col-6 text-right'}).append(
                        $('<span>').text(response.crypto.total_con_fee.toFixed(8))
                    )
                ),
                objDiferencia
            );
            
        },

        createTemplate: function(r)
        {
            var template;

            switch ((typeof r === "number")? r: r.etapa)
            {
                case 0:
                    template =
                    $('<div>', {
                        'class': 'card-body card-height-fixed stage-body'
                    }).append(
                        $('<div>', {
                            'class': 'row text-center m-b-40 m-t-40'
                        }).append(
                            $('<div>', {
                                'class': 'col col-12'
                            }).append(
                                $('<h5>', {'class': 'trn'}).text('Algo ha ido mal'),
                                $('<i>', {'class': 'fas fa-exclamation-circle fa-5x'})
                            )
                        ),
                        $('<div>', {
                            'class': 'row m-b-40'
                        }).append(
                            $('<div>', {
                                'class': 'col col-12'
                            }).append(
                                $('<p>', {'class': 'text-muted trn'}).append('Estas son alguna de las posibles causas del error:'),
                                $('<ol>').append(
                                    $('<li class="trn">').text('Parámetro incorrecto'),
                                    $('<li class="trn">').text('URL inválida')
                                )
                                
                            )
                        )
                    );
                    break;
                case 1:
                    template =
                    $('<div>', {
                        'class': 'card-body card-height-fixed stage-body'
                    }).append(
                        $('<div>', {
                            'class': 'row text-center m-b-40 m-t-40'
                        }).append(
                            $('<div>', {
                                'class': 'col col-12'
                            }).append(
                                $('<h5>', {'class': 'trn'}).text('Elegir moneda'),
                                $('<p>', {'class': 'text-muted trn'}).text('Para completar su pago, elija una de las siguientes opciones de moneda.')
                            )
                        )
                    );
                    //console.log(r.cryptos.crypto);
                    for (var i = 0; i < r.cryptos.crypto.length; i++) {
                        template.append(
                            $('<div>', {
                                'class': 'row'
                            }).append(
                                $('<div>', {
                                    'class': 'col col-12'
                                }).append(
                                    app.createTemplateCurrency(r.cryptos.crypto[i])
                                )
                            )
                        )
                    }

                    template.append('<div class="text-center m-t-10 trn"><span class="trn">Soon Avalaible</span></div>'+
                        '<div class="row"><div class="col col-12"><div class="card" style="margin-bottom:10px;">'+                        
                        '<div class="row justify-content-center align-items-center">'+
                        '<div class="p-2 col col-3 text-center b-r">'+
                        '<img src="./images/currency/btccash2.png" style="width: 30px;">'+
                        '</div>'+
                        '<div class="p-2 col col-7">'+
                        '<h5 class="text-capitalize">BitcoinCash</h5>'+
                        '<small class="text-muted trn">'+
                        '</small><small class="text-muted"></small>'+
                        '</div>'+
                        '<div class="p-0 col col-2">'+
                        '<small class="text-muted text-uppercase">BCH <i class="fa fa-chevron-right"></i></small>'+
                    '</div></div></div>'+
                    '</div></div>'+
                    '<div class="row"><div class="col col-12"><div class="card" style="margin-bottom:10px;">'+                        
                        '<div class="row justify-content-center align-items-center">'+
                        '<div class="p-2 col col-3 text-center b-r">'+
                        '<img src="./images/currency/monero2.png" style="width: 30px;">'+
                        '</div>'+
                        '<div class="p-2 col col-7">'+
                        '<h5 class="text-capitalize">Monero</h5>'+
                        '<small class="text-muted trn">'+
                        '</small><small class="text-muted"></small>'+
                        '</div>'+
                        '<div class="p-0 col col-2">'+
                        '<small class="text-muted text-uppercase">XMR <i class="fa fa-chevron-right"></i></small>'+
                    '</div></div></div>'+
                    '</div></div>'+
                    '<div class="row"><div class="col col-12"><div class="card" style="margin-bottom:10px;">'+                        
                        '<div class="row justify-content-center align-items-center">'+
                        '<div class="p-2 col col-3 text-center b-r">'+
                        '<img src="./images/currency/dog2.png" style="width: 30px;">'+
                        '</div>'+
                        '<div class="p-2 col col-7">'+
                        '<h5 class="text-capitalize">DogeCoin</h5>'+
                        '<small class="text-muted trn">'+
                        '</small><small class="text-muted"></small>'+
                        '</div>'+
                        '<div class="p-0 col col-2">'+
                        '<small class="text-muted text-uppercase">DOGE <i class="fa fa-chevron-right"></i></small>'+
                    '</div></div></div>'+
                    '</div></div>')              

                    break;
                case 2:
                    var monto_parcial = app.getTotalPagado(r.transacciones);
                    var diferencia = r.crypto.total_con_fee - monto_parcial;
                    diferencia = diferencia.toFixed(8);
                    var address_sonic = r.crypto.nombre.toLowerCase()+':'+r.crypto.wallet+'?amount='+diferencia;
                    var address = r.crypto.wallet;
                    template =
                    $('<div>', {'class': 'stage-body'}).append(
                        app.createInfoCrytoSelected(r),
                        app.createInfoPay(r),
                        $('<div>', {
                            'class': 'card-body p-b-0'
                        }).append(''),
                            $('<div>', {
                                'class': 'card p-b-0 d-flex justify-content-center rounded waves-effect'
                            }).append(
                            
                                $('<div>', {
                                    'class': 'row col col-md-12 m-t-20 m-b-20'
                                }).append('<div class="col col-md-6 b-r text-center">'+
                                               '<button class="btn btn-dark btn-sm text-center qrMore" onclick="activeQrMore()">QR +</button>'+
                                               '<button type="button" class="btn btn-secondary btn-sm text-center qr" onclick="activeQr()">QR</button>'+
                                            '</div>'+                                         
                                            '<div class="col col-md-6 text-center">'+
                                                '<button type="button" class="btn btn-secondary btn-sm text-center c_sonic" onclick="activeSonic()">Sonic</button>'+
                                                '<button type="button" class="btn btn-dark btn-sm text-center c_ultra" onclick="activeUltrasonic()">Ultrasonic</button>'+                                            
                                            '</div>'+
                                        '</div>'                              
                                    ),
                                    $('<div>', {
                                        'class': 'row col col-md-12 m-t-20 m-b-20'
                                    }).append('<div class="col col-md-6 b-r text-center">'+
                                               '<input id="parcial" type="hidden" value="'+diferencia+'"/>'+
                                               '<input id="qr_seleted" type="hidden" value="qrMore"/>'+
                                               '<input id="messageQrMore" type="hidden" value="'+address_sonic+'"/>'+
                                               '<input id="messageQr" type="hidden" value="'+address+'"/>'+
                                               '<div id="qrCodeMore" class="m-t-10"></div>'+
                                               '<a class="text-info m-t-10 copy trn" onclick="copiarDir()" style="font-size: 12.5px;" data-wallet="'+r.crypto.wallet+'">Copiar dirección <i class="fa fa-copy"></i></a>'+
                                               '<span class="msj_copied d-none trn badge badge-default float-center m-t-5 m-l-10">Copiado!</span>'+                                               
                                            '</div>'+                          
                                            '<div class="col col-md-6 m-t-40 text-center">'+
                                                '<input id="sonic_seleted" type="hidden" value="SONIC"/>'+
                                                '<input id="send_message" type="hidden" class="form-control" placeholder="Message to send" value="'+address_sonic+'"/>'+
                                                '<div id="send_image" class="text-center" style="margin: -40px 0 0 0"><img src="images/sonic/sending_animated.png" width="110" height="80" /></div>'+
                                                '<div id="send_image_end" class="text-center d-none" style="margin: -40px 0 0 0"><img src="images/sonic/sending.png" width="110" height="80" /></div>'+
                                            '</div>'+
                                    '</div>'                              
                                )

                            ),
                            
                        ).ready(function () {                            
                            activeQrMore();
                            activeSonic();
                        });                    
                    app.createTableTransaction(r, template);

                    break;
                case 3:
                    template =
                    $('<div>', {'class': 'stage-body'}).append(
                        app.createInfoCrytoSelected(r),
                        app.createInfoPay(r)
                    );
                    // Crear tabla de transacciones realizadas
                    app.createTableTransaction(r, template);
                    // Crear botón de retorno al sitio de origen
                    app.createButtonReturn(r, template);

                    break;
                case 4:
                    if (r.crypto === null) {
                        template =
                        $('<div>', {
                            'class': 'card-body card-height-fixed stage-body'
                        }).append(
                            $('<div>', {
                                'class': 'row text-center m-b-40 m-t-40'
                            }).append(
                                $('<div>', {
                                    'class': 'col col-12'
                                }).append(
                                    $('<i>', {'class': 'fas fa-times-circle fa-5x m-b-20'}),
                                    $('<h5>',{'class': 'trn'}).text('No ha seleccionado ninguna criptomoneda.')
                                )
                            )
                        );
                    } else {
                        template =
                        $('<div>', {'class': 'stage-body'}).append(
                            app.createInfoCrytoSelected(r),
                            app.createInfoPay(r)
                        );
                        // Crear tabla de transacciones realizadas
                        app.createTableTransaction(r, template);
                    }
                    // Crear botón de retorno al sitio de origen
                    app.createButtonReturn(r, template);

                    break;
            }            
            return template;
        },

        createForm: function(response)
        {
            etapa = (typeof r === "number")? response: response.etapa
            card = $('.card-stage')
            title = $('.loader__label').text()
            card.fadeOut().html('').fadeIn()

            // Titulo de la app
            var title =
            $('<div>', {
                'class': 'card-header bg-info'
            }).append(
                    $('<div>', {
                        'class': 'row col-md-12'
                    }).append('<div class="col-md-2 text-center">'+                            
                            '</div>'+                          
                            '<div class="col-md-8 text-center">'+
                                '<img src="./images/sonic/logo-sonicpay.png">'+
                            '</div>'+
                            '<div class="col-md-2 text-center">'+                            
                            '</div>'+
                            '</div>')
                /*$('<h2>', {
                    'class': 'card-title text-white text-center trn'
                }).text( title )*/
            );
            // Estatus de la transacción
            var endTime = moment();
            var status = (etapa > 0) ?
            $('<div>', {
                'class': 'status_payment card-header bg-status card-header-status text-white'
            }).append(
                $('<small>').append(
                    $('<i>', {'class': 'time_paymet fas fa-circle-notch fa-spin m-r-10'}),
                    $('<span>', {'class': 'msj_status text-status trn'}).text('En espera de pago')
                ),
                $('<strong>', {'class': 'float-right text-white clock'}).countdown(endTime.add(response.intervalo,'seconds').toDate()).on('update.countdown', function(event) {
                    $(this).text(event.strftime('%M:%S'));

                    if (event.offset.minutes < 2) {
                        $(".status_payment").removeClass('bg-status').addClass('bg-danger')
                        $(".msj_status").text('The invoice is about to expire.')
                    }
                })
                .on('finish.countdown', function(event) {
                    if (etapa === 3) {
                        $(".msj_status").text('')
                        $(".status_payment").removeClass('bg-status').addClass('bg-success text-center')
                        $(".msj_status").text('¡Factura pagada con éxito!')
                        $(".time_paymet").removeClass('fas fa-circle-notch fa-spin')
                    } else {
                        $(".msj_status").text('')
                        $(".status_payment").removeClass('bg-status').addClass('bg-danger')
                        $(".msj_status").text('Factura expirada.')
                        $(".time_paymet").removeClass('fas fa-circle-notch fa-spin')

                        if (etapa === 4) {
                            $(".msj_status").text('Factura expirada. Pago no completado.')
                        }
                    }
                })
            ) : '';
            // Información de la deuda a pagar
            var info = (etapa > 0) ?
            $('<div>', {
                'class': 'b-b card-body-payment bg-white'
            }).append(
                $('<small>', {
                    'class': 'text-muted trn'
                }).text('Monto a pagar USD. '),
                $('<small>', {
                    'class': 'text-muted trn'
                }).text(response.monto_bss),
                $('<small>', {
                    'class': 'text-muted trn'
                }).text(' (SIN REEMBOLSOS)'),

            ) : '';
            // template del estado de la transacción
            var stage = app.createTemplate(response);            
            return card.append(
                title,
                status,
                info,
                stage
            ).fadeIn(1000);
        },

        sendInvoiceRequest: function(invoice, crypto, resend)
        {            
            crypto = (typeof crypto !== 'undefined')? crypto: 0;

            var parameters = {invoice_number_pg: invoice}

            if (crypto > 0) {
                parameters = {invoice_number_pg: invoice,crypto_id: crypto}
            }
            var lang_origen = $(".idioma").val();
            _t.lang(lang_origen); 
            $.ajax({
                url: app.api,
                method: 'POST',
                type: 'json',
                accept: "application/json",
                contentType: "application/json",
                data: JSON.stringify(parameters),
                success: function (response) {
                    app.currentInvoice = response;                    
                    if (Object.keys(response).length > 0) {
                        if (resend && response.etapa === 2) {
                            $('#card-transacciones tbody tr').remove();
                            var parcial = $("#parcial").val();
                            console.log("refresh amount"); 
                            var monto_parcial = app.getTotalPagado(response.transacciones);
                            var diferencia = response.crypto.total_con_fee - monto_parcial;
                            diferencia = diferencia.toFixed(8);                      
                            if (parcial!=diferencia)
                            {
                                $("#parcial").val(diferencia);                                
                                var address_sonic = response.crypto.nombre.toLowerCase()+':'+response.crypto.wallet+'?amount='+diferencia;                                
                                $("#messageQrMore").val(address_sonic);
                                $("#send_message").val(address_sonic);
                                if ($("#qr_seleted").val()=='qrMore')
                                {
                                    activeQrMore();    
                                }
                                else
                                {
                                    activeQr();
                                }
                                if ($("#sonic_seleted").val()=='SONIC')
                                {
                                    activeSonic();                    
                                }
                                else
                                {
                                    activeUltrasonic();                    
                                }
                                
                            }                                  
                            app.createTableTransaction(response, $('.stage-body'))                            
                        } else {
                            if ($('.stage-body').length) {
                                $('.stage-body').fadeOut().remove()
                            }                            
                            app.createForm(response)
                        }
                        loader.fadeOut(1000);
                    }
                },
                error: function (error) {                    
                    app.createForm(error.status);
                    loader.fadeOut(1000);                    
                }
            });            
        },

        getURLParameter: function(sParam)
        {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');

            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam)
                {
                    return sParameterName[1];
                }
            }
        }
    };

    app.initialize()
    app.sendInvoiceRequest(app.invoice);    
    setInterval(function() {
        if (app.currentInvoice !== undefined && app.currentInvoice.etapa === 2) {            
            app.sendInvoiceRequest(app.invoice, undefined, true);            
        }        
    }, app.interval);
    setInterval(function() {
        app.translate();
    }, 500);
               

});

function copiarDir(){
    console.log("Copied");    
    $(".msj_copied").removeAttr("style");
    $(".msj_copied").removeClass('d-none');  
    $(".msj_copied").fadeOut(4000);  
}
//active QR
function activeQrMore(){
    $('#qr_seleted').val('qrMore');
    $('#qrCodeMore').find('canvas').remove();
    $('#qrCodeMore').qrcode({width: 100,height: 100,text: $("#messageQrMore").val() });         
    //button
    $(".qrMore").removeClass('btn-secondary');
    $(".qrMore").addClass('btn-dark');
    $(".qr").removeClass('btn-dark');
    $(".qr").addClass('btn-secondary');
    $(".copy").addClass('d-none');
}
function activeQr(){  
    $('#qr_seleted').val('qr');
    $('#qrCodeMore').find('canvas').remove();
    $('#qrCodeMore').qrcode({width: 100,height: 100,text: $("#messageQr").val() });             
    //button
    $(".qr").removeClass('btn-secondary');
    $(".qr").addClass('btn-dark');
    $(".qrMore").removeClass('btn-dark');
    $(".qrMore").addClass('btn-secondary');
    $(".copy").removeClass('d-none');
}
//active ultrasonic
function activeUltrasonic(address){    
    $('#sonic_seleted').val('ULTRASONIC');
    console.log(currentSession);
    if (currentSession!=undefined)
    {
        closeSession();
        currentSession = undefined;
    }
    //button
    $(".c_ultra").removeClass('btn-secondary');
    $(".c_ultra").addClass('btn-dark');
    $(".c_sonic").removeClass('btn-dark');
    $(".c_sonic").addClass('btn-secondary');
    //service
    hostService = sonicauth.SonicAuth.getHostService();    
    //active
    callUltrasonic('ULTRASONIC',address);
}
function activeSonic(address){      
    $('#sonic_seleted').val('SONIC');  
    console.log(currentSession);
    if (currentSession!=undefined)
    {
        closeSession();
        currentSession = undefined;
    }
    $(".c_sonic").removeClass('btn-secondary');
    $(".c_sonic").addClass('btn-dark');
    $(".c_ultra").removeClass('btn-dark');
    $(".c_ultra").addClass('btn-secondary');
    //service
    hostService = sonicauth.SonicAuth.getHostService();    
    //active
    callUltrasonic('SONIC',address);
}
//call ultrasonic
var hostService;
var currentSession;   
function callUltrasonic(method_ser,address){   
    console.log("presionando enviar"); 
    console.log('callUltrasonic'+method_ser); 
    setTimeout(openCloseSession(method_ser,address),500);
}
function openCloseSession(method_ser,address) {      
    //$("#send_start_stop").find(".txt").text('Cargando....');
    if (typeof currentSession === "undefined")
        openNewSession(method_ser,address);
    else
        closeSession();
}
function onOpenNewSessionSuccess(session) {
    currentSession = session;
    Log.add("New session successfully opened with ID: " + session.getId());
    currentSession.watchAnyClientChannelProperty(DemoSettings.CLIENT_CHANNEL_DATA_KEY, clientChannelPropertyHandler);
    //$("#send_image").removeClass('d-none');    
}
function onOpenNewSessionError(error) {    
    //$("#send_image").addClass('d-none');
}
function openNewSession(method_ser,address) {      
    var soundMode = getSoundMode(method_ser);//getSoundMode($("#send_sound_mode").find("option:selected").text());        
    var dataToSend = $("#send_message").val();//address;//'prueba';
    var sessionConfig = new sonicauth.SessionConfig.Builder()
        .appName(DemoSettings.APPLICATION_NAME)
        .password(DemoSettings.SESSION_PASSWORD)
        .maxClientChannels(DemoSettings.SESSION_MAX_CLIENT_CHANNELS)
        .maxTime(DemoSettings.SESSION_MAX_TIME)
        .soundMode(soundMode)
        .payload(dataToSend)
        .build();
    Stopwatch.start();
    hostService.openNewSession(sessionConfig, sonicauth.SoundDataOperation.DOWNLOAD, undefined, function (callbackResult) {
        if (callbackResult.isSuccess())
        {
            onOpenNewSessionSuccess(callbackResult.getResult());            
        }            
        else
        {
            onOpenNewSessionError(callbackResult.getError());
        }            
        
        Stopwatch.stop();
    });
    $("#send_image").removeClass("d-none");
    $("#send_image_end").addClass("d-none");    
    //console.log("Creating session...");  

}
function onCloseSessionSuccess() {
    if (typeof currentSession !== "undefined") 
    {
        console.log("Session: " + currentSession.getId() + " was closed");
        currentSession = undefined;    
        $("#send_image").addClass("d-none");
        $("#send_image_end").removeClass("d-none");  
        $(".c_ultra").addClass('btn-secondary');
        $(".c_ultra").removeClass('btn-dark');
        $(".c_sonic").removeClass('btn-dark');
        $(".c_sonic").addClass('btn-secondary'); 
    } 
}
function onCloseSessionError(error) {
    console.log(error);
    var ex_p = '';
}
function closeSession() {
    Stopwatch.start();
    //console.log(currentSession);   
    if (typeof currentSession !== "undefined") 
    {
        currentSession.close(function (callbackResult) {
            if (callbackResult.isSuccess())
                onCloseSessionSuccess(callbackResult.getResult());
            else
                onCloseSessionError(callbackResult.getError());
            Stopwatch.stop();
        });
        currentSession.stopPlaySound();
        console.log("Closing session: " + currentSession.getId());    
    }
}
function clientChannelPropertyHandler(event) {
    if (event.isSuccess()) {
        switch (event.getEventCause()) {
            case sonicauth.EventCause.SUBSCRIPTION:
                currentSession.playSoundData(function (result) {
                    if (!result.isSuccess()) {
                        console.log(result.getError());
                    }
                });
                break;
            case sonicauth.EventCause.EVENT:
                onClientChannelPropertyChanged(event);
                break;
        }
    } else {
        onClientChannelPropertyValueError(event.getError())
    }
}
function onClientChannelPropertyChanged(event) {
    console.log("Client channel property " + event.getProperty().getName()
        + " changed in the client channel: " + event.getClientChannelId()
        + " session: " + currentSession.getId());
    if (event.getProperty().getName() === DemoSettings.CLIENT_CHANNEL_DATA_KEY && event.getProperty().getValue() === event.getClientChannelId())
        closeSession();
}
function onClientChannelPropertyValueError(error) {
    console.log("ClientChannel property changed event response fail because: " + error);
} 


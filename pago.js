    // Initialize openpgp
    let openpgp = window.openpgp;
    var openPgpWorkerPath = "{{ asset('/js/openpgp/dist/openpgp.worker.js') }}";

    openpgp.initWorker({path: openPgpWorkerPath});

    // put keys in backtick (``) to avoid errors caused by spaces or tabs
    const pubkey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v3.1.3
Comment: https://openpgpjs.org

xsBNBFyUAcUBB/9vGswL314ZWKNls1zY92HtVkV/H28m2FKohUN98tDjPN/U
NxUVZ/sjHT6p4ngtdGgWWM6acmX1132hKSEFiKXUO7CtrIv9e6mEK8I2gefU
J/FYRDZwQYAZLcs7EfmH/k/4dA+ZRbyv1pyylU43cHj3Ut7cFSVUHErGlqat
9hA1J+x5q3DtBMoKC7VVBVsJji2f5n+QlErbEtjEHdYLQjaVE44wmzftv1tF
S/aDhZdixn3gRERiDpqW5vEUt2qwTUg+mZUALwKff7nTfekdHfxsp30FErBM
mTLAhpX/pNPrG8z+/RbNq3E7j8orndsVRVx9BNy317ZFkNZ06zKNgMw9ABEB
AAHNIkVjby1DcnlwdG8gPGVjb2NyeXB0b0BwYnNjb2luLmNvbT7CwHUEEAEI
ACkFAlyUAcUGCwkHCAMCCRAv9NYUTEDvggQVCAoCAxYCAQIZAQIbAwIeAQAA
q8QH/R8hOwRNreUK9RX1/lj2eWbSOwblcEdQHSOPcoH5FFRHsotGmAUZ+EMW
74K8U4UbEcBAzpcvfasnDETJg4UFjtZCcxuwA+Gpr0T0Fd5YfiE78DqHISXr
3+c/BBi0jg1ywK4Zd95HjdYpFi2TqXyXGBUd0qDF1yWdNyEloksLkgqDDHNz
KvTDUtZjFhSFMLGBhF1PVYLS4y9d5qS1gEY9P3/8DvXs6pf/m2lwH6MmB1ql
BWJvWbMIvVdn6l9zvKuTjRDERCCFa/aAOOTQT38TMcg7hZjvR2I+Fw15aTmQ
RBJYqU3kJ4SaDSa94GQY5XdKjlJwW4k6myann9WFah/O5S/OwE0EXJQBxQEH
/38z2P7kM24QKm4a9nK3KtoaeFfXIzibx03ukRWVpaMFaQqHcIXdLyu+Xzj1
MKd63X3EBKQ7pU960F1+izua05HpWsSW/V2fAAJ7ltSALOgP3XruCxGNyzT+
SeuxjFW20jaOeZP1Sw8iF2PMdOJUIY7UYjfuutMXRetU1XAqOg0jg3U7dG+r
0AfRSqL97THaQTUXsuj+PWNUbotXqaVU/HYVSTuSUU+Buc04+ePNfUT7NTlM
yvmrWE7/u8OG9hXk3LTyFGoX8HSSe50/fzu/FrFEdXadurkIkOqfZf/CtEt6
GjVQ3SBpA/jrTAa7ew6485OBkVdXlD0DxjJYF2zP+NEAEQEAAcLAXwQYAQgA
EwUCXJQBxQkQL/TWFExA74ICGwwAADjfB/9tla7/3csC2S2XLAyCzBZYSKMe
SAsJKpB+iyRxO3tHESK0bxxdOsgvi0FT4gAYoBK/q+IfczeBV0tfEtQOcQtA
ryAMwpyj88lxHyrIIKoxx5Qgo0WCKP8q5RaGYUJ6g8XdMlmwIuUYXB9yTeAF
mAbe2luQ+qf2fU4Mld9B8PIGjSqi9UXLqvFxHY4TEUaPPKlhV2wJM+1OV/vB
iFqY6huclcfKNm4eY4K2GzunsIYrEfotGdU0+PUzSu743/NKK3wgjU893P/E
OPq0D0LnEI+shhJOO+TBFOq1PIBeElRY+dp5KUJ8M+dvp7Din/CCsxJMYeO9
Mppqq/qU662Sfo4G
=+wQC
-----END PGP PUBLIC KEY BLOCK-----`;
    const encryptFunction = async(message,publicKey) => {
        var encrypted;

        const options = {
            message: openpgp.message.fromText(message),      
            publicKeys: (await openpgp.key.readArmored(publicKey)).keys,
        }
        
        return openpgp.encrypt(options).then(ciphertext => {
            encrypted = ciphertext.data 
            return encrypted
        })
    }

    function b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    }

    function VerificarPago(){
        $(".solicitud_pago").each(function(){             
            var id = $(this).data('id');           
            var id_confirmacion_pago = $(this).data('id-confirmacion');           
            var confirmada = $(this).data('confirmada');           
            var element_estatus = "solicitud_pago_estatus_"+id_confirmacion_pago;         
            var element_confirmacion = "solicitud_pago_confirmacion_"+id_confirmacion_pago;
            var element_monto = "solicitud_pago_monto_"+id_confirmacion_pago;     
            if ($("#"+element_confirmacion).val()===''){
                var json = {"client":"{{config('api.user')}}"};
                var message =JSON.stringify(json);                   
                encryptFunction(message,pubkey).then(function(value) {
                    var pgpParametros = value;                    
                    var b64Parametros = b64EncodeUnicode(pgpParametros);
                    $.ajax({
                        type: 'POST',
                        url: '{{ url('verificarPago') }}',
                        data: {
                            '_token': $('input[name=_token]').val(),
                            'id_confirmacion_pago': id_confirmacion_pago,                        
                            'id_solicitud_pago': id,                                            
                            'parameters': b64Parametros,                        
                        },
                        success: function(data) {                                
                            $("#saldo_persona").text(data.saldo_persona);
                            if (data.result === 'validada'){
                                if (data.error===''){
                                    $("#"+element_estatus).text('PAGO CONFIRMADO');
                                    $("#"+element_monto).text(data.monto);
                                    $("#"+element_estatus).removeClass('label-danger').addClass('label-success');
                                    $("#"+element_confirmacion).val(data.fecha_confirmacion.date);
                                    toastr.success('PAGO CONFIRMADO!', 'SOLICITUD', {timeOut: 5000});
                                }else if (data.error==='amount_incorrect'){
                                    $("#"+element_estatus).text('PAGO CONFIRMADO');
                                    $("#"+element_monto).text(data.monto);
                                    $("#"+element_estatus).removeClass('label-danger').addClass('label-success');
                                    $("#"+element_confirmacion).val(data.fecha_confirmacion.date);
                                    toastr.error('SOLICITUD DE PAGO RECHAZADA POR: PAGO INCOMPLETO!', 'Alerta Error', {timeOut: 5000});
                                }
                            }else{
                                if(data.error==='transaction_invalid'){
                                    $("#"+element_estatus).text('PAGO NO CONFIRMADO');
                                    $("#"+element_monto).text('---');
                                    $("#"+element_estatus).removeClass('label-danger');
                                    $("#"+element_confirmacion).val(data.fecha_confirmacion.date);
                                    toastr.error('SOLICITUD DE PAGO RECHAZADA POR: TRANSACCIÓN NO VÁLIDA!', 'Alerta Error', {timeOut: 5000});
                                    $('table#tabla_historial_pago tr#table_confirmacion_id_'+id_confirmacion_pago).remove();
                                }else if(data.error==='error_connection'){
                                    return false;
                                }                                
                            }                       
                        },
                    });
                });
            }
        });       
    }     

    
    function openModal(tipo,id){
        $('#solicitudesModal').modal('show');   
        var id_solicitud_pago = id;                    
        $('#tabla_detalle_solicitud tbody').each(function() {
            $(this).find("tr").remove();    
        });
        $("#id_solicitud_pago").val('');
        $("#monto").val('');
        $(".monto_total_pagar").text('');
        $.ajax({
            type: 'POST',
            url: '{{ url('consultarDetalleSolicitudPago') }}',
            data: {
                '_token': $('input[name=_token]').val(),
                'id_solicitud_pago': id_solicitud_pago,                        
            },
            success: function(data) {                                            
                if ((data.errors)) {
                    console.log('errors',data.errors);
                } else {                         
                    $("#id_solicitud_pago").val(data.id_solicitud_pago);
                    $("#monto").val(data.total_pagar);
                    $.each(data.detalles, function(key, value) {                                                       
                        $('#tabla_detalle_solicitud').append('<tr>'+
                                                                '<td>'+value.solicitud.serial+'</td>'+
                                                                '<td class="text-capitalize">'+value.solicitud.tipo.nombre+'</td>'+
                                                                '<td>'+value.monto+'</td>'+
                                                                '</tr>');
                    });
                    $(".monto_total_pagar").text(data.total_pagar);                    
                }
            },
        });
    }    

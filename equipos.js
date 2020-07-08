        function TotalDireccionesEquipo()
        {            
            $("#contador_equipos_direcciones").val(0);
            $.ajax({
                type: 'GET',                
                url: "{{ url('totales') }}",
                data: {
                    'id': '{{encrypt($registro->id)}}',                    
                },
                success: function(data) {                    
                    //verificar la cantidad de equipo                    
                    $.each(data.total_equipos_direccion, function(key,value) {                                                  
                        $.each(value, function(k,val) {                                                              
                            if (k=='resta')
                            {         
                                if (val>0 || val<0)
                                {   
                                    $("#contador_equipos_direcciones").val(1);
                                }
                            }
                        });  
                    });  
                    $("#contador_direcciones").val(data.total_direcciones);
                    $("#contador_equipo_por_direcciones").val(data.total_equipos_por_direcciones);
                    $("#contador_equipos").val(data.total_equipos);                    
                },
            });
        }

        //validar formulacio de direccion       
        $('#form-add-direccion').validate({
             rules: {
                
                alias: {
                    required: true,
                    minlength:2,
                    maxlength: 191
                },              
                id_estado: {
                    required: true,
                    min: 1              
                },                
                id_municipio: {
                    required: true,
                    min: 1              
                },                
                id_parroquia: {
                    required: true,
                    min: 1              
                },                
                direccion: {
                    required: true,
                    minlength: 5,                
                    maxlength: 191
                },
                coordenada_latitud: {
                    required: true,
                    minlength: 9,                
                    maxlength: 10
                },
                coordenada_longitud: {
                    required: true,
                    minlength: 9,                
                    maxlength: 10
                },        
                cantidad_equipos:{
                    required: true,
                    min: 1,                
                },    
            },
            messages: {            
                id_estado: "Este campo es obligatorio",            
                id_municipio: "Este campo es obligatorio",            
                id_parroquia: "Este campo es obligatorio",           
            },    

            highlight: function (element) {
            // Only validation controls
                $(element).closest('.form-control').removeClass('is-valid').addClass('is-invalid');
            },
            unhighlight: function (element) {
                // Only validation controls
                    $(element).closest('.form-control').removeClass('is-invalid').addClass('is-valid');
            },
            errorElement: "div",
            errorPlacement: function (error, element) {
                var elm = $(element);

                if (elm.prop('type') == 'checkbox' || elm.prop('type') == 'radio') {
                    error.appendTo(elm.closest(':not(input, label, .checkbox, .radio)').first());
                } 
                else
                {
                    error.insertAfter(elm);
                }
            },   
        
        });        
               
        function agregarDireccion()
        {                       
            $.ajax({
                type: 'POST',
                url: '{{ route('rim.solicitudes.uso_direccion.store') }}',
                data: {
                    '_token': $('input[name=_token]').val(),
                    'actualizacion': 1,                    
                    'cantidad_equipos': $('#cantidad_equipos').val(),
                    'id_estado': $('#id_estado').val(),
                    'id_municipio': $('#id_municipio').val(),
                    'id_parroquia': $('#id_parroquia').val(),
                    'direccion': $('#direccion').val(),
                },
                success: function(data) {                                        
                    if ((data.errors)) {
                        setTimeout(function () {
                            $('#addDireccionModal').modal('show');
                            toastr.error('Error de Validación!', 'Alerta Error', {timeOut: 5000});
                        }, 500);
                        $(".error").remove();
                        $.each(data.errors, function( key, value ) {                              
                            if ($("#"+key+'-error').length == 0)
                            {
                                $('<div id="'+key+'-error" class="error">'+value+'</div>').insertAfter($("#"+key));
                            }
                        });                        
                    } else {
                        toastr.success('Agregada correctamente!', 'Ubicación', {timeOut: 5000});
                        TotalDireccionesEquipo();                        
                        getDirecciones('{{auth()->user()->id}}');                                                   
                        table_dir.ajax.reload();                   
                    }
                },
            });
        }

         
        function modificarDireccion()
        {
            var id = [];            
            $.ajax({
            type: 'PUT',                
                url: "{{ route('update',['valor']) }}",
                data: {
                    '_token': $('input[name=_token]').val(),
                    'id': $("#id_direccion").val(),                    
                    'cantidad_equipos': $('#cantidad_equipos').val(),
                    'id_estado': $('#id_estado').val(),
                    'id_municipio': $('#id_municipio').val(),
                    'id_parroquia': $('#id_parroquia').val(),
                    'direccion': $('#direccion').val(),
                },
                success: function(data) {                    
                    if ((data.errors)) {
                        setTimeout(function () {
                            $('#addDireccionModal').modal('show');
                            toastr.error('Error de Validación!', 'Alerta Error', {timeOut: 5000});
                        }, 500);                            
                        $(".error").remove();
                        $.each(data.errors, function( key, value ) {  
                            if ($("#"+key+'-error').length == 0)
                            {
                                $('<div id="'+key+'-error" class="error">'+value+'</div>').insertAfter($("#"+key));
                            }
                        }); 
                    } else {
                        toastr.success('Modificada correctamente!', 'Ubicación', {timeOut: 5000});
                        TotalDireccionesEquipo();
                        getDirecciones('{{auth()->user()->id}}'); 
                        table_dir.ajax.reload();                   
                    }
                },
            });
        }        
       
        /////validacion equipo
        $('#form-add-equipo').validate({
             rules: {
                id_tipo_equipo: {
                    required: true,
                    min: 1              
                },
                id_marca: {
                    required: {
                        depends: function(element) {
                            return ($('select[name="id_tipo_equipo"] option:selected').attr('data-multi-tarjeta')==0);
                        }
                    },
                    min: 1              
                }, 
                id_modelo: {
                    required: {
                        depends: function(element) {
                            return ($('select[name="id_tipo_equipo"] option:selected').attr('data-multi-tarjeta')==0);
                        }
                    },
                    min: 1              
                }, 
                serial: {
                    required: {
                        depends: function(element) {
                            return ($('select[name="id_tipo_equipo"] option:selected').attr('data-multi-tarjeta')==0);
                        }
                    }
                },                 
                hash: {
                    required: {
                        depends: function(element) {
                            return ($('select[name="id_tipo_equipo"] option:selected').attr('data-multi-tarjeta')==0);
                        }
                    }
                }, 
                id_moneda: {
                    required: true,
                    min: 1              
                }, 
                id_algoritmo: {
                    required: true,
                    min: 1              
                }, 
                mac_address: {
                    required: true,
                    minlength: 17
                },                
                id_uso_direcciones: {
                    required: true,
                    min: 1              
                },                                
                contador: {
                    required: {
                        depends: function(element) {
                            return ($('select[name="id_tipo_equipo"] option:selected').attr('data-multi-tarjeta')==1);
                        }
                    },
                    number: true,
                    min: 2,

                }, 
            },
            messages: {
                id_tipo_equipo: "Este campo es obligatorio",            
                id_moneda: "Este campo es obligatorio",   
                id_algoritmo: "Este campo es obligatorio",   
                id_marca: "Este campo es obligatorio",   
                id_modelo: "Este campo es obligatorio",                   
            },
            /*submitHandler: function(form) {                
                
            },*/        
            highlight: function (element) {
            // Only validation controls
                $(element).closest('.form-control').removeClass('is-valid').addClass('is-invalid');
            },
            unhighlight: function (element) {
                // Only validation controls
                    $(element).closest('.form-control').removeClass('is-invalid').addClass('is-valid');
            },
            errorElement: "div",
            errorPlacement: function (error, element) {
                var elm = $(element);

                if (elm.prop('type') == 'checkbox' || elm.prop('type') == 'radio') {
                    error.appendTo(elm.closest(':not(input, label, .checkbox, .radio)').first());
                } 
                else
                {
                    error.insertAfter(elm);
                }
            },           
        });
        
        //ELIMINAR TARJETA    
        function deleteTarjeta(val)
        {
            var $contador = $("#contador");
            var act_contador = parseInt($contador.val()) - 1;        
            $contador.val(act_contador);
            $('table#tabla_tarjetas tr#'+val).remove();
        }   
       
        function agregarEquipo()
        {
            var modelo = [];
            var keyModelo = 0;
            $('input[name="ar_tarjeta_modelo[]"]').each(function() {
                modelo[keyModelo]= $(this).val();
                keyModelo++;
            });
            var marca = [];
            var keyMarca = 0;
            $('input[name="ar_tarjeta_marca[]"]').each(function() {
                marca[keyMarca]= $(this).val();
                keyMarca++;
            });
            var serial = [];
            var keySerial = 0;
            $('input[name="ar_tarjeta_serial[]"]').each(function() {
                serial[keySerial]= $(this).val();
                keySerial++;
            });
            var hash = [];
            var keyHash = 0;
            $('input[name="ar_tarjeta_hash[]"]').each(function() {
                hash[keyHash]= $(this).val();
                keyHash++;
            });         
            var tipo_hash = [];
            var keyTipoHash = 0;
            $('input[name="ar_tarjeta_tipo_hash[]"]').each(function() {
                tipo_hash[keyTipoHash]= $(this).val();
                keyTipoHash++;
            });          
   
            $.ajax({
                type: 'POST',
                url: '{{ route('rim.solicitudes.uso_equipo.store') }}',
                data: {
                    '_token': $('input[name=_token]').val(),
                    'id_certificado_uso': $('#add_equipo_id_certificado_uso').val(),
                    'actualizacion': 1,                    
                    
                    'ar_tarjeta_modelo': modelo,
                    'ar_tarjeta_marca': marca,
                    'ar_tarjeta_serial': serial,
                    'ar_tarjeta_hash': hash,
                    'ar_tarjeta_tipo_hash': tipo_hash,
                },
                success: function(data) {                    
                    //console.log(data);              
                    if ((data.errors)) {                        
                        if (data.errors.maximo)
                        {
                            toastr.error(data.errors.maximo, 'Alerta Error', {timeOut: 5000});
                        }
                        else if (data.errors.mac_duplicada)
                        {
                            setTimeout(function () {
                                $('#addEquipoModal').modal('show');
                                toastr.error(data.errors.mac_duplicada, 'Alerta Error', {timeOut: 5000});
                                if ($("#mac_address-error").length == 0)
                                {
                                    $('<div id="mac_address-error" class="error">Dirección Mac Address ya registrada</div>').insertAfter($("#mac_address"));
                                }
                                $("#muestra_tab_datos").trigger('click');                                                
                            }, 500);
                        }
                        else
                        {                            
                            setTimeout(function () {
                                $('#addEquipoModal').modal('show');
                                toastr.error('Error de Validación!', 'Alerta Error', {timeOut: 5000});
                            }, 500);
                        }
                        $(".error").remove();
                        $.each(data.errors, function( key, value ) {                                                          
                            if ($("#"+key+'-error').length == 0)
                            {
                                $('<div id="'+key+'-error" class="error">'+value+'</div>').insertAfter($("#"+key));
                            }
                        });                        
                    } else {
                        toastr.success('Agregado correctamente!', 'Equipo', {timeOut: 5000});                        
                        $('table#tabla_tarjetas tr').remove();
                        $("#tab_tarjetas").addClass('disable_tab');
                        $("#muestra_tab_datos").trigger('click');                                                
                        $('#contador').val(0);
                        TotalDireccionesEquipo();
                        tableEquipos.ajax.reload();
                    }
                },
            });
        }
      
        function addTarjetaEdit($arreglo,)
        {               
            $.each($arreglo, function(k,val) {  
                var $contador = $("#contador");
                var act_contador = parseInt($contador.val()) + 1;                         
                var $id = '';
                var $modelo = '';
                var $marca = '';
                var $id_modelo = '';
                var $id_marca = '';
                var $serial = '';
                var $hash = '';
                var $tipo_hash = '';
                $.each(val, function(k1) {                                                  
                    if (k1=='id')
                    {
                        $id = this;
                    }
                    if (k1=='id_marca')
                    {
                        $id_marca = this;
                    }
                    if (k1=='id_modelo')
                    {
                        $id_modelo = this;
                    }
                    if (k1=='marca')
                    {
                        $marca = this;
                    }
                    if (k1=='modelo')
                    {
                        $modelo = this;
                    }
                    if (k1=='serial')
                    {
                        $serial = this;
                    }
                    if (k1=='hash')
                    {
                        $hash = this;
                    }
                    if (k1=='tipo_hash')
                    {
                        $tipo_hash = this;
                    }
                });                       
                $('#tabla_tarjetas').append('<tr id='+act_contador+'>'+
                '<td><div  onclick="deleteTarjeta('+act_contador+')"><i class="fas fa-trash"></i></div></td>'+ 
                '<td style="vertical-align: top"><b>'+$modelo+'</b>'+                       
                    '<input type="hidden" name="ar_tarjeta_id[]" id="ar_tarjeta_id[]" value="'+$id+'">'+
                    '<input type="hidden" name="ar_tarjeta_modelo[]" id="ar_tarjeta_modelo[]" value="'+$id_modelo+'">'+
                    '<input type="hidden" name="ar_tarjeta_marca[]" id="ar_tarjeta_marca[]" value="'+$id_marca+'">'+
                    '<input type="hidden" name="ar_tarjeta_serial[]" id="ar_tarjeta_serial[]" value="'+$serial+'">'+
                    '<input type="hidden" name="ar_tarjeta_hash[]" id="ar_tarjeta_hash[]" value="'+$hash+'">'+
                    '<input type="hidden" name="ar_tarjeta_tipo_hash[]" id="ar_tarjeta_tipo_hash[]" value="'+$tipo_hash+'">'+
                '</td>'+            
                '<td style="vertical-align: top"><b>'+$modelo+'</b>'+
                '<td style="vertical-align: top"><b>'+$serial+'</b></td>'+
                '<td style="vertical-align: top"><b>'+$hash+' '+$tipo_hash+'</b></td>'+            
                '</tr>');                  
                $contador.val(act_contador);           
            });
        }  
        
        //update equipo       
        function modificarEquipo()
        {
            var id = [];
            var keyId = 0;
            $('input[name="ar_tarjeta_id[]"]').each(function() {
                id[keyId]= $(this).val();
                keyId++;
            });
            var modelo = [];
            var keyModelo = 0;
            $('input[name="ar_tarjeta_modelo[]"]').each(function() {
                modelo[keyModelo]= $(this).val();
                keyModelo++;
            });
            var marca = [];
            var keyMarca = 0;
            $('input[name="ar_tarjeta_marca[]"]').each(function() {
                marca[keyMarca]= $(this).val();
                keyMarca++;
            });
            var serial = [];
            var keySerial = 0;
            $('input[name="ar_tarjeta_serial[]"]').each(function() {
                serial[keySerial]= $(this).val();
                keySerial++;
            });
            var hash = [];
            var keyHash = 0;
            $('input[name="ar_tarjeta_hash[]"]').each(function() {
                hash[keyHash]= $(this).val();
                keyHash++;
            });   
            var tipo_hash = [];
            var keyTipoHash = 0;
            $('input[name="ar_tarjeta_tipo_hash[]"]').each(function() {
                tipo_hash[keyTipoHash]= $(this).val();
                keyTipoHash++;
            });          
            $.ajax({
                type: 'PUT',                
                url: "{{ route('rim.solicitudes.uso_equipo.update',['valor']) }}",
                data: {
                    '_token': $('input[name=_token]').val(),
                    'id_equipo': $("#id_equipo").val(),                                        
                    'id_tipo_equipo': $('#id_tipo_equipo').val(),
                    'id_uso_direcciones': $('#id_uso_direcciones').val(),
                    'ar_tarjeta_id': id,
                    'ar_tarjeta_modelo': modelo,
                    'ar_tarjeta_marca': marca,
                    'ar_tarjeta_serial': serial,
                    'ar_tarjeta_hash': hash,
                    'ar_tarjeta_tipo_hash': tipo_hash,
                },
                success: function(data) {                    
                    //console.log(data);              
                    if ((data.errors)) {
                        if (data.errors.maximo)
                        {
                            setTimeout(function () {
                                $('#addEquipoModal').modal('show');
                                toastr.error(data.errors.maximo, 'Alerta Error', {timeOut: 5000});
                            }, 500);
                        }
                        else
                        {
                            setTimeout(function () {
                                $('#addEquipoModal').modal('show');
                                toastr.error('Error de Validación!', 'Alerta Error', {timeOut: 5000});
                            }, 500);
                        }
                        $(".error").remove();
                        $.each(data.errors, function( key, value ) {                              
                            if ($("#"+key+'-error').length == 0)
                            {
                                $('<div id="'+key+'-error" class="error">'+value+'</div>').insertAfter($("#"+key));
                            }
                        });                        
                    } else {
                        toastr.success('Modificado correctamente!', 'Equipo', {timeOut: 5000});
                        $('table#tabla_tarjetas tr').remove();
                        $('#contador').val(0);
                        TotalDireccionesEquipo();
                        tableEquipos.ajax.reload();
                    }
                },
            });
        }
                
        function actualizarValor(campo,value,tiempo)
        {        
            setTimeout(function(){ 
                $("#"+campo).val(value).trigger('change');                
            }, tiempo);
            
        }
       
        //mascara macAddress
        var macAddress = $("#mac_address");
        function formatMAC(e) {
            var r = /([a-f0-9]{2})([a-f0-9]{2})/i,
                str = e.target.value.replace(/[^a-f0-9]/ig, "");

            while (r.test(str)) {
                str = str.replace(r, '$1' + ':' + '$2');
            }

            e.target.value = str.slice(0, 17);
        };
        macAddress.on("keyup", formatMAC);
        
        var  des = $('#muestra_des');    
        var datos_equipo = $("#datos_equipo");
        des.hide();   
        datos_equipo.hide();     
          
        function enableFormGpu(){          
            datos_equipo.hide();
            $("#id_modelo").removeAttr('required');
            $("#id_marca").removeAttr('required');
            $("#serial").removeAttr('required');
            $("#hash").removeAttr('required');        
            $("#id_tipo_hash").removeAttr('required');        
            //activar la pestana de equipos
            $("#tab_tarjetas").removeClass('disable_tab');                
        }
        function disableFormGpu(){        
            datos_equipo.show();
            $("#id_modelo").attr('required','true');
            $("#id_marca").attr('required','true');
            $("#serial").attr('required','true');
            $("#hash").attr('required','true');        
            $("#id_tipo_hash").attr('required','true');        
            //inactivar la pestana de equipos
            $("#tab_tarjetas").addClass('disable_tab');
        } 
       
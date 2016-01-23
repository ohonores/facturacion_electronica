var request = require("request");
var zlib = require('zlib');
var packer = require('zip-stream');
var fs = require('fs');
var nodeExcel = require('excel-export');
var postgres;
var postgres2;
var nohayresultados = "No se econtraron registros.";
var servletWS;
var monitorArchivos;
var tareaProgramada;
module.exports = function(app, postgres_, postgres2_, supportCrossOriginScript, servletWS_,monitorArchivos_,tareaProgramada_) {
	servletWS = servletWS_;
   var grabarBytes = true;
/*	servletWS.getInfoComprobantesElectronicosRecibidos('0602573073001','alien200525',{anio:2015,mes:12,dia:0},grabarBytes, function(datos){


    	for(var i in datos){

    		console.log(datos[i])
    		enviarJsonParaGrabarRecepcioDocumentos(datos[i],'0990018707001',{"busqueda":{anio:2015,mes:11,dia:0}},grabarBytes, function(res){
    			console.log(res)
    		})

    	}
    });*/
	postgres = postgres_;
	postgres2 = postgres2_;
	monitorArchivos = monitorArchivos_;
	tareaProgramada = tareaProgramada_;
	//*****************
	//CONSULTANDO LAS EMPRESAS
	//Codigo 013
	//*****************
	app.get('/consultar/empresas/1', function(req, res) {

		consultarempresas(res);

	});
	//*****************
	//CONSULTANDO LOS  CLIENTES POR ID
	//Codigo 014
	//*****************
	app.get('/consultar/clientes/id/:id', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		if(verficarInjections({id:req.params.id})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarclientesporid(req.params.id, res);
		}
	});

	//*****************
	//CONSULTANDO TODOS LOS DCUMENTOS ES DECIR EL CODIGO Y EL NOMBRE COMO 01 FACTURA, ETC
	//Codigo 015
	//*****************
	app.get('/consultar/documentos/sri', supportCrossOriginScript,isUserAutenficado, function(req, res) {

		consultartipodocumentos(res);

	});
	
	//*****************
	//OJO ESTE ES PARA EL USUARIO 
	//CONSULTANDO LOS MOVIMIENTOS POR CRITERIO
	//POR FECHA
	//POR EMPRESA
	//POR IDENTIFICACION
	//POR LIMITE
	//LLAMADO DESDE APP_JQUERY_MOV.JS
	//Codigo 016
	//*****************
	app.get('/consultar/movimientos-criteria/por-receptor-fecha/:empresa/:identificacion/:limite',  supportCrossOriginScript, isUserAutenficado, function(req, res) {
		if(verficarInjections({empresa:req.params.empresa,limite:req.params.limite,identificacion:req.params.identificacion})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarmovimientosPorClienteFechaLimite(req.params.identificacion,req.params.empresa, req.params.limite,res);
		}

	});
	
	//*****************
	//OJO ES PARA EL ADMINISTRADOR
	//CONSULTANDO LOS MOVIMIENTOS POR CRITERIO
	//POR FECHA
	//POR EMPRESA
	//POR IDENTIFICACION
	//POR LIMITE
	//LLAMADO DESDE APP_JQUERY_MOV.JS
	//Codigo 017
	//*****************
	
	app.get('/consultar/movimientos-criteria/por-fecha-now-desc/:empresa/:limite',  supportCrossOriginScript, isUserAutenficado, function(req, res) {
		if(verficarInjections({empresa:req.params.empresa,limite:req.params.limite})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarmovimientosPorFechaLimite(req.params.empresa,req.params.limite,res);
		}

	});
	
	//********************
	//CONSULTAR MOVIMIENTOS POR EMPRESA E IDENTIFICAION
	//TOTAL DE REGISTROS
	//Codigo 018
	//*********************
	
	app.get('/consultar/movimientos-criteria-total/por-usuario/:empresa/:identificacion',  supportCrossOriginScript,isUserAutenficado, function(req, res) {
		 if(verficarInjections({empresa:req.params.empresa,identificacion:req.params.identificacion})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarmovimientosTotalRegistros(req.params.empresa,req.params.identificacion,res);
		}

	});

	
	//*****************
	//SERVICIO, BUSQUEDA DE CLIENTES 
	//Codigo 019
	//*****************
	app.get('/consultar/clientes/criterio/:sql', supportCrossOriginScript, isUserAutenficado, function(req, res) {
	    if(verficarInjections({sql:req.params.sql})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarclientesporcriterio(req.params.sql, res);
		}
   });
    //*****************
	//SERVICIO, CONSULTAR EMPRESA POR ID
	//Codigo 020
	//*****************
	app.get('/consultar/empresa/id/:q', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		if(verficarInjections({q:req.params.q})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarEmpresasPorId(req.params.q,res);
		}
	});
	//*****************
	//SERVICIO, CONSULTAR EMPRESAS POR ID
	//Codigo 021
	//*****************
	
	app.get('/consultar/empresas/id/:q', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		if(verficarInjections({q:req.params.q})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarEmpresasPorId(req.params.q,res);
		}

	});
	//*****************
	//CONSULTAR MOVIMIENTOS POR CRITERIO
	//Codigo 022
	//*****************
	app.all('/consultar/movimientos-criteria/:json', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		var jsondata = JSON.parse(req.params.json);
		console.log(jsondata);
		if(verficarInjections(jsondata)){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			var resultados = [];
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
		}else{
			consultarmovimientosPorCriterios(jsondata.identificacion, jsondata.criterio,  jsondata.referenciaDoc, jsondata.estado,jsondata.tipodoc, jsondata.finicio,jsondata.ffin, jsondata.empresa, jsondata.limite, jsondata.idLimite, jsondata.avanzar,jsondata.edi, jsondata.emailsEnviados, res);
		}
	});
	
	app.all('/consultar/productos-criteria/:json', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		var jsondata = JSON.parse(req.params.json);
		console.log(jsondata);
		if(verficarInjections(jsondata)){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			var resultados = [];
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
		}else{
			consultarproductosPorCriterios(jsondata.identificacion, jsondata.criterio,  jsondata.referenciaDoc, jsondata.estado,jsondata.tipodoc, jsondata.finicio,jsondata.ffin, jsondata.empresa, jsondata.limite, jsondata.idLimite, jsondata.avanzar,jsondata.edi, res);
		}
	});
	
	app.all('/consultar/productos-documento-criteria/:json', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		var jsondata = JSON.parse(req.params.json);
		console.log(jsondata);
		if(verficarInjections(jsondata)){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			var resultados = [];
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
		}else{
			consultandoFacturasPorProducto(jsondata.identificacion, jsondata.empresa, jsondata.codigo, res);
		}
	});
	
	app.all('/consultar/productos-empresa-criteria/:json', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		var jsondata = JSON.parse(req.params.json);
		console.log(jsondata);
		if(verficarInjections(jsondata)){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			var resultados = [];
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
		}else{
			consultandoCantidadesPorProductoPorEmpresa(jsondata.empresa,jsondata.identificacion,jsondata.criterio,jsondata.finicio,jsondata.ffin, jsondata.comparacion_cantidad,jsondata.comparacion_precio,jsondata.comparacion_total,jsondata.comparacion_descuento,jsondata.comparacion_iva, jsondata.comparacion_totalconiva, res);
		}
	});
	
	
	
	
	//*****************
	//CONSULTAR MOVIMIENTOS BITACORA POR ID
	//Codigo 023
	//*****************
	
	app.get('/consultar/movimientos-bitacora/:movimiento_id', supportCrossOriginScript,isUserAutenficado, function(req, res) {
		if(verficarInjections({movimiento_id:req.params.movimiento_id})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.jsonp([]);
		}else{
			consultarmovimientosbitacora(req.params.movimiento_id,res);
		}

	});

	//*****************
	//CONSULTAR RUC EN SRI
	//Codigo 024
	//*****************
	
	
	app.get('/verificar-ruc/:tipo/:ruc', supportCrossOriginScript, function(req, res){
		if(verficarInjections({tipo:req.params.tipo,ruc:req.params.ruc})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			var respuesta = {"code":"OPCION NO ENCONTRADA","formato":"/verificar-ruc/:tipo/:ruc","ejemplo":"/verificar-ruc/1/1714784252001","tipo":"1->formato tabla; 2->formato json"};
			res.send(respuesta);
		}else{
			if(req.params.tipo){
				if(req.params.tipo == 1 || req.params.tipo == 2 && (req.params.ruc && req.params.ruc.length ===13)){
					//Primero se hace la busqueda en la base de datos:
					//El parametro 1, busca el punto emision 1 y nos entrega la direccion de la sucursal principal
					postgres.buscarRucJson(req.params.ruc,1, function(resultado){
							if(resultado != false && resultado && resultado.ruc){
								switch(req.params.tipo){
									case "1":
										res.send(getTableFromJson(resultado));
									break;
									case "2":
										res.send(resultado);
									break;
								}

							}else{
								//El parametro 2, busca el primer registro que se encuentre activo
								postgres.buscarRucJson(req.params.ruc,2, function(resultado2){
                                	if(resultado2 != false && resultado2 && resultado2.ruc){
                                		switch(req.params.tipo){
                                			case 1:
												res.send(getTableFromJson(resultado2));
                                			break;
                                			case 2:
                                				res.send(resultado2);
                                			break;
                                		}
                                	}else{

                                		//En caso que no lo encuentre lo extrae del sri
										servletWS.revisarRucNuevaVersion(req.params.ruc,req.params.tipo, function(resultado3){
																res.send(resultado3);
										});
									}
								});
							}

					});





				}else{
					var respuesta = {"code":"OPCION NO ENCONTRADA","formato":"/verificar-ruc/:tipo/:ruc","ejemplo":"/verificar-ruc/1/1714784252001","tipo":"1->formato tabla; 2->formato json"};
					res.send(respuesta);
				}
			}
		}

	});
	//*****************
	//CONSULTAR CEDULA EN SRI 
	//https://www.datoseguro.gob.ec/web/guest/consulta-cne
	//Codigo 025
	//*****************
	app.get('/verificar-cedula/:cedula', supportCrossOriginScript, function(req, res){
		if(verficarInjections({tipo:req.params.tipo,ruc:req.params.ruc})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.send({encontrada:false,mensaje:'Cedula no valida, la cedula debe estar compuesta de 10 digitos'});
		}else{
			if(req.params.cedula && req.params.cedula.length == 10){
				/***********************
					BASE DE DATOS
				***********************/
				postgres.buscarUsuarioJson(req.params.cedula, function(resultado){	
					if(resultado == false){
						/***********************
							CNE
						***********************/
						
						servletWS.getInfoCedula(req.params.cedula, function(resultado){
								 
							  if(resultado && resultado.encontrado == false && resultado.cancelar != true){
									servletWS.getInfoCedula(req.params.cedula, function(resultado1){
										
										res.send(resultado1);
										
									});
							  }else{
								res.send(resultado);
							  }
						});
						
					}else{
						
						res.send(resultado);
					}
				});
				
				
			}else{
				res.send({encontrada:false,mensaje:'Cedula no valida, la cedula debe estar compuesta de 10 digitos'});
			}
		}
	});
	
	app.get('/verificar-cedula/2/:cedula', supportCrossOriginScript, function(req, res){
		if(verficarInjections({tipo:req.params.tipo,ruc:req.params.ruc})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.send({encontrada:false,mensaje:'Cedula no valida, la cedula debe estar compuesta de 10 digitos'});
		}else{
			if(req.params.cedula && req.params.cedula.length == 10){
				/***********************
							CNE
				***********************/
						
				servletWS.getInfoCedula2(req.params.cedula, function(resultado){
								 
							  if(resultado && resultado.encontrado == false && resultado.cancelar != true){
									servletWS.getInfoCedula2(req.params.cedula, function(resultado1){
										
										res.send(resultado1);
										
									});
							  }else{
								res.send(resultado);
							  }
						
						
				});
				
				
			}else{
				res.send({encontrada:false,mensaje:'Cedula no valida, la cedula debe estar compuesta de 10 digitos'});
			}
		}
	});
	/*************************************************
		MAGAP
		//Codigo 026
	**************************************************/
	app.get('/magap/beneficiario/:ruc', supportCrossOriginScript, function(req, res){
		if(verficarInjections({tipo:req.params.tipo,ruc:req.params.ruc})){
			var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.send({encontrada:false,mensaje:'Ruc no valido, la cedula debe estar compuesta de 13 digitos'});
		}else{
			getInfoMagapClienteBeneficiario(req.params.ruc, res);
		}
	});
	/************
		ACTUALIZAR INFORMACION DEL CLIENTE
			//Codigo 027
	************/
	app.all('/actualizar-infomracion-cliente/json',supportCrossOriginScript, isUserAutenficado, function(req, res){
		garbarjsonactualizacion(req.body,res);
    });
	/************
		GRABAR Y ACTUALIZAR INFORMACION DEL USAURIO
		//Codigo 028
	************/
	app.all('/actualizar-infomracion-usuario/json',supportCrossOriginScript, isUserAutenficado, function(req, res){
		var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		grabarjson_usuario(ip, req.user.username, JSON.stringify(req.body),res);
    });
	/************
		GRABAR Y ACTUALIZAR INFORMACION DEL USAURIO
		//Codigo 0281
	************/
	app.get('/infomracion-usuarios-creados/json',supportCrossOriginScript, isUserAutenficado, function(req, res){
		var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		listarjson_usuario(res);
    });
	
	/**************
	Leer ride
	//Codigo 029
	*************/
	app.get('/ride/tipo/:tipo/:download/id/:id/:doc', function(req, res, next) {
		 
		  var contentType;
		  var extension='.txt';
		  switch(req.params.tipo){
			case 'ride':
				contentType = 'application/pdf';
				extension = '.pdf';
			break;
			case 'xmlsri':
				contentType = 'application/octet-stream';
				extension = '.xml';
			break;
			case 'xmlfirmado':
				contentType = 'application/octet-stream';
				extension = '.xml';
			break;
			case 'xmlorigen':
				contentType = 'application/octet-stream';
				extension = '.xml';
			break;
		  }
		  consultarBlob(req.params.id, req.params.doc, req.params.tipo,contentType,req.params.download,extension, res);
	});

	/**************
    	Leer ride por clave de acceso
    	//Codigo 029
    	*************/
    	app.get('/download/:tipo/:claveacceso', function(req, res, next) {

				if("1234".indexOf(req.params.tipo)<0){
					res.json('TIPO no acepatado:: 1 para xml ; 2, 3  para el ride y 4 para zip');
					return;
				}
				if(isNaN(req.params.claveacceso)){
						res.json('Clave de acceso '+req.params.claveacceso+ ' No aceptada');
                		return;
				}

				  var contentType;
				  var extension='.txt';
				  var columnablob = "";
				  switch(req.params.tipo){

				  	case '3':
					case '2':
						contentType = 'application/pdf';
						extension = '.pdf';
						columnablob="ride";
						break;
					case '1':
						contentType = 'application/octet-stream';
						extension = '.xml';
						columnablob="xmlsri";
						break;
					case '4':
						columnablob = "ride, xmlsri"
						break;

				  }
				  consultarDocs(req.params.tipo,req.params.claveacceso,columnablob,contentType,extension, res);

    	});
	
	/*************************************
	Grabando configuracion del sistema
	Monitoreo

	*************************************/
	app.all('/actualizar-configuracion-sistema/json',isUserAutenficado,function(req, res){

		
		garbarjsonconfiguracion_observer(req.body.id, JSON.stringify(req.body),res);
		
	});

	app.get('/eliminar-configuracion-sistema/json/:id',isUserAutenficado,function(req, res){
		eliminarjsonconfiguracion_observer(req.params.id,res);
		
	});
	app.get('/consultar-obs/configuraciones-obs/obs/', isUserAutenficado, function(req, res){
		consultarDatosConfiguracion(res);
	});
	app.get('/consultar-obs/configuraciones-obs/detalle/:detalle', isUserAutenficado, function(req, res){
		
		consultarDatosConfiguracionPorDetalle(req.params.detalle, res);
	});
	app.put('/robot-email-invalidos/json/', isUserAutenficado, function(req, res){
		servletWS.procesarRobotEmailsInvalidos(JSON.stringify(req.body), function(respuesta){
			res.send(respuesta)
		});
	});
	
	app.get('/consultar-lista-errores-sri/', isUserAutenficado, function(req, res){
		consultarConceptosSRI(res);
	});
	
	/***********************************
			USUARIOS CONECTADOS
	*************************************/
	app.all('/consultar-usuarios/conectaos/json', isUserAutenficado, function(req, res){
	   getUsuariosConectados(JSON.stringify(req.body), res);
	});
	
	/*************************************
		ANULACION DE UN DOCUMENTO AUTORIZADO POR EL SRI
	**************************************/
	app.get('/anulacion-doc/:permiso/:claveacceso', supportCrossOriginScript, function(req, res){
		
		 var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		 if(verficarInjections({permiso:req.params.permiso,claveacceso:req.params.claveacceso})){
			
			console.log(ip + ' :: INTENTO HACER UNA INJECTION DE UN CODIGO '+jsondata);
			res.send({encontrada:false,mensaje:'Error al querer anular'});
		}else{
			setAnulacionDocumentoAutorizado(req.params.permiso,req.params.claveacceso,ip,res);
		}
	});
	
	
	/*********************************
		TOTALES AGRUPADOS POR ESTADO
	**********************************/
	app.get('/consultar/estados/agrupados', isUserAutenficado, function(req, res){
		postgres.getTotalesAgrupadosPorEstado(function(resultado){
			res.json(resultado)
		});
	});
	app.get('/consultar/ride/no/creados', isUserAutenficado, function(req, res){
		postgres.getTotalesAgrupadosPorEstadoRide(function(resultado){
			res.json(resultado)
		});
	});
	
	/****************
		ELIMINAR MOVIMIENTO
	******************/
	app.get('/delete/movimiento/creados/:id', isUserAutenficado, function(req, res){
		console.log("/delete/movimiento/creados/");
		console.log(req.params.id);
		console.log(req.user);
		eliminarMovimientoBaseDatos(req.params.id,req.user, function(resultado){
			res.json(resultado)
		});
	});
	
	
	/*********************************
		TIPOS DE HILOS
	**********************************/
	app.get('/consultar/tipos/hilos/:grupo', isUserAutenficado, function(req, res){
		servletWS.getTiposRobots(req.params.grupo,res);
	});
	/*********************************
		TIPOS DE Estados
	**********************************/
	app.get('/consultar/tipos/estados', isUserAutenficado, function(req, res){
		servletWS.getEstadosEdi(res);
	});
	/*********************************
    		ACTIVAR ROBOT ADMIN NOTIFIACICIONES
    **********************************/
    app.get('/robotAdminEnviarNotificacion/:codigo', isUserAutenficado, function(req, res){
console.log("/robotAdminEnviarNotificacion/:codigo");
        console.log(req.params.codigo);
    	servletWS.robotAdminEnviarNotificacion(req.params.codigo,function(resultado){
              res.json(resultado)
        });
    });



	/*********************************
		GET DATABASE SIZE
	**********************************/
	app.get('/consultar/database/size', isUserAutenficado, function(req, res){
		postgres2.getTamanioDB(function(resultado){
			res.json(resultado)
		});
	});
	
	/*********************************
		GET REGISTROS EN FORMA DINAMICA
	**********************************/
	app.all('/consultar/registros-criterio/:columnas/:tabla/:columna/:valor',supportCrossOriginScript, isUserAutenficado, function(req, res){
		consultarRegistrosDinamicamenteClausulaWhereIgual(req.params.columnas, req.params.tabla, req.params.columna, req.params.valor, 
			function(respuesta){
				res.jsonp(respuesta);
			}
		);
		
	});
	
	/************
		GRABAR Y ACTUALIZAR FACTURA JSON
		
	************/
	app.all('/actualizar-informacion-facturajson/json',supportCrossOriginScript, isUserAutenficado, function(req, res){
		console.log("/actualizar-informacion-facturajson/json");
		actualizarYEnivarFacturaJson(JSON.stringify(req.body),function(respuesta){
				res.jsonp(respuesta);
			});
    });
	
	/************
		SUBIR ARCHIVOS
		
	************/
	app.all('/subir-archivos/:empresa',supportCrossOriginScript, isUserAutenficado, function(req, res){
		console.log("/subir-archivos/");
		var attachments = [];
		var nombres = [];
		if(req.files && req.files.file && Array.isArray(req.files.file)){
			console.log("SI es array");
			for( index in req.files.file){
				attachments.push(fs.createReadStream(req.files.file[index].path));
				nombres.push(req.files.file[index].name);
			}
			servletWS.enviarArchivosWS(attachments, "alien200525",nombres,req.params.empresa, function(resp_){
					res.jsonp(resp_);
					return;
			});
		}else{
			if(req.files && req.files.file && req.files.file.path){
				console.log("No es array");
				console.log(req.files.file.path);
				attachments = [
					fs.createReadStream(req.files.file.path)
				]
				nombres = [
					req.files.file.name
				]
				servletWS.enviarArchivosWS(attachments, "alien200525",nombres,req.params.empresa, function(resp_){
					res.jsonp(resp_);
					return;
				});
			}
		}
		
    });
    /************
    		SUBIR ARCHIVOS

    	************/
    	app.all('/subir-archivos-noautentificacion/:empresa',supportCrossOriginScript, function(req, res){
    		console.log("//subir-archivos-noautentificacion/");
    		var attachments = [];
    		var nombres = [];
    		console.log(req.files);
    		if(req.files && req.files.file && Array.isArray(req.files.file)){
    			console.log("SI es array");
    			for( index in req.files.file){
    				attachments.push(fs.createReadStream(req.files.file[index].path));
    				nombres.push(req.files.file[index].name);
    			}
    			servletWS.enviarArchivosWS(attachments, "alien200525",nombres,req.params.empresa, function(resp_){
    					res.jsonp(resp_);
    					return;
    			});
    		}else{
    			console.log("No es array");
console.log("No es array");
				for(key in req.files){


					if(req.files[key] && req.files[key].path){
						console.log("No es array");
						console.log(req.files[key].path);
						attachments = [
							fs.createReadStream(req.files[key].path)
						]
						nombres = [
							req.files[key].name
						]
						servletWS.enviarArchivosWS(attachments, "alien200525",nombres,req.params.empresa, function(resp_){
							res.jsonp(resp_);
							return;
						});
					}
    			}
    		}

        });
    app.all('/subir-archivos-xml/sri',supportCrossOriginScript, isUserAutenficado, function(req, res){
    		console.log("/subir-archivos-xml/sri");
    		var attachments = [];

    		if(req.files && req.files.file && Array.isArray(req.files.file)){
    			console.log("SI es array");
    			for( index in req.files.file){
    				attachments.push(fs.createReadStream(req.files.file[index].path));
    			}
    			servletWS.enviarArchivoXmlWS(attachments, "alien200525", function(resp_){
                     res.jsonp(resp_);
                });
    		}else{
    			if(req.files && req.files.file && req.files.file.path){

    				attachments = [
    					fs.createReadStream(req.files.file.path)
    				]

    				servletWS.enviarArchivoXmlWS(attachments, "alien200525", function(resp_){
                        	res.jsonp(resp_);
                    });
    			}
    		}

        });
	//Enviar xml al sri por medio del upload



	/************
		BAJAR ARCHIVOS
		
	************/
	app.get('/bajar-archivos/:id', isUserAutenficado, function(req, res){
		consultarArchivos(req.params.id,res);
	});
	/************
		ELIMINAR ARCHIVOS
		
	************/
	app.get('/eliminar-archivos/:id', isUserAutenficado, function(req, res){
		eliminarArchivosDatos(req.params.id,res);
	});
	
	/************
		GRABAR  WEB SERVICE CONFI
		
	************/
	app.all('/grabar-configWS/', supportCrossOriginScript,isUserAutenficado, function(req, res){
	     console.log("grabar-configWS");
		grabarConfiguracionesWebservice(JSON.stringify(req.body),function(resultado){
			console.log(resultado);
			res.json(resultado);
		});
	});
	/************
    		GRABAR  EMPRESA

    	************/
    	app.all('/grabar-empresa/', supportCrossOriginScript,isUserAutenficado, function(req, res){
    	     console.log("grabar-empresa");
    		grabarEmpresa(JSON.parse(JSON.stringify(req.body)),function(resultado){
					res.json(resultado);
    		});
    	});
	/************
		ELIMINAR ws
		
	************/
	app.get('/eliminar-ws/:id', isUserAutenficado, function(req, res){
		eliminarConfWS(req.params.id,res);
	});
	
	
	/************
		get configuracion ws
		
	************/
	app.get('/get-configWS/:empresa', isUserAutenficado, function(req, res){
		getConfiguracionesWebservice(req.params.empresa,function(resultado){
			res.json(resultado);
		});
	});
	
	/************
		GET INFO ARCHIVO P12
		
	************/
	app.all('/getInformacionWOIEWEKSDISD/', supportCrossOriginScript,isUserAutenficado, function(req, res){
		console.log(req.user);
		var datos =req.body;
		getInfoArchivop12(datos.archivo, datos.clave,req.user.perfil,datos.empresa,function(resultado){
			res.json(resultado);
		});
	});
	
	/************
		ACTUALIZAR WS
	****************/
	app.get('/actualizar-ws/:empresa', isUserAutenficado, function(req, res){
		servletWS.actualizarWS(req.params.empresa, function(resp_){
					res.jsonp(resp_);
			return;
		});
	});
	
	/************
		ENVIAR O AUTORIZAR UN ARCHIVO XML
	****************/
	app.get('/enviar-autorizar-xml/:tipo/:id', isUserAutenficado, function(req, res){
		console.log("/enviar-autorizar-xml/*********");
		servletWS.procesarRoborEdiEnviarAutorizarXmlSri(req.params.tipo,req.params.id, function(resp_){
					res.jsonp(resp_);
			return;
		});
	});
	
	/************
		VALIDAR LOS DATOS CON EL SRI
	****************/
	app.get('/validar-cliente-sri-cne/:identificacion', isUserAutenficado, function(req, res){
		console.log("/validar-cliente-sri-cne/:identificacion/");
		garbarjsonactualizacionPersona(req.params.identificacion, function(resultado){
			res.jsonp(resultado);
		})
	
		
	});

	/************
		ACTUALIZAR EMAILS DE SWISSYSTEMA SWISSEDI
		Abierto para que se acceder desde oracle
	****************/
	app.get('/actualizar-email/:clave/:identificacion/:emails', function(req, res){
		if(req.params.clave === "alien"){
			getActualizarEmailPersona(req.params.identificacion, req.params.emails, function(respuesta){
				res.jsonp(respuesta);
			});
		}else{
		}
		
	});
	//GET Json
	app.get('/clientes-reporte-json/:columnas/:identificacion/:uidd', function(req, res){
		getClientesFormatoJson(req.params.columnas,req.params.identificacion,req.params.uidd, function(resultado){
			res.jsonp(resultado)
		});
	
	});
	//GET EXCEL
	app.get('/clientes-reporte/:tipo/:labels/:columnas',isUserAutenficado, function(req, res){
		console.log(req.params.tipo);
		switch(req.params.tipo){
			case 'excel':
				getClientesFormatoExcel(req.params.columnas,req.user.perfil, function(resultado){
				
					var conf ={};
					conf.stylesXmlFile = "styles.xml";
					conf.cols = [];
					for(var i=0;i<req.params.labels.split(',').length;i++){
						conf.cols.push({
						caption:req.params.labels.split(',')[i],
						type:'string',
						beforeCellWrite:function(row, cellData){
							 return cellData ? cellData.toUpperCase():cellData;
						},
						width:30
					   
						});
					}
					conf.rows = [];
					for(var i=0;i<resultado.length;i++){
						var fila = [];
						for(var y=0;y<req.params.columnas.split(',').length;y++){
							if(req.params.columnas.split(',')[y] == "tipoidentificacion"){
								switch(resultado[i][req.params.columnas.split(',')[y]]){
									case '04':
										fila.push("RUC");
									break;
									case '05':
										fila.push("CEDULA");
									break;
									case '06':
										fila.push("PASAPORTE");
									break;
									case '07':
										fila.push("VENTA A CONSUMIDOR FINAL*");
									break;
									case '08':
										fila.push("IDENTIFICACION DELEXTERIOR*");
									break;
									case '09':
										fila.push("PLACA");
									break;
									
								}
							}else{
								fila.push(resultado[i][req.params.columnas.split(',')[y]]);
							}
							
						}
						conf.rows.push(fila);
					}
					
					var result = nodeExcel.execute(conf);
					res.setHeader('Content-Type', 'application/vnd.openxmlformats');
					res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
					res.end(result, 'binary');
					
					
				});
			break;
			case 'json':
				res.jsonp("EN MANTENIMIENTO");
			break;
			case 'html':
			res.jsonp("EN MANTENIMIENTO");
			break;
		}
	
  	
		
	
});

	
}


function supportCrossOriginScript(req, res, next) {
	
    res.status(200);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type,content-Type, accept, X-Requested-With");
    res.header("Access-Control-Allow-Methods","POST, GET, OPTIONS, DELETE, PUT, HEAD");
	res.header("Access-Control-Request-Method","POST, GET, OPTIONS, DELETE, PUT, HEAD");
	res.header("Access-Control-Request-Headers","content-Type, accept");
	next();
}
function consultarempresas(res){
	var query = "SELECT ruc||' '||descripcion||' '||codigo as query,ruc,id,descripcion,codigo,mensaje,urllogo, true as mostrar FROM swissedi.eeditempresa ";
    postgres.getPoolClienteConexion(query, null, function(resultado){
		if(resultado){
			res.json(resultado.rows);
		}else{
			res.json(nohayresultados);
				
		}
	});

}

function consultarBlob(id, documento, columnablob,contentType,download, extension, res){
   try{
		var query = '';
		
		query = "SELECT claveacceso,serie||'-'||comprobante as doc,:columna FROM swissedi.eeditmovimiento where id=$1";
		
		query = query.replace(':columna',columnablob);
		postgres.getPoolClienteConexion(query, [id], function(resultado){
			if(resultado){
				if(resultado.rows && resultado.rows[0] && resultado.rows[0][columnablob] && resultado.rows[0][columnablob].length>0){
					if(contentType){
						if(download && download == 1){
						 res.set('Content-Disposition', 'attachment; filename="'+resultado.rows[0].doc+extension+'"');
						}
						res.writeHead(200, {"Content-Type": contentType});
						res.write(resultado.rows[0][columnablob]);
						res.end();
						
					}else{
						res.json(resultado.rows[0][columnablob])
					}
				   
			  }else{
				
				res.json("SWISSEDI: Documento no encontrado con el id "+id+", podria tratarse por que aun no se ha generado el ride ");
			  }
			}else{
				res.json(nohayresultados);
					
			}
		});
	}catch(error){
		res.json(nohayresultados);	
		console.log(error);
	}
}
function consultarDocs(tipo, claveacceso, columnablob,contentType,extension, res){
  try{
		var query = '';

		query = "SELECT claveacceso,serie||'-'||comprobante as doc,:columna FROM swissedi.eeditmovimiento where claveacceso=$1 and estado='A'";

		query = query.replace(':columna',columnablob);
		postgres.getPoolClienteConexion(query, [claveacceso], function(resultado){
			if(resultado){

				if(tipo === "4" && resultado.rows && resultado.rows[0] && resultado.rows[0]["ride"] && resultado.rows[0]["ride"].length>0 && resultado.rows[0]["xmlsri"] && resultado.rows[0]["xmlsri"].length>0){
					var archive = new packer(); // OR new packer(options)

                    archive.on('error', function(err) {
                      console.log(err);
                      res.json("SWISSEDI: Error al crar el archivo zip del xml y ride ");
                      return;
                    });
					var tmpFile = resultado.rows[0].doc+'.zip';

                    var ws = fs.createWriteStream(tmpFile);

                     archive.entry(resultado.rows[0]["ride"], { name: resultado.rows[0].doc+'.pdf' }, function(err, entry) {
						if (err) {
							console.log(err);
							res.json("SWISSEDI: Error al crar el archivo zip del xml y ride ");
                            return
                        }
                       	archive.entry(resultado.rows[0]["xmlsri"], { name: resultado.rows[0].doc+'.xml' }, function(err, entry) {
                         	if (err) {
				          		console.log(err);
                         		res.json("SWISSEDI: Error al crar el archivo zip del xml y ride ");
                         		return;
                            }else{archive.finish();
                              ws.on('finish', function() {

                              		fs.readFile(tmpFile, function(err, data)  {
                                                  // pipe done here, do something with file
                                                   	res.set('Content-Disposition', 'attachment; filename="'+resultado.rows[0].doc+".zip"+'"');
                                                  	res.writeHead(200, {"Content-Type": "application/octet-stream"});
                                                  	res.write(data);
                                                  	res.end();

                                   });
                               });
                            }
                        }).pipe(ws);

                     });
				}else{
					if(tipo && "123".indexOf(tipo)>=0 && resultado.rows && resultado.rows[0] && resultado.rows[0][columnablob] && resultado.rows[0][columnablob].length>0){

						if(contentType){
							if(tipo && "12".indexOf(tipo)>=0){
							  res.set('Content-Disposition', 'attachment; filename="'+resultado.rows[0].doc+extension+'"');
							}
							res.writeHead(200, {"Content-Type": contentType});
							res.write(resultado.rows[0][columnablob]);
							res.end();

						}else{
							res.json(resultado.rows[0][columnablob])
						}
					}else{
						res.json("SWISSEDI: Documento no encontrado con la calve de acceso "+claveacceso+", podria tratarse por que aun no se ha generado el ride ");
					}
				}

			}else{
				res.json(nohayresultados);

			}
		});
	}catch(error){
		res.json(nohayresultados);
		console.log(error);
	}
}

function consultarArchivos(id,res){
   try{
		var query = '';
		
		query = "SELECT  datos_binarios,infoadicioanal,nombre_archivo FROM swissedi.eediarchivos_datos where id=$1";
		
		postgres.getPoolClienteConexion(query, [id], function(resultado){
			if(resultado){
			//{"contentype":"application/octet-stream; charset\u003dISO-8859-1","size":10963}
				if(resultado.rows && resultado.rows[0] && resultado.rows[0].datos_binarios && resultado.rows[0].datos_binarios.length>0 && resultado.rows[0].infoadicioanal && resultado.rows[0].infoadicioanal.contentype){
					
						res.set('Content-Disposition', 'attachment; filename="'+resultado.rows[0].nombre_archivo+'"');
						res.writeHead(200, {"Content-Type": resultado.rows[0].infoadicioanal.contentype});
						res.write(resultado.rows[0].datos_binarios);
						res.end();
					
				   
			  }else{
				
				res.json("SWISSEDI: Documento no encontrado con el id "+id+", podria tratarse por que aun no se ha generado el ride ");
			  }
			}else{
				res.json(nohayresultados);
					
			}
		});
	}catch(error){
		res.json(nohayresultados);	
		console.log(error);
	}
}

function eliminarArchivosDatos(id,res){
   try{
   
		postgres.getPoolClienteConexion("select directorio||'/'||empresa_id||'/'||nombre_archivo as nombre from swissedi.eediarchivos_datos a join swissedi.eeditarchivos_conf b on a.archivoconf_id = b.id where a.id=$1",[id], function(resultado2){
			var query = "DELETE FROM  swissedi.eediarchivos_datos where id=$1";
		
			postgres.getPoolClienteConexion(query, [id], function(resultado){
				if(resultado && resultado.rowCount){
					res.json("Archivo con el id "+id+", eliminado existosamente");
				}else{
					res.json(nohayresultados);
						
				}
			});

			if(resultado2 && resultado2.rowCount>0){
				fs.unlink(resultado2.rows[0].nombre, function(err){
						//comprobamos si ha ocurrido algun error
						if(err){
							console.error(err);
						}
						//informamos de que el fichero ha sido eliminado
						else{
							console.log("fichero eliminado");
						}
				});
									
			}
		});
		
		
	}catch(error){
		res.json(nohayresultados);	
		console.log(error);
	}
}
function eliminarConfWS(id,res){
   try{
		
		var query = "DELETE FROM  swissedi.eeditconfiguraciones_webservice where id=$1";
		
		postgres.getPoolClienteConexion(query, [id], function(resultado){
			if(resultado && resultado.rowCount){
				res.json("Registro con el id "+id+", eliminado exitosamente");
			}else{
				res.json(nohayresultados);
					
			}
		});
	}catch(error){
		res.json(nohayresultados);	
		console.log(error);
	}
}


function consultarclientesporid(id,res){

	var sql = "SELECT true as cambiarinfo,  identificacion||' '||razonsocial||' '||email as query,* FROM swissedi.eeditpersona where estado='A' and id = $1";
    var criterios = [id];
	
	postgres.getPoolClienteConexion(sql, criterios, function(resultado){
		if(resultado){
			res.json(resultado.rows);
		}else{
			res.json(nohayresultados);
				
		}
	});
	
	
	
}
var fecheestilo='mdy';

function formatDate(d,separador,hora) {
 
 if(d instanceof Date){
	 var mm = d.getMonth()+1
	  if ( mm < 10 ) mm = '0' + mm
	  var dd = d.getDate();
	  if ( dd < 10 ) dd = '0' + dd

	  

	  var yy = d.getFullYear();
	  if ( yy < 10 ) yy = '0' + yy
	  if(hora && hora == true){
		switch(fecheestilo){
			case 'mdy':
			return '\''+mm+separador+dd+separador+yy+' 23:59:59\''
			case 'dmy':
			return '\''+dd+separador+mm+separador+yy+' 23:59:59\''
		}
	  }
	  switch(fecheestilo){
		case 'mdy':
		return '\''+mm+separador+dd+separador+yy+'\''
		case 'dmy':
		return '\''+dd+separador+mm+separador+yy+'\''
	  }
	
 }else{
	return formatDateV2(d,separador, hora);
  }
}

function formatDateV2(d,separador,hora) {
  if(d.split('-').length > 1){
	  d = d.replace(/-/g,'');
	  var dd = d.slice(6,8);
	  if ( dd.length < 2 ) dd = '0' + dd
	  var mm = d.slice(4,6)
	  if ( mm.length < 2 ) mm = '0' + mm
	  
	  var yy = d.slice(0,4);
	 
	
	if(hora && hora == true){
		 switch(fecheestilo){
			case 'mdy':
			return '\''+mm+separador+dd+separador+yy+' 23:59:59\''
			case 'dmy':
			return '\''+dd+separador+mm+separador+yy+' 23:59:59\''
		}
	  }
	 switch(fecheestilo){
		case 'mdy':
			return '\''+mm+separador+dd+separador+yy+'\'';
		case 'dmy':
			return '\''+dd+separador+mm+separador+yy+'\'';
	}
  }
  var dd = d.slice(0,2);
  if ( dd.length < 2 ) dd = '0' + dd
  var mm = d.slice(2,4)
  if ( mm.length < 2 ) mm = '0' + mm
  
  var yy = d.slice(4,8);
 
  if(hora && hora == true){
		 switch(fecheestilo){
			case 'mdy':
				return '\''+mm+separador+dd+separador+yy+' 23:59:59\''
			case 'dmy':
				return '\''+dd+separador+mm+separador+yy+' 23:59:59\''
		}
	}
	switch(fecheestilo){
		case 'mdy':
			return '\''+mm+separador+dd+separador+yy+'\'';
		case 'dmy':
			return '\''+dd+separador+mm+separador+yy+'\'';
	}
}


function consultarmovimientosPorClienteFechaLimite(clienteIdentificacion, empresa, limite, res){
	fechafin = formatDate(new Date(),'-');
	var criterios = []
	var clienteIdentificacion_;
	var limite_ = '';
	var fechafin_ = '';
	var empresa_ = '';
	var variables = 0;
	var variables = 0;
	if(fechafin){
	  criterios.push(fechafin);
	   variables = variables + 1;
		fechafin_ =" where m.fechacreacion <= $"+variables;
	 }
	if(clienteIdentificacion){
		criterios.push(clienteIdentificacion);	
		variables = variables + 1;
		clienteIdentificacion_ = ' and p.identificacion = $'+variables+'::varchar ';
		
	}
	 
	if(empresa && empresa.split(',') && empresa.split(',').length==1 && !isNaN(empresa)){
		criterios.push(empresa);
		variables = variables + 1;
		empresa_ = " and m.empresa_id=$"+variables+" and m.estado='A'";
	}else{
		if(empresa && empresa.split(',') && empresa.split(',').length>1 && !isNaN(empresa.split(',')[0])){
			criterios.push(empresa.split(',')[0]);
			variables = variables + 1;
			empresa_ = " and m.empresa_id=$"+variables+" and m.estado='A'";
		
		}
	}
	
	  
	  
	
	 if(limite){
		criterios.push(limite);
		variables = variables + 1;
		limite_ = ' limit  $'+variables;
		 
	 }
	  
	  
	var criterio = fechafin_ + clienteIdentificacion_ +  empresa_ + ' order by id desc ' + limite_;
	// var criterios = fechafin ? " where m.fechacreacion <= "+fechafin + clienteIdentificacion+" and m.empresa_id="+empresa+" and m.estado='A'   order by id desc  "+porLimite:"";
	
	// var sql = 'SELECT m.id,SUBSTR(m.observacion, 1, 3000) as observacion,p.razonsocial,p.identificacion,m.claveacceso,m.estado,m.comprobante,valor,numeroautorizacion,m.fechacreacion,m.serie,m.subtotal,m.descuento,m.impuesto1,m.impuesto2,m.tipo_proceso_xml,m.tipoemision,m.empresa_id,m.tipodocumentosri_id,m.fechasri, (select count(b1.id) from swissedi.eeditmovimiento_bitacora b1 where b1.conceptosri_id =106 and b1.movimiento_id=m.id ) as totalCorreo   FROM swissedi.eeditmovimiento m  join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id join swissedi.eeditpersona p on p.id=ep.persona_id '+criterio;
	 var sql = 'SELECT m.id,SUBSTR(m.observacion, 1, 3000) as observacion,p.razonsocial,p.identificacion,m.claveacceso,m.estado,m.comprobante,valor,numeroautorizacion,m.fechacreacion,m.serie,m.subtotal,m.descuento,m.impuesto1,m.impuesto2,m.tipo_proceso_xml,m.tipoemision,m.empresa_id,m.tipodocumentosri_id,m.fechasri  FROM swissedi.eeditmovimiento m  join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id join swissedi.eeditpersona p on p.id=ep.persona_id '+criterio;
	// var criterioABuscar = [clienteIdentificacion, porFecha];
	console.log(sql);
	postgres.getPoolClienteConexion(sql, criterios, function(resultado){
		if(resultado){
			res.json(resultado.rows);
		}else{
			res.json(nohayresultados);
				
		}
	});
	
	
}

function consultartipodocumentos(res){
	
			 postgres.getPoolClienteConexion("SELECT true as estado,id,codigo,descripcion,orden, id ||' '||codigo||' '||descripcion as query FROM swissedi.eedittipo_documento_sri order by id desc ", null, function(resultado){
				if(resultado){
					
					res.json(resultado.rows);
				}else{
					res.json(nohayresultados);
						
				}
			});
		
  
   
  
}


/*********************
	Funcion que permite obtener  registros de los movimientos
	por administrador segun el limite indicado
**********************/
function consultarmovimientosPorFechaLimite(empresa, limite, res){
	/*
		Maximo del limite son 1000 registros, por lo cual se valida que no supere esa cantidad
		Si lo supera se estable la cantidad maxima
	*/
	if(limite>1000){
		limite = 100;
	}
	var variables = 0;
	var criterios = [];
	if(empresa && empresa.split(',') && empresa.split(',').length==1 && !isNaN(empresa)){
		criterios.push(empresa);
		variables = variables + 1;
		empresa_ = " and m.empresa_id=$"+variables+" and m.estado='A'";
	}else{
		if(empresa && empresa.split(',') && empresa.split(',').length>1 && !isNaN(empresa.split(',')[0])){
			criterios.push(empresa.split(',')[0]);
			variables = variables + 1;
			empresa_ = " and m.empresa_id=$"+variables+" and m.estado='A'";
		
		}
	}
	/**************************************
		Estableciendo los criterios de busqueda para el administrador al iniciar la pagina.
		Este metodo obtiene los ultimos registros(fecha actual) y segun el limite indicado
	***************************************/
	
	console.log(limite);
	var porLimite = limite ? ' limit  '+limite : '';
	var porFecha = ' where m.fechacreacion <= now() '+empresa_+' order by id desc  '+porLimite;
	
	//var sql = 'SELECT m.id,SUBSTR(m.observacion, 1, 3000) as observacion,p.razonsocial,p.identificacion,m.claveacceso,m.estado,m.comprobante,valor,numeroautorizacion,m.fechacreacion,m.serie,m.subtotal,m.descuento,m.impuesto1,m.impuesto2,m.tipo_proceso_xml,m.tipoemision,m.empresa_id,m.tipodocumentosri_id,m.fechasri, (select count(b1.id) from swissedi.eeditmovimiento_bitacora b1 where b1.conceptosri_id =106 and b1.movimiento_id=m.id ) as totalCorreo FROM swissedi.eeditmovimiento m left join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id join swissedi.eeditpersona p on p.id=ep.persona_id '+porFecha;
	var sql = 'SELECT m.id,SUBSTR(m.observacion, 1, 3000) as observacion,p.razonsocial,p.identificacion,m.claveacceso,m.estado,m.comprobante,valor,numeroautorizacion,m.fechacreacion,m.serie,m.subtotal,m.descuento,m.impuesto1,m.impuesto2,m.tipo_proceso_xml,m.tipoemision,m.empresa_id,m.tipodocumentosri_id,m.fechasri FROM swissedi.eeditmovimiento m left join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id join swissedi.eeditpersona p on p.id=ep.persona_id '+porFecha;
 
	postgres.getPoolClienteConexion(sql,criterios, function(resultado){
			if(resultado){
				res.jsonp(resultado.rows);	
			}else{
				res.jsonp(null);
			}
	});
  
 
}

/******************
Elimiar movimiento definitivo
**********************/
function eliminarMovimientoBaseDatos(id,user, resultadoA){
	console.log("eliminarMovimientoBaseDatos");
	console.log(user);
	if(user.perfil !== 'admin'){
		resultadoA("No tiene permisos");
		return;
	}
	if(!user.eliminarregistros){
		resultadoA("No tiene permisos para eliminar el registro");
		return;
	}
	if(id){
		
		var sqlEliminarRegistros = "DELETE FROM swissedi.eeditmovimiento_bitacora WHERE MOVIMIENTO_ID=$1";
		console.log(id);
		postgres2.getPoolClienteConexion(sqlEliminarRegistros, [id], function(resultadoB){
		console.log(resultadoB);
			if(resultadoB && resultadoB.rowCount>=0){
				
				sqlEliminarRegistros = "DELETE FROM swissedi.eeditmovimiento WHERE ID=$1";
				postgres2.getPoolClienteConexion(sqlEliminarRegistros, [id], function(resultadoC){
					console.log(resultadoC);
					if(resultadoC && resultadoC.rowCount>0){
						resultadoA(true);
					}else{
						resultadoA(false);
					}
				});
				
			}else{
				resultadoA(false);
			}
		});
	}else{
		resultadoA("Id No valido");
	}
}
/*************************************
	BUSQUEDA DE CLIENTES POR CRITERIO
**************************************/
function consultarclientesporcriterio(criterio, res){
	try{
		if(criterio){
			var criterios = ['%'+criterio+'%'];
			
			var sqlRegistros = "SELECT true as cambiarinfo,razonsocial, cliente_proveedor, ARRAY_TO_STRING(ARRAY[identificacion,razonsocial,email], ' ') as query,* FROM swissedi.eeditpersona where estado='A'   and  ARRAY_TO_STRING(ARRAY[identificacion,razonsocial,email], ' ')  ilike $1::varchar  limit 100";
			
			postgres2.getPoolClienteConexion(sqlRegistros, criterio ? criterios:null, function(resultado){
					if(resultado){
						res.jsonp(resultado.rows);	
					}else{
						res.jsonp(null);
					}
			});
		}else{
		/*
			Si no hay criterios envia null
		*/
			res.jsonp(null);
		}
	}catch(error){
		console.log(error);
		console.log(sql)
	}
}


function consultarEmpresasPorId(id,res){
	if(id){
		
		var sql = "SELECT ruc||' '||descripcion||' '||codigo as query,ruc,id,descripcion,codigo,mensaje,urllogo, true as mostrar FROM  swissedi.eeditempresa where id"
		if(!isNaN(id)){
			postgres2.getPoolClienteConexion(sql + '=$1', [id], function(resultado){
					if(resultado){
						res.jsonp(resultado.rows);	
					}else{
						res.jsonp([]);
					}
			});
		}else{
			var noEsValido = true;
			var idempresas = []
			
			for(var i in id.split(',')){
				
				if(id.split(',')[i] && !isNaN(id.split(',')[i]) &&  id.split(',')[i]>=0){
					idempresas.push(id.split(',')[i]);
				}
			}
			if(idempresas.length>0){
				 postgres2.getPoolClienteConexion(sql + ' in ('+idempresas.join(',')+')', null, function(resultado){
					if(resultado){
						res.jsonp(resultado.rows);	
					}else{
						res.jsonp([]);
					}
				});
			}else{
				res.jsonp([]);
			}
		  
		}
		
		
	}else{
		res.jsonp(null);
	}

	
}



/*************************************
CONSULTAR MOVIMIENTOS POR CRITERIO
**************************************/
var datosInjections = ['select','1=1','delete','update','where','values','=','>','<','!=','drop table','drop database','drop ',' drop ',' drop',';'];
function verficarInjections(datojson){
   for(keyjson in datojson){
		var dato = datojson[keyjson] + ''.toLowerCase().replace(/'/g, '').replace(/"/g, '')
		for(index in datosInjections){
			if(dato.indexOf(datosInjections[index])>=0){
				
				return true;
			}
		}
	}
	return false;
}

function consultarmovimientosPorCriterios(identificacion, criterio,referenciaDoc, estado, tipodoc, inicio, fin, empresa,limite,idLimite,avanzar,edi, emailsEnviados, res){
	try{
	  var doccumento_id=tipodoc;
		/*****************
			Limite 0 - 100
		******************/
		if(limite && ( limite > 100)){
			limite = 100;
		}
		if(limite && ( limite == 0)){
			limite = 10;
		}
		if(!limite){
			limite = 10;
		}
		/************************************
					Estableciendo Parametros
		*****************************************/
		/******************
			VERIFICANDO QUE LA IDENTIFICACION NO CONTENGA 
			PALABRAS CON SELECT DELETE UPDATE
		*********************************/
		if(identificacion && identificacion.indexOf('select')){
		}
		identificacion = identificacion ? " and p.identificacion = '"+identificacion+"'" : "";
		var criterioA = false;
		 var resultados = [];
		if(criterio && criterio.indexOf('-')>0){
			criterio = criterio.trim();
			
			for(s in criterio.split('-')){
				/************
				verificando que el criterio sea numerico
				ya que se trata de campos numericos
			*************/
				
				if(isNaN(criterio.split('-')[s])){
					
					resultados[0] = 0;
					resultados[1] = [];
					res.jsonp(resultados);
					return;
				}
			}
			/**************
				Si el criterio es xxx-xxx, se trata de la serie
			**************/
			if(criterio.split('-').length == 2 && criterio.split('-')[0].length == 3 && criterio.split('-')[1].length == 3){
				criterioA = true;
				criterioR = criterio ? " and m.serie = $1::varchar" : "";
			}else{
				/**************
				Si el criterio es xxx-xxx-xxxxxxxx
				**************/
				
				if(criterio.split('-').length == 3 && criterio.split('-')[0].length == 3 && criterio.split('-')[1].length == 3){
					criterioR = criterio ? " and m.serie||'-'||m.comprobante like $1::varchar" : "";
				}else{
					/**************
						retornamos null, por que no se esta ingresando un buen criterio
					**************/
					
					resultados[0] = 0;
					resultados[1] = [];
					res.jsonp(resultados);
					return;
				}
			}
			
			
			
			
		}else{
			/************
				verificando que el criterio sea numerico
				ya que se trata de campos numericos
			*************/
			if(criterio && isNaN(criterio)){
				resultados[0] = 0;
				resultados[1] = [];
				res.jsonp(resultados);
				return;
			}
			criterioR = criterio ? " and ARRAY_TO_STRING(ARRAY[m.claveacceso,m.serie,m.comprobante,m.numeroautorizacion], ' ') like $1::varchar" : "";
		}
		
		/*if(retencionEtiquetaImpuestos && isNaN(retencionEtiquetaImpuestos)){
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
			return;
		}
		*/
		
		if(edi == true){
			estado = estado ? " and m.estado = '"+estado +"'": " and m.estado='A'";
		}else{
			estado = estado ? " and m.estado = '"+estado +"'": "";
		}
		
		tipodoc = tipodoc ?( isNaN(tipodoc) ? ' and  m.tipodocumentosri_id in ('+tipodoc+')' : ' and  m.tipodocumentosri_id = '+tipodoc ): '';
		
		
		
		inicio = inicio ?  formatDate(inicio,'-') : '';
		fin = fin ? formatDate(fin,'-',true) : '';
		/*******
			VERIFICANDO QUE CODIGO DE LA EMPRESA SEA NUMERICO
			EN CASO CONTRARIO NO SE ENVIARA ALGUN RESULTADO
		**********/
		if(empresa && isNaN(empresa)){
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
			return;
		}
		/**************************
			SI LA EMPRESA ESTA VACIA Y SI ES EDI, NO SE RETORNARA ALGUNA RESULTADO
			YA QUE COMO PERFIL EDI DEBE ESCOGER LA EMPRESA
		**************************/
		if(!empresa && edi == true){
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
			return;
		}
		
		empresa = empresa ? ' and m.empresa_id = '+empresa:''; 
		
		
		
		
		idLimite = idLimite ? ' and m.id '+(avanzar && avanzar == true ?'<':'>' )+' '+idLimite:'';
		var porFechas = inicio && fin ? ' and  m.fechacreacion BETWEEN '+inicio +' and '+fin:'';
		/***********************************
			VALIDANDO QUE LOS CRITERIOS TENGAN AL MENOS UN PARAMETRO
		***********************************/
		
		if(criterioR || estado || tipodoc || porFechas || identificacion || empresa || idLimite){
			 var criterios = criterioA ? [criterio]: ['%'+criterio+'%'];
			 var creiteriofinal = ' where 1=1 '+ criterioR + estado + tipodoc + porFechas + identificacion + empresa ; 
			  /**********************************************
						TOTAL DE FILAS
			  **********************************************/
			 var sqlTotal ='SELECT count(m.id) as total FROM swissedi.eeditmovimiento m left join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id  left join  swissedi.eeditpersona p on p.id=ep.persona_id '+creiteriofinal;
			 /**********************************************
						REGISTROS
			  **********************************************/
			  
			 
			/* if(retencionEtiquetaImpuestos){
				creiteriofinal += ' and m.infjson is not null and m.infjson::varchar like \'%'+retencionEtiquetaImpuestos+'%\'';
				
			 }
			 */
			 /*************
			 BUSQUEDA POR REFERENCIAS Y POR DOCUMENTO
			 
			 **************/
			  console.log("ante entro******* "+doccumento_id+"   "+referenciaDoc);
			 if(doccumento_id && referenciaDoc){
			 console.log("entro******* "+referenciaDoc);
				switch(doccumento_id){
					case '1':
					case "1":
					case 1:
						creiteriofinal += ' and m.infjson->\'factura\'->\'infoFactura\'->0->>\'guiaRemision\' like \'%'+referenciaDoc+'%\'';
					break;
				
					case '2':
					case "2":
					case 2:
						creiteriofinal += ' and ((m.infjson->\'notaCredito\'->\'infoNotaCredito\'->0->>\'codDocModificado\')||(m.infjson->\'notaCredito\'->\'infoNotaCredito\'->0->>\'numDocModificado\')||(m.infjson->\'notaCredito\'->\'infoNotaCredito\'->0->>\'fechaEmisionDocSustento\'))  like \'%'+referenciaDoc+'%\'';
					break;
				
					case '3':
					case "3":
					case 3:
						creiteriofinal += ' and ((m.infjson->\'notaDebito\'->\'infoNotaDebito\'->0->>\'codDocModificado\')||(m.infjson->\'notaDebito\'->\'infoNotaDebito\'->0->>\'numDocModificado\')||(m.infjson->\'notaDebito\'->\'infoNotaDebito\'->0->>\'fechaEmisionDocSustento\'))  like \'%'+referenciaDoc+'%\'';
					break;
				
					case '4':
					case "4":
					case 4:
						creiteriofinal += ' and ((m.infjson->\'guiaRemision\'->\'destinatarios\'->0->\'destinatario\'->0->>\'codDocSustento\')||(m.infjson->\'guiaRemision\'->\'destinatarios\'->0->\'destinatario\'->0->>\'numDocSustento\')||(m.infjson->\'guiaRemision\'->\'destinatarios\'->0->\'destinatario\'->0->>\'fechaEmisionDocSustento\')||(m.infjson->\'guiaRemision\'->\'destinatarios\'->0->\'destinatario\'->0->>\'identificacionDestinatario\')||(m.infjson->\'guiaRemision\'->\'destinatarios\'->0->\'destinatario\'->0->>\'razonSocialDestinatario\')||(m.infjson->\'guiaRemision\'->\'destinatarios\'->0->\'destinatario\'->0->>\'dirDestinatario\'))  like \'%'+referenciaDoc+'%\'';
					break;
					
					case '5':
					case "5":
					case 5:
						 console.log("entro al case******* "+referenciaDoc);
						creiteriofinal += ' and m.id in (select id from items_por_documento_comprobante_retencion where empresa_id=m.empresa_id and codigo||codigoRetencion||codDocSustento||numDocSustento||fechaEmisionDocSustento  like \'%'+referenciaDoc+'%\')';
						console.log("entro al case******* "+creiteriofinal);
					break;
				}
				
				
			 }
			 
			 if(idLimite){
				 creiteriofinal += idLimite +' order by m.id '+(avanzar && avanzar == true ? 'desc':'asc')+' limit '+limite; 
			  }else{
				 creiteriofinal += idLimite +' order by m.id desc limit '+limite; 
			  }
			 
			
			 
			// var sqlRegistros = 'SELECT '+(retencionEtiquetaImpuestos? ' m.infjson, ':'')+' m.id,SUBSTR(m.observacion, 1, 3000) as observacion,p.razonsocial,p.identificacion,m.claveacceso,m.estado,m.comprobante,valor,numeroautorizacion,m.fechacreacion,m.serie,m.subtotal,m.descuento,m.impuesto1,m.impuesto2,m.tipo_proceso_xml,m.tipoemision,m.empresa_id,m.tipodocumentosri_id,m.fechasri '+(emailsEnviados && emailsEnviados == "true" ? ',(select count(b1.id) from swissedi.eeditmovimiento_bitacora b1 where b1.conceptosri_id =106 and b1.movimiento_id=m.id ) as totalCorreo' :'' )+' FROM swissedi.eeditmovimiento m  left join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id left join swissedi.eeditpersona p on p.id=ep.persona_id '+creiteriofinal;
			emailsEnviados=false;
			 var sqlRegistros = 'SELECT  m.infjson, m.id,SUBSTR(m.observacion, 1, 3000) as observacion,p.razonsocial,p.identificacion,m.claveacceso,m.estado,m.comprobante,valor,numeroautorizacion,m.fechacreacion,m.serie,m.tipo_proceso_xml,m.tipoemision,m.empresa_id,m.tipodocumentosri_id,m.fechasri '+(emailsEnviados && emailsEnviados == "true" ? ',(select count(b1.id) from swissedi.eeditmovimiento_bitacora b1 where b1.conceptosri_id =106 and b1.movimiento_id=m.id ) as totalCorreo' :'' )+' FROM swissedi.eeditmovimiento m  left join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id left join swissedi.eeditpersona p on p.id=ep.persona_id '+creiteriofinal;
			 console.log(sqlRegistros);
			  if(idLimite){
				 if(avanzar === false){
					sqlRegistros = ' select * from ('+sqlRegistros+') tablaaux order by id desc'
				}
			 }
			
			 postgres.getPoolClienteConexion(sqlTotal, criterio ? criterios:null, function(resultado){
			  
				if(resultado){
					try{
						resultados[0] = resultado.rows[0].total;
						postgres.getPoolClienteConexion(sqlRegistros, criterio ? criterios:null, function(resultado2){
							
							if(resultado2){
								resultados[1] = resultado2.rows;
								res.jsonp(resultados);	
							}else{
								res.jsonp(null);
							}
						 });
					}catch(error){
						console.log(error);
						res.jsonp(null);
					}
				}else{
					res.jsonp(null);
				}
			 });
			 
				
		}else{
			res.jsonp(null);
		}
	}catch(error){
		console.log(error);
		res.jsonp(null);
	}
}


function consultandoFacturasPorProducto(identificacion,empresa,codigo, res){
	if(identificacion && empresa && codigo){
		 var sqlRegistros="	select id,fechacreacion, numero,cantidad,precio,descuento,total,iva,(total + iva) as totalconiva from items_por_documento_factura where codigo='"+codigo+"' and empresa_id="+empresa+" and identificacion='"+identificacion+"'";
			postgres.getPoolClienteConexion(sqlRegistros,null, function(resultado2){
				if(resultado2){
					res.jsonp(resultado2.rows);	
				}else{
					res.jsonp(null);
				}
			});
	}else{
		res.jsonp(null);
	}

}
function consultandoCantidadesPorProductoPorEmpresa(empresa,identificacion,criterio,inicio,fin, comparacion_cantidad,comparacion_precio,comparacion_total,comparacion_descuento,comparacion_iva,comparacion_totalconiva, res){
	if(empresa && identificacion){
		var	identificacionR = identificacion ? " and identificacion ='"+identificacion+"'" : "";
		var	criterioR = criterio ? " and ARRAY_TO_STRING(ARRAY[codigo,descripcion], ' ') ilike $2::varchar" : "";
		var criterios = criterioR ? [empresa,'%'+criterio+'%']:[empresa];
		inicio = inicio ?  formatDate(inicio,'-') : '';
		fin = fin ? formatDate(fin,'-',true) : '';
		var porFechas = inicio && fin ? ' and  fechacreacion BETWEEN '+inicio +' and '+fin:'';
		//Comparaciones
		var cantidad = "";
		var precio = "";
		var total = "";
		var descuento = "";
		var iva = "";
		var totalconiva = "";
		var grupo = false;
		if(comparacion_cantidad && comparacion_cantidad.valor && !comparacion_cantidad.operador){
			comparacion_cantidad.operador = "=";
		}
		if(comparacion_precio && comparacion_precio.valor && !comparacion_precio.operador){
			comparacion_precio.operador = "=";
		}
		if(comparacion_total && comparacion_total.valor && !comparacion_total.operador){
			comparacion_total.operador = "=";
		}
		if(comparacion_descuento && comparacion_descuento.valor && !comparacion_descuento.operador){
			comparacion_descuento.operador = "=";
		}
		if(comparacion_iva && comparacion_iva.valor && !comparacion_iva.operador){
			comparacion_iva.operador = "=";
		}
		if(comparacion_totalconiva && comparacion_totalconiva.valor && !comparacion_totalconiva.operador){
			comparacion_totalconiva.operador = "=";
		}
		
		if(comparacion_cantidad && comparacion_cantidad.operador && comparacion_cantidad.operador !=="." && ">.<.>=.<=.=.><".indexOf(comparacion_cantidad.operador)>=0 && !isNaN(comparacion_cantidad.valor)){
			cantidad = " and sum(cantidad) "+comparacion_cantidad.operador+comparacion_cantidad.valor;
			grupo = true;
		}else{
			if(comparacion_cantidad && (comparacion_cantidad.operador || comparacion_cantidad.valor)){
				res.jsonp([]);
				return;
			}
		}
		console.log(comparacion_precio);
		if(comparacion_precio && comparacion_precio.operador && comparacion_precio.operador !=="." && ">.<.>=.<=.=.><".indexOf(comparacion_precio.operador)>=0 && !isNaN(comparacion_precio.valor)){
			precio = " and precio "+comparacion_precio.operador+comparacion_precio.valor
			grupo = true;
		}else{
			if(comparacion_precio && (comparacion_precio.operador || comparacion_precio.valor)){
				res.jsonp([]);
				return;
			}
		}
		if(comparacion_total && comparacion_total.operador && comparacion_total.operador !=="." && ">.<.>=.<=.=.><".indexOf(comparacion_total.operador)>=0 && !isNaN(comparacion_total.valor)){
			total = " and sum(total) "+comparacion_total.operador+comparacion_total.valor;
			grupo = true;
		}else{
			if(comparacion_total && (comparacion_total.operador || comparacion_total.valor)){
				res.jsonp([]);
				return;
			}
		}
		console.log(comparacion_descuento);
		if(comparacion_descuento && comparacion_descuento.valor){
			console.log(isNaN(comparacion_descuento.valor));
		}
		
		
		if(comparacion_descuento && comparacion_descuento.operador && comparacion_descuento.operador !=="." && ">.<.>=.<=.=.><".indexOf(comparacion_descuento.operador)>=0 && !isNaN(comparacion_descuento.valor)){
			descuento = " and sum(descuento) "+comparacion_descuento.operador+comparacion_descuento.valor;
			grupo = true;
		}else{
			if(comparacion_descuento && (comparacion_descuento.operador || comparacion_descuento.valor)){
				res.jsonp([]);
				return;
			}
		}
		console.log(descuento);
		if(comparacion_iva && comparacion_iva.operador && comparacion_iva.operador !=="." && ">.<.>=.<=.=.><".indexOf(comparacion_iva.operador)>=0 && !isNaN(comparacion_iva.valor)){
			grupo = true;
			iva = " and sum(iva) "+comparacion_iva.operador+comparacion_iva.valor;
		}else{
			if(comparacion_iva && (comparacion_iva.operador || comparacion_iva.valor)){
				res.jsonp([]);
				return;
			}
		}
		if(comparacion_totalconiva && comparacion_totalconiva.operador && comparacion_totalconiva.operador !=="." && ">.<.>=.<=.=.><".indexOf(comparacion_totalconiva.operador)>=0 && !isNaN(comparacion_totalconiva.valor)){
			grupo = true;
			totalconiva = " and ( sum(total)+sum(iva)) "+comparacion_totalconiva.operador+comparacion_totalconiva.valor;
		}else{
			if(comparacion_totalconiva && (comparacion_totalconiva.operador || comparacion_totalconiva.valor)){
				res.jsonp([]);
				return;
			}
		}
		
		
		var sqlRegistros =	"	SELECT codigo, descripcion, sum(cantidad) as cantidad, precio, sum(descuento) as descuento,sum(total) as total,sum(iva) as iva,( sum(total)+sum(iva)) as totalconiva FROM items_por_documento_factura WHERE empresa_id=$1"+identificacionR+criterioR+porFechas+
							"	group by empresa_id,codigo,descripcion,precio "+(grupo?" HAVING 1=1 "+cantidad+precio+total+descuento+iva+totalconiva:"")+
							"	";
							
		var sqlTotalRegistros = "	SELECT sum(cantidad) as cantidad,avg(precio) as precio, sum(descuento) as descuento, sum(total) as total, sum(iva) as iva,sum(total) +sum(iva) as totalconiva  FROM (	"+
								"	SELECT codigo,descripcion, sum(cantidad) as cantidad, precio, sum(descuento) as descuento,sum(total) as total,sum(iva) as iva,( sum(total)+sum(iva)) as totalconiva FROM items_por_documento_factura WHERE empresa_id=$1"+identificacionR+criterioR+porFechas+
								"	GROUP BY empresa_id,codigo,descripcion,precio "+(grupo?" HAVING 1=1 "+cantidad+precio+total+descuento+iva+totalconiva:"")+
								"	 "+
								"	) d ";
			console.log("sqlRegistros")
			console.log(sqlRegistros)
			console.log("sqlTotalRegistros")
			console.log(sqlTotalRegistros)
			postgres.getPoolClienteConexion(sqlRegistros,criterios, function(resultado2){
				if(resultado2){
					var resultados = [];
					resultados[0] = resultado2.rows;
					postgres.getPoolClienteConexion(sqlTotalRegistros,criterios, function(resultado3){
						if(resultado3){
							resultados[1] = resultado3.rows;
							res.jsonp(resultados);	
						}else{
							res.jsonp([]);
						}
					});
					
				}else{
					res.jsonp([]);
				}
			});
	}else{
		res.jsonp([]);
	}

}

function consultarproductosPorCriterios(identificacion, criterio,referenciaDoc, estado, tipodoc, inicio, fin, empresa,limite,idLimite,avanzar,edi, res){
	console.log("consultarproductosPorCriterios");
	
	try{
	  var doccumento_id=tipodoc;
		/*****************
			Limite 0 - 100
		******************/
		if(limite && ( limite > 100)){
			limite = 100;
		}
		if(limite && ( limite == 0)){
			limite = 10;
		}
		if(!limite){
			limite = 10;
		}
		/************************************
					Estableciendo Parametros
		*****************************************/
		
		identificacion = identificacion ? " and identificacion = '"+identificacion+"'" : "";
		var criterioA = false;
		 var resultados = [];
		if(criterio && criterio.indexOf('-')>0 && (criterio.split('-').length == 3 || criterio.split('-').length == 2 )){
			criterio = criterio.trim();
			
			for(s in criterio.split('-')){
				/************
				verificando que el criterio sea numerico
				ya que se trata de campos numericos
			*************/
				
				if(isNaN(criterio.split('-')[s])){
					
					resultados[0] = 0;
					resultados[1] = [];
					res.jsonp(resultados);
					return;
				}
			}
			/**************
				Si el criterio es xxx-xxx, se trata de la serie
			**************/
			if(criterio.split('-').length == 2 && criterio.split('-')[0].length == 3 && criterio.split('-')[1].length == 3){
				criterioA = true;
				criterioR = criterio ? " and numero like $1::varchar" : "";
			}else{
				/**************
				Si el criterio es xxx-xxx-xxxxxxxx
				**************/
				
				if(criterio.split('-').length == 3 && criterio.split('-')[0].length == 3 && criterio.split('-')[1].length == 3){
					criterioA = true;
					criterioR = criterio ? " and numero like $1::varchar" : "";
				}else{
					/**************
						retornamos null, por que no se esta ingresando un buen criterio
					**************/
					
					resultados[0] = 0;
					resultados[1] = [];
					res.jsonp(resultados);
					return;
				}
			}
			
			
			
			
		}else{
			
			criterioR = criterio ? " and ARRAY_TO_STRING(ARRAY[codigo,descripcion], ' ') ilike $1::varchar" : "";
		}
		
		
		
		//tipodoc = tipodoc ?( isNaN(tipodoc) ? ' and  m.tipodocumentosri_id in ('+tipodoc+')' : ' and  m.tipodocumentosri_id = '+tipodoc ): '';
		
		
		
		inicio = inicio ?  formatDate(inicio,'-') : '';
		fin = fin ? formatDate(fin,'-',true) : '';
		/*******
			VERIFICANDO QUE CODIGO DE LA EMPRESA SEA NUMERICO
			EN CASO CONTRARIO NO SE ENVIARA ALGUN RESULTADO
		**********/
		if(empresa && isNaN(empresa)){
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
			return;
		}
		/**************************
			SI LA EMPRESA ESTA VACIA Y SI ES EDI, NO SE RETORNARA ALGUNA RESULTADO
			YA QUE COMO PERFIL EDI DEBE ESCOGER LA EMPRESA
		**************************/
		if(!empresa){
			resultados[0] = 0;
			resultados[1] = [];
			res.jsonp(resultados);
			return;
		}
		
		empresa = empresa ? ' and empresa_id = '+empresa:''; 
		
		
		
		
		idLimite = idLimite ? ' and m.id '+(avanzar && avanzar == true ?'<':'>' )+' '+idLimite:'';
		var porFechas = inicio && fin ? ' and  m.fechacreacion BETWEEN '+inicio +' and '+fin:'';
		/***********************************
			VALIDANDO QUE LOS CRITERIOS TENGAN AL MENOS UN PARAMETRO
		***********************************/
		
		if(criterioR || tipodoc || porFechas || identificacion || empresa || idLimite){
			 var criterios = criterioA ? [criterio]: ['%'+criterio+'%'];
			 var tablaB = "";
			 var sqlTotal = "";
			  var creiteriofinal = ' where 1=1 '+ criterioR + porFechas + identificacion + empresa ;
			 if(doccumento_id ){
			 console.log("entro******* "+referenciaDoc);
				switch(doccumento_id){
					case '1':
					case "1":
					case 1:
						  /**********************************************
							TOTAL DE FILAS
						**********************************************/
						sqlTotal ='SELECT count(m.codigo) as total FROM items_por_documento_factura m '+creiteriofinal;
						tablaB = ' codigo,descripcion, sum(cantidad) as cantidad,precio,sum(descuento) as descuento,((sum(cantidad) * precio)-sum(descuento)) as total, sum(iva) as iva, ((sum(cantidad) * precio)-sum(descuento)+sum(iva)) as totalconiva  from items_por_documento_factura m ';
					break;
				
					case '2':
					case "2":
					case 2:
						sqlTotal ='SELECT count(m.codigo) as total FROM items_por_documento_nota_credito m '+creiteriofinal;
						tablaB = ' codigo,descripcion, sum(cantidad) as cantidad,precio,sum(descuento) as descuento,sum(cantidad)*precio as total from items_por_documento_nota_credito m ';
					break;
				
					
					case '5':
					case "5":
					case 5:
						sqlTotal ='SELECT count(m.codigo) as total FROM items_por_documento_comprobante_retencion m '+creiteriofinal;
						tablaB = ' codigo,codigoretencion,sum(baseimponible) as baseimponible ,porcentajeretener,sum(valorretenido) from items_por_documento_comprobante_retencion m ';
					
							break;
				}
				
				
			 }
			 
			 
			
			 /**********************************************
						REGISTROS
			  **********************************************/
		
			 /*************
			 BUSQUEDA POR REFERENCIAS Y POR DOCUMENTO
			 
			 **************/
			  console.log("ante entro******* "+doccumento_id+"   "+referenciaDoc);
			 
			 
			/* if(idLimite){
				 creiteriofinal += idLimite +' group by codigo,descripcion, precio  '+(avanzar && avanzar == true ? 'desc':'asc')+' limit '+limite; 
			  }else{*/
			creiteriofinal += idLimite +' group by codigo,descripcion, precio  limit 100'; 
			  //}
			 
			
			 
			  
			 
			 var sqlRegistros = 'select  '+tablaB+' '+creiteriofinal ;
			 console.log(sqlRegistros);
			  if(idLimite){
				 if(avanzar === false){
					sqlRegistros = ' select * from ('+sqlRegistros+') tablaaux order by id desc'
				}
			 }
			
			 postgres.getPoolClienteConexion(sqlTotal, criterio ? criterios:null, function(resultado){
			  
				if(resultado){
					try{
						resultados[0] = resultado.rows[0].total;
						postgres.getPoolClienteConexion(sqlRegistros, criterio ? criterios:null, function(resultado2){
							
							if(resultado2){
								resultados[1] = resultado2.rows;
								res.jsonp(resultados);	
							}else{
								res.jsonp(null);
							}
						 });
					}catch(error){
						console.log(error);
						res.jsonp(null);
					}
				}else{
					res.jsonp(null);
				}
			 });
			 
				
		}else{
			res.jsonp(null);
		}
	}catch(error){
		console.log(error);
		res.jsonp(null);
	}
}





/**********************************************
BITACORA POR ID
***********************************************/

function consultarmovimientosbitacora(movimiento_id,res){
	var sql = 'select m.* from swissedi.eeditmovimiento_bitacora m  where m.movimiento_id =  $1 order by m.id desc limit 300';
 
	postgres.getPoolClienteConexion(sql, [movimiento_id], function(resultado){
		if(resultado){
			res.jsonp(resultado.rows);	
		}else{
			res.jsonp(null);
		}
	});
}



	
function transfomrarTablaToArray(tabla){

var datos = tabla.split("<tr>");
   datos.shift();
	var datos2;
  var datos3={};
  for(var i=0;i<datos.length;i++){
		var datos2 = datos[i].split("<td>");
		if( datos2[0] && datos2[1] ){
		if(datos2[0].indexOf('colspan')<0 && datos2[0].indexOf('width')<0){
			
			var datokey = datos2[0].replace('<th>','').replace('</th>','').replace(':','').replace('&oacute;','o').replace(/ /g,'').replace('\n','').trim();
			var datoValue = datos2[1].replace('</tr>','').replace('&nbsp;','');
			datoValue = datoValue.replace('</table>','').replace('<td>','');
			datoValue = datoValue.replace('</td>','').trim();
			datos3[datokey]=datoValue;
		}
		}
  } 
  return datos3;
}


function transfomrarTablaToArray2(tabla){

var datos = tabla.split('<tr >');
   datos.shift();
   
	var datos2;
  var datos3={};
  for(var i=0;i<datos.length;i++){
		var datos2 = datos[i].split("<td>");
		if( datos2[0] && datos2[1] ){
		//if(datos2[0].indexOf('row')<0 && datos2[0].indexOf('width')<0){
			
			var datokey = datos2[0].replace('<th>','').replace('</th>','').replace(':','').replace('&oacute;','o').replace(/ /g,'').replace('\n','').trim();
			var datoValue = datos2[1].replace('</tr>','').replace('&nbsp;','');
			datoValue = datoValue.replace('</table>','').replace('<td>','');
			datoValue = datoValue.replace('</td>','').trim();
			datos3[datokey]=datoValue;
		//}
		}
  } 
  return datos3;
}




/*********************
	Funcion que permite obtener el total de registros de los movimientos
	por administrador.
**********************/
function consultarmovimientosTotalRegistros(empresa, identificacion, res){
	empresa = empresa.split(',')[0];
	var sqlTotal = identificacion && identificacion != '-1' ? 'SELECT count(m.id)::int as total FROM swissedi.eeditmovimiento m join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id join swissedi.eeditpersona p on p.id=ep.persona_id where p.identificacion = $1::varchar and m.empresa_id='+empresa:'SELECT count(m.id)::int as total  FROM swissedi.eeditmovimiento m where m.empresa_id='+empresa ;
	
	if(identificacion && identificacion == '-1')  {
		postgres.getPoolClienteConexion(sqlTotal,null, function(resultado){
				if(resultado){
					
					res.json(resultado.rows[0].total);	
					
					
				}else{
					res.jsonp(null);
				}
		});
	}else{
	
		postgres.getPoolClienteConexion(sqlTotal,[identificacion], function(resultado){
		 
			if(resultado){
				
				res.json(resultado.rows[0].total);	
				
				
			}else{
				res.jsonp(null);
			}
		});
	}
  
 
}






var requestWithEncoding = function(url_, headers, callback) {
 
var options = {
	headers: headers,
	uri: url_,
	method: "GET",
	timeout : 10000, //Maximo espera 10 segundos por peticion
	rejectUnauthorized: false,
	gzip: true
	
};
  var req = request.get(options);
 
  req.on('response', function(res) {
    var chunks = [];
    res.on('data', function(chunk) {
      chunks.push(chunk);
    });
 
    res.on('end', function() {
      var buffer = Buffer.concat(chunks);
      var encoding = res.headers['content-encoding'];
      if (encoding == 'gzip') {
        zlib.gunzip(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        });
      } else if (encoding == 'deflate') {
        zlib.inflate(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        })
      } else {
        callback(null, buffer.toString());
      }
    });
  });
 
  req.on('error', function(err) {
    callback(err);
  });
  
}



/*************************************
Grabando datos en postgres
Clientes
**/
function garbarjsonactualizacion(datosjson, res){

	console.log("garbarjsonactualizacion")
	
	var dd=datosjson.cliente_proveedor;
	var id=datosjson.id;
	console.log(id)
	console.log(dd)
	var sql = 'UPDATE swissedi.eeditpersona SET cliente_proveedor =  $1, email=$2  WHERE ID=$3';
	
	var email = '';
	var values = [];
	if(dd && dd.emails && dd.emails[0] && dd.emails[0].email ){
		email = dd.emails[0].email;
		values = [dd,email,id];
	}else{
		values = [dd,id];
		sql = 'UPDATE swissedi.eeditpersona SET cliente_proveedor =  $1 WHERE ID=$2';
	}
	
	
	postgres.getPoolClienteConexion(sql,values, function(resultado){
		
		if(resultado && resultado.rowCount>0){
			res.json({grabado:true});
		}else{
			console.log(resultado);
			res.json({grabado:false,mensaje:resultado});
		}
	});
}

/*************************************
Grabando datos en postgres
Clientes
/*******
							  tipodoc:
								1;"01";"FACTURA";"A"
								2;"04";"NOTA DE CREDITO";"A"
								3;"05";"NOTA DE DEBITO";"A"
								4;"06";"GUIA DE REMISION";"A"
								5;"07";"COMPROBANTE DE RETENCION";"A"
**/


var rucnoecnontrado="Ruc no encontrado";
var sriNoResponde="error::El Sri No responde";
function garbarjsonactualizacionPersona(identificacion, res){
	console.log("garbarjsonactualizacionPersona");
	//1.- Buscar si existe en la base de datos del SRI
	var sql = 'SELECT tipoidentificacion,negocio,razonsocial, cliente_proveedor FROM swissedi.eeditpersona   WHERE identificacion=$1';
	postgres.getPoolClienteConexion(sql,[identificacion], function(resultado){
		
					if(resultado && resultado.rowCount === 0){
						res({identificacion:identificacion,error:"No se encontro en la base de datos"});
						return;
					}
					if(resultado && resultado.rowCount>0 && resultado.rows[0] && resultado.rows[0].cliente_proveedor && resultado.rows[0].cliente_proveedor.datosSRI && resultado.rows[0].cliente_proveedor.datosSRI.RUC===identificacion && !resultado.rows[0].cliente_proveedor.id){
						res({identificacion:identificacion,estado:"ok"});
						return;
					}
					if(resultado && resultado.rowCount>0 && resultado.rows[0] && resultado.rows[0].cliente_proveedor && resultado.rows[0].cliente_proveedor.datosCNE && resultado.rows[0].cliente_proveedor.datosCNE["Cedula"]===identificacion && !resultado.rows[0].cliente_proveedor.id){
						res({identificacion:identificacion,estado:"ok"});
						return;
					}
					if(resultado && resultado.rowCount>0 && resultado.rows[0] && resultado.rows[0].cliente_proveedor && resultado.rows[0].cliente_proveedor.noresponde && resultado.rows[0].cliente_proveedor.noresponde.estado && resultado.rows[0].cliente_proveedor.noresponde.numerointento>20 ){
						res({identificacion:identificacion,error:true,mensaje:"Se ha intentado conectarse con el SRI, pero este a su vez no ha respondido",fecha:resultado.rows[0].cliente_proveedor.datosSRI.noresponde.fecha,mensaje:resultado.rows[0].cliente_proveedor.noresponde.fecha});
						return;
					}
					if(resultado && resultado.rowCount>0 && resultado.rows[0] && resultado.rows[0].cliente_proveedor  && resultado.rows[0].cliente_proveedor.identificaconnoexiste && resultado.rows[0].cliente_proveedor.identificaconnoexiste.estado && resultado.rows[0].cliente_proveedor.identificaconnoexiste.numerointento>20 ){
						res({identificacion:identificacion,error:true,mensaje:"Se ha intentado varias veces, pero el SRI no encuentra el RUC",fecha:resultado.rows[0].cliente_proveedor.identificaconnoexiste.fecha});
						return;
					}
					
					if(resultado && resultado.rowCount>0 && resultado.rows[0]){
						switch(resultado.rows[0].tipoidentificacion){
							case "05":
								servletWS.getInfoCedula2(identificacion, function(resultadocne){
									
									if(resultadocne && !resultadocne.econtrado ){
										if(resultado && resultado.rowCount>0 && resultado.rows[0] && resultado.rows[0].cliente_proveedor  && resultado.rows[0].cliente_proveedor.identificaconnoexiste && resultado.rows[0].cliente_proveedor.identificaconnoexiste.estado && resultado.rows[0].cliente_proveedor.identificaconnoexiste.numerointento<20 ){
											respuesta={identificaconnoexiste:{estado:true,fecha:new Date(),numerointento:(resultado.rows[0].cliente_proveedor.identificaconnoexiste.numerointento + 1)}}
										}else{
											respuesta={identificaconnoexiste:{estado:true,fecha:new Date(),numerointento:1,mensaje:resultadocne}}
										}
										
									}
									
									if(resultadocne && resultadocne["Cedula"] === identificacion){

										respuesta={datosCNE:resultadocne};
										//Comparando resultados
										//1. Nombres con la razonsocial
										if(resultadocne["Nombres"] &&  resultadocne["Nombres"].toUpperCase() !== resultado.rows[0].razonsocial.toUpperCase()){
											respuesta={datosCNE:resultadocne,razonSocialNoCoincide:true,observacion:"Los nombres no coinciden"};
										}
									}
									
									var update = 'UPDATE swissedi.eeditpersona SET cliente_proveedor =  $1  WHERE identificacion=$2';
									postgres.getPoolClienteConexion(update,[respuesta,identificacion], function(resultado_){
		
										if(resultado_ && resultado_.rowCount>0){
											if(respuesta.identificaconnoexiste){
												res({identificacion:identificacion,error:true,mensaje:respuesta.identificaconnoexiste,identificaconnoexiste:true});
												return;
											}
											
											res({identificacion:identificacion,grabado:true,datos:respuesta});
											
										}else{
											res({identificacion:identificacion,error:true,mensaje:resultado_});
										}
									});
								});
							break;
							case "04":
								servletWS.revisarRucNuevaVersion(identificacion,2, function(resultadosri){
									
									if(resultadosri &&  (typeof resultadosri) === "string" && resultadosri.toUpperCase() === rucnoecnontrado.toUpperCase() ){
										if(resultado && resultado.rowCount>0 && resultado.rows[0] && resultado.rows[0].cliente_proveedor  && resultado.rows[0].cliente_proveedor.identificaconnoexiste && resultado.rows[0].cliente_proveedor.identificaconnoexiste.estado && resultado.rows[0].cliente_proveedor.identificaconnoexiste.numerointento<20 ){
											respuesta={identificaconnoexiste:{estado:true,fecha:new Date(),numerointento:(resultado.rows[0].cliente_proveedor.identificaconnoexiste.numerointento + 1)}}
										}else{
											respuesta={identificaconnoexiste:{estado:true,fecha:new Date(),numerointento:1}}
										}
										
									}
									if(resultadosri && (typeof resultadosri) ==="string" && resultadosri.toUpperCase().indexOf(sriNoResponde.toUpperCase())>=0 ){
										if(resultado && resultado.rowCount>0 && resultado.rows[0] && resultado.rows[0].cliente_proveedor && resultado.rows[0].cliente_proveedor.noresponde && resultado.rows[0].cliente_proveedor.noresponde.estado && resultado.rows[0].cliente_proveedor.noresponde.numerointento<20 ){
											respuesta={noresponde:{estado:true,fecha:new Date(),numerointento:(resultado.rows[0].cliente_proveedor.noresponde.numerointento + 1)}}
										}else{
											respuesta={noresponde:{estado:true,fecha:new Date(),numerointento:1,mensaje:resultadosri}}
										}
										
										
									}
									if(resultadosri && resultadosri.RUC === identificacion){

										respuesta={datosSRI:resultadosri};
										//Comparando resultados
										//1. Nombres con la razonsocial
										if(resultadosri["RazonSocial"] &&  resultadosri["RazonSocial"].toUpperCase() !== resultado.rows[0].razonsocial.toUpperCase()){
											respuesta={datosSRI:resultadosri,razonSocialNoCoincide:true,observacion:"La razon social no coincide con el registrado en el SRI"};
										}
										if(resultadosri["NombreComercial"] &&  resultadosri["NombreComercial"].toUpperCase() !== resultado.rows[0].negocio.toUpperCase()){
											respuesta={datosSRI:resultadosri,razonSocialNoCoincide:true,observacion:"El nombre comercial no coincide con el negocio con el registrado en el SRI"};
										}
									}
									var update = 'UPDATE swissedi.eeditpersona SET cliente_proveedor =  $1  WHERE identificacion=$2';
									postgres.getPoolClienteConexion(update,[respuesta,identificacion], function(resultado_){
		
										if(resultado_ && resultado_.rowCount>0){
											if(respuesta.identificaconnoexiste){
												res({identificacion:identificacion,error:true,identificaconnoexiste:true,mensaje:respuesta.identificaconnoexiste });
												return;
											}
											if(respuesta.noresponde){
												res({identificacion:identificacion,error:true,noresponde:true,mensaje:respuesta.noresponde });
												return;
											}
											
											res({identificacion:identificacion,grabado:true,datos:respuesta});
										}else{
											res({identificacion:identificacion,error:true,mensaje:resultado_});
										}
									});
								});
							break;
						}//switch
					}else{
						res({identificacion:identificacion,error:"Inentificacion No encontrada"});
					}
					
					
					
	});
	
	
}



/*************************************
Consultado todos los datos de usuarios creados en postgres
Usuarios
**/
function listarjson_usuario(res){
	var sqlbusqueda = "select * from swissedi.eeditusarios_json limit 100";
	postgres.getPoolClienteConexion(sqlbusqueda,null, function(resultado){
		if(resultado && resultado.rowCount>0){
			res.jsonp(resultado.rows);
		}
	});
};
/*************************************
Grabando datos en postgres
Usuarios
**/
function grabarjson_usuario(ip, username, datosjson, res){
	/*************
		crear usuario
	**************/
	
	var usuario=JSON.parse(datosjson);
	var sqlbusqueda = "select id from swissedi.eeditusarios_json where usuario = $1";
	var sql;
	var values;
	postgres.getPoolClienteConexion(sqlbusqueda,[usuario.usuario], function(resultado){
		if(resultado && resultado.rowCount>0){
			
			sql = 'UPDATE swissedi.eeditusarios_json SET datos_personales_y_perfil = $1, observacion = $2, estado = $3, email = $4  WHERE ID=$5';
			values = [usuario, usuario.observacion, usuario.estado, usuario.email, resultado.rows[0].id];
				postgres.getPoolClienteConexion(sql,values, function(resultado2){
					if(resultado2 && resultado2.rowCount>0){
						if(usuario.generarclave && usuario.generarclave === true){
							servletWS.encriptarClaveYEnviarEmail(resultado.rows[0].id, usuario.email, ip, username, function(resultado3){
							try{
								resultado_ws = JSON.parse(resultado3);
								if( resultado_ws.clavegenerada){
									
									res.json({grabado:true,mensaje:'Usuario Modificado!, se ha creado una clave temporal y ha sido enviada a '+usuario.email});
								}else{
									res.json({grabado:true,mensaje:'Usuario Modificado, pero no se pudo encriptar la clave '+resultado_ws.error});
								}
							}catch(error){
								console.log(error);
								res.json({grabado:true,mensaje:'Usuario Modificado, pero no se pudo encriptar la clave'});
							}
							
						});
						}else{
							res.json({grabado:true,mensaje:'Usuario Modificado'});
						}
						
						
					}else{
						if(resultado2 && resultado2.rowCount==0){
							res.json({grabado:false,mensaje:'NO SE PUDO MODIFICAR EL USUARIO'});
						}else{
							res.json({grabado:false,mensaje:resultado2});
						}
					}
				});
		}else{
				sql = "insert into swissedi.eeditusarios_json(usuario,datos_personales_y_perfil,observacion,estado,email) values($1,$2,$3,$4,$5) RETURNING id"
				values = [usuario.usuario, usuario, usuario.observacion, usuario.estado, usuario.email];
				postgres.getPoolClienteConexion(sql,values, function(resultado2){
					if(resultado2 && resultado2.rowCount>0){
						servletWS.encriptarClaveYEnviarEmail(resultado2.rows[0].id, usuario.email, ip, username, function(resultado3){
							try{
								resultado_ws = JSON.parse(resultado3);
							}catch(error){
								console.log(error);
								resultado_ws = null;
							}
							if(resultado_ws && resultado_ws.clavegenerada){
								
								res.json({grabado:true,mensaje:'Usuario Creado!, se ha creado una clave temporal y ha sido enviada a '+usuario.email});
							}else{
								
								res.json({grabado:true,mensaje:'Usuario Creado, pero no se pudo encriptar la clave :: '+(resultado_ws ? resultado_ws.error:'')});
							}
							
							
						});
						
						
					}else{
						res.json({grabado:false,mensaje:resultado2});
					}
				});
		}
	});
	
	
	
}


function getInfoMagapClienteBeneficiario(identificacion, res){
	
	var headers = {
		'Host': 'servicios.agricultura.gob.ec',
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:33.0) Gecko/20100101 Firefox/33.0',
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
		'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
		'Accept-Encoding': 'gzip, deflate',
		'X-Requested-With': 'XMLHttpRequest',
		'X-Prototype-Version': '1.7',
		'Referer': 'http://servicios.agricultura.gob.ec/semillas/index.php',
		'Cookie': 'PHPSESSID=8jdd9u3uacnhiblipcacigk3j3'
	}


	request.get({
		url: 'http://servicios.agricultura.gob.ec/semillas/sitio/comunes/login.php?usr=1302225345&pwd=roberto1',
	   headers:headers
	}, function(error, response, body){
		if(body && body == '1'){//Siginifica que esta logoneado al sistema
			//console.log(response.headers);
			//Importante una vez logoneado se obtiene el header para enviarle como parametros al siguiente url
			request({
				uri: "http://servicios.agricultura.gob.ec/semillas/sitio/vistas/ajax/bene_kit/consulta/AJX_consulta.php?ci_ruc="+identificacion,//?pagina=resultado&opcion=1&texto="+ruc,
				method: "GET",
				headers: response.request.headers,
				timeout : 10000 //Maximo espera 10 segundos por peticion
			}, function(error, response, body) {
				res.send(body); //imprime el resultado en pantalla
			})
		}
	});
}//fin function getInfoMagapClienteBeneficiario




/******************
Eliminando configuracion  del sistema
*********************/
function eliminarjsonconfiguracion_observer(id, res){
	var sqlEliminar = "Delete from swissedi.congfiguraciones where id=$1 ";
	postgres2.getPoolClienteConexion(sqlEliminar,[id], function(resultado){
					if(resultado && resultado.rowCount){
					 
						res.json({'resultado':'ok','total': resultado.rowCount});	
						
					}else{
						res.json(resultado);
					}
	});
}

/*************************************
Grabando configuracion del sistema
Observer archivo
Tamanio del archivo
**/
function garbarjsonconfiguracion_observer(id, datosjson, res){

	try{
		var datosjsonObj = JSON.parse(datosjson);
		
		var esArchivo = false;
			if(datosjsonObj.archivo){
				esArchivo = fs.statSync(datosjsonObj.archivo).isFile();
			}
			
			
		

		if( datosjsonObj.archivo && esArchivo === false){
			res.jsonp("El archivo no existe " + datosjson.archivo);
		}else{
			/***************
				REGISTRO A ACTUALIZAR
			****************/
			if(datosjsonObj && datosjsonObj.id){
				/*********************
					GRABANDO HISTORIAL DE LAS CONFIGURACIONES CUANDO SEAN ACTUALIZADAS
				**********************/
				
				var sqlRegistros = "SELECT json, historial FROM  swissedi.congfiguraciones WHERE ID=$1";
					postgres2.getPoolClienteConexion(sqlRegistros, [datosjsonObj.id], function(resultado){
		
						
						/*********************
							UNA VEZ ENCONTRADO EL REGISTRO HACEMOS UNA CONCATENACION Y ACTUALIZAMOS
						**********************/
						var historial = {datahistorial:[]}
						var conf= JSON.stringify(datosjson);
						conf = JSON.parse(conf.replace('"[','[').replace('"]',']'));
						if(resultado && resultado.rows && resultado.rows[0].historial && resultado.rows[0].historial.datahistorial){
							historial = resultado.rows[0].historial;
							if(historial.datahistorial.length>10){
								historial.datahistorial=[];
							}
							if(resultado.rows[0].json){
								resultado.rows[0].json.fechamod = new Date()
							}
							historial.datahistorial.push(resultado.rows[0].json);
							
						}else{
						   if(resultado && resultado.rows && resultado.rows[0].json){
								resultado.rows[0].json.fechamod = new Date()
								historial.datahistorial[0]=resultado.rows[0].json;
								
								
							}
						}
						var sqlInsert = 'UPDATE swissedi.congfiguraciones SET descripcion = $1,json= $2,fechamodificacion=now(),historial=$3  WHERE ID=$4'; 
						
						
						postgres2.getPoolClienteConexion(sqlInsert,[datosjsonObj.descripcion,conf,historial,datosjsonObj.id], function(resultado){
							if(resultado && resultado.rowCount){
							
								switch(datosjsonObj.accion){
									case 'notificar-001':  //importante debe coincidir con el archivo app_middleware.js linea 475 this.actualizarConfiguracion = function(dato) 
										monitorArchivos.iniciarNotificadorLogsServidor(datosjsonObj);
									break;
									case 'ROEI': 
										/******************
											ROBOT OBTENER EMAILS INVALIDOS
											UNA VEZ GRABADO, EXISTE OTRO PROCESO EN LA PAGINA WEB QUE LO INICIALIZA
										*******************/
										break;
									default:
										if(datosjsonObj.accion.indexOf('R-TP-')>=0){
											/*******
												ACTIVAR CRON
											********/
											 var errorEnLaTarea1 = false;
											 var errorEnLaTarea2 = false;
											 var eliminarTarea1 = false;
											 var eliminarTarea2 = false;
											if(!datosjsonObj.hora.estado){
												tareaProgramada.eleiminarTarea(datosjsonObj.accion,'HS')
												errorEnLaTarea1 = true;
											}

											if(!(datosjsonObj.hora.valor.split(":").length == 2 && !isNaN(datosjsonObj.hora.valor.split(":")[0]) && !isNaN(datosjsonObj.hora.valor.split(":")[0]))){
												errorEnLaTarea1 = true;
											}else{
												eliminarTarea1 = true;
											}
											if(!datosjsonObj.fechahora.estado){
												tareaProgramada.eleiminarTarea(datosjsonObj.accion,'FH')
												errorEnLaTarea2 = true;
											}
											if(errorEnLaTarea1 && errorEnLaTarea2){
												res.json({'resultado':'Registro actualizado, pero No se activo la Tarea. La configuracion esta desactivada','total': 0,'cron':'false'});	
												return
											}
											if(errorEnLaTarea1 && !errorEnLaTarea2){
												res.json({'resultado':'Registro actualizado, Se activo La terea Fecha y Hora. Pero por Hora y Semana no se Activo, por que se encuentra deshabilitada','total': 0,'cron':'false'});	
												if(datosjsonObj.fechahora.estado){
													tareaProgramada.iniciarTareaServicioJsonfecha(datosjsonObj);
												}
												return
											}
											if(!errorEnLaTarea1 && errorEnLaTarea2){
												res.json({'resultado':'Registro actualizado, Se activo La terea por Hora y Semana. Pero por Fecha no se Activo, por que se encuentra deshabilitada','total': 0,'cron':'false'});	
												tareaProgramada.iniciarTareaServicioJson(datosjsonObj);
												return
											}
											if(!errorEnLaTarea1 && !errorEnLaTarea2){
												if(datosjsonObj.fechahora.estado){
													tareaProgramada.iniciarTareaServicioJsonfecha(datosjsonObj);
												}
												tareaProgramada.iniciarTareaServicioJson(datosjsonObj);
											}
										
										
											
										}else{
											monitorArchivos.iniciarWatcher(datosjsonObj);
										}
										
									break;
								}
								res.json({'resultado':'ok','total': resultado.rowCount});	
								
							}else{
								res.json(resultado);
							}
						});
				});
				
			}else{
				/*******************
					NUEVO REGISTRO
				********************/
				var conf= JSON.stringify(datosjson);
				conf = JSON.parse(conf.replace('"[','[').replace('"]',']'));
			
				var sqlInsert = 'INSERT into swissedi.congfiguraciones (descripcion, json) VALUES($1, $2) RETURNING id'; 
				
				
				postgres2.getPoolClienteConexion(sqlInsert,[datosjsonObj.descripcion,conf], function(resultado){
					if(resultado && resultado.rows && resultado.rows[0] && resultado.rows[0].id){
					   
						switch(datosjsonObj.accion){
							case 'notificar-001':  //importante debe coincidir con el archivo app_middleware.js linea 475 this.actualizarConfiguracion = function(dato) 
								monitorArchivos.iniciarNotificadorLogsServidor(datosjsonObj);
							break;
							case 'ROEI':
								/******************
									ROBOT OBTENER EMAILS INVALIDOS
									UNA VEZ GRABADO, EXISTE OTRO PROCESO EN LA PAGINA WEB QUE LO INICIALIZA
								*******************/
								 
							break;
							default:
								if(datosjsonObj.accion.indexOf('R-TP-')>=0){
									/******************
										INICIO DEL CRON
									*******************/
									 var errorEnLaTarea1 = false;
									 var errorEnLaTarea2 = false;
									if(datosjsonObj.hora.valor && datosjsonObj.hora.estado && datosjsonObj.hora.estado !=true){
										res.json({'resultado':'Registro actualizado, pero No se activo la Tarea. La hora no esta activada','total': 0,'cron':'false'});	
										errorEnLaTarea1 = true;
										
									}
									if(!(datosjsonObj.hora.valor.split(":").length == 2 && !isNaN(datosjsonObj.hora.valor.split(":")[0]) && !isNaN(datosjsonObj.hora.valor.split(":")[0]))){
										res.json({'resultado':'Registro actualizado, pero No se activo la Tarea. El formato de la hora no es valido','total': 0,'cron':'false'});	
										errorEnLaTarea1 = true;
									}
									if(!datosjsonObj.fechahora.estado){
										errorEnLaTarea2 = true;
									}
									if(errorEnLaTarea1 && errorEnLaTarea2){
										res.json({'resultado':'Registro actualizado, pero No se activo la Tarea. La configuracion esta desactivada','total': 0,'cron':'false'});	
										return
									}
									if(errorEnLaTarea1 && !errorEnLaTarea2){
										res.json({'resultado':'Registro actualizado, Se activo La terea Fecha y Hora. Pero por Hora y Semana no se Activo, por que se encuentra deshabilitada','total': 0,'cron':'false'});	
										if(datosjsonObj.fechahora.estado){
											tareaProgramada.iniciarTareaServicioJsonfecha(datosjsonObj);
										}
										return
									}
									if(!errorEnLaTarea1 && errorEnLaTarea2){
										res.json({'resultado':'Registro actualizado, Se activo La terea por Hora y Semana. Pero por Fecha no se Activo, por que se encuentra deshabilitada','total': 0,'cron':'false'});	
										tareaProgramada.iniciarTareaServicioJson(datosjsonObj);
										return
									}
									if(!errorEnLaTarea1 && !errorEnLaTarea2){
										if(datosjsonObj.fechahora.estado){
											tareaProgramada.iniciarTareaServicioJsonfecha(datosjsonObj);
										}
										tareaProgramada.iniciarTareaServicioJson(datosjsonObj);
									}
									
										
									
									/**********
										Si se ha definido una tarea por fecha
									***********/
									
								}else{
									monitorArchivos.iniciarWatcher(datosjsonObj);
								}
								
							break;
						}
						
						
						res.json({'resultado':'ok','id': resultado.rows[0].id});
						
					}else{
						
						res.json(resultado);
					}
				});
				
			}
			
			
		}
		
	}catch(error){
		console.log('garbarjsonconfiguracion_observer')
	    console.log(error);
		res.jsonp(error);
	}	
	

}

	/*******************
		CONSULTANDO CONFIGURACIONES
	********************/
	consultarDatosConfiguracion = function(res){
		
		var sqlRegistros = "SELECT * FROM  swissedi.congfiguraciones limit 100 ";
		postgres2.getPoolClienteConexion(sqlRegistros, null, function(resultado){
		
				if(resultado){
					res.jsonp(resultado.rows);
				}else{
					res.json(nohayresultados);
					
				}
		});
		

	}
	/*******************
		CONSULTANDO LISTA DE ERRORES DEL SRI
	********************/
	consultarConceptosSRI = function(res){
		
		var sqlRegistros = "SELECT * FROM  swissedi.eeditconcepto_sri order by id";
		postgres2.getPoolClienteConexion(sqlRegistros, null, function(resultado){
		
				if(resultado){
					res.jsonp(resultado.rows);
				}else{
					res.json(nohayresultados);
					
				}
		});
		

	}
	/*******************
		CONSULTANDO CONFIGURACIONES por descripcion
	********************/
	consultarDatosConfiguracionPorDetalle = function(detalle, res){
		
		var sqlRegistros = "SELECT * FROM  swissedi.congfiguraciones where descripcion=$1 ";
		postgres2.getPoolClienteConexion(sqlRegistros, [detalle], function(resultado){
		
				if(resultado){
					res.jsonp(resultado.rows);
				}else{
					res.json(nohayresultados);
					
				}
		});
		

	}

/****************
GET USUARIOS CONECTADOS
*****************/

function getUsuariosConectados(datosjson, res){

	try{
		var datosjsonObj = JSON.parse(datosjson);
		if(datosjsonObj){
			
			
			
			datosjsonObj.fechaini = datosjsonObj.fechaini ?  formatDate(datosjsonObj.fechaini,'-') : '';
			datosjsonObj.fechafin = datosjsonObj.fechafin ? formatDate(datosjsonObj.fechafin,'-',true) : '';
			var criterios = [];
			var usuario = datosjsonObj.usuario ? ' and m.usuario = $1':'';
			var contador = 1;
			if(usuario){
				criterios.push(datosjsonObj.usuario);
				contador ++;
			}
			var ciudad_ = datosjsonObj.ciudad ? " and m.ubicacion->>'city' ilike $"+contador:"";
			if(ciudad_){
				criterios.push('%'+datosjsonObj.ciudad+'%');
			}
			var idLimite = datosjsonObj.idLimite ? ' and m.id '+(datosjsonObj.avanzar && datosjsonObj.avanzar == true ?'<':'>' )+' '+datosjsonObj.idLimite:'';
			var porFechas = datosjsonObj.fechaini && datosjsonObj.fechafin ? ' and  m.fecha BETWEEN '+datosjsonObj.fechaini+' and '+datosjsonObj.fechafin:'';
			
			var sql = "SELECT  * FROM swissedi.eeditusarios_conectados m WHERE 1=1 "+idLimite+porFechas+usuario+ciudad_+" order by fecha desc limit 100";
			
			postgres2.getPoolClienteConexion(sql,criterios, function(resultado){
					
				if(resultado){
					res.jsonp(resultado.rows);
				}else{
					res.json(nohayresultados);
					
				}
			});
		}else{
			var sqlinsert = "SELECT  * FROM swissedi.eeditusarios_conectados where fecha=now() order by fecha desc limit 100";
			postgres2.getPoolClienteConexion(sqlinsert,null, function(resultado){
					
				if(resultado){
					res.jsonp(resultado.rows);
				}else{
					res.json(nohayresultados);
					
				}
			});
			//res.json(nohayresultados);
		}
	
		
		
	}catch(error){
		console.log("Error en getUsuariosConectados::");
		console.log(error);
	}
}

/*********************************
	Anulacion de un documento autorizado
*********************************/
function setAnulacionDocumentoAutorizado(validador,claveacceso,ip, res){
	var fecha = new Date();
	var observacion = fecha+" :: Documento anulado desde la ip "+ip;
	var sqlinsert = "UPDATE  swissedi.eeditmovimiento set estado='O',observacion = $1 WHERE claveacceso = $2";
			postgres2.getPoolClienteConexion(sqlinsert,[observacion,claveacceso], function(resultado){
					
				if(resultado && resultado.rowCount>0 ){
					console.log('Anulacion de un documento autorizado');
					res.jsonp("ok");
				}else{
					res.json(nohayresultados);
					
				}
			});
	
}

// verifica si el usuario se encuentra autentificado
function isUserAutenficado(req, res, next) {

    //Si lo esta permite el siguiente evento
    if (req.isAuthenticated())
        return next();

    //Si no esta lo envia a la pagina principal
    res.redirect('/');
}

/***************************
	SUBFUNCION QUE ES PARTE IMPORNTANTE PARA REALIZAR BUSQUEDAS POR CRITERIO "IGUAL"
	ES SOLO POR UN CAMPO EN ESPECIFICO
***************************/
function consultarRegistrosDinamicamenteClausulaWhereIgual(columnas, tabla, columna,valor, respuesta){
	var valores=[valor];
	
	var sql = "SELECT "+columnas+" FROM "+tabla+" WHERE "+columna+" = $1";
	console.log(sql);
	postgres2.getPoolClienteConexion(sql,valores, function(resultado){
		if(resultado && resultado.rowCount>0 ){
			respuesta(resultado.rows);
			
		}else{
			respuesta([]);
			
		}
	});
}
/***************************
	SUBFUNCION QUE ES PARTE IMPORNTANTE PARA REALIZAR BUSQUEDAS POR CRITERIO "IGUAL"
	ES SOLO POR UN CAMPO EN ESPECIFICO
	
***************************/
var js2xmlparser = require("js2xmlparser");
function actualizarYEnivarFacturaJson(datosjson, respuesta){
	console.log("actualizarYEnivarFacturaJson");
	var datos=JSON.parse(datosjson);
	var tipodoc = datos.tipodoc;
	console.log("tipodoc "+tipodoc);
	var id= datos.id;
	var dato_json = datos.dato_json;
	var nombre_archivo = datos.nombre_archivo;
	var rutaXmlTranformado = __dirname+"/archivosTransformados/";
	console.log("actualizarYEnivarFacturaJson id "+id);
	console.log("actualizarYEnivarFacturaJson nombre_archivo "+nombre_archivo);
	console.log("actualizarYEnivarFacturaJson rutaXmlTranformado "+rutaXmlTranformado);
	
	postgres.getPoolClienteConexion("UPDATE swissedi.eediarchivos_datos SET datos_texto=$1, modificacion =$2 WHERE id=$3",[dato_json,new Date(),id], function(resultado4){
			console.log(resultado4);

			var datoXmlTransformado = js2xmlparser(tipodoc === "1"? "factura":"notaCredito", dato_json);
			
			for(var i=0;i<10;i++){datoXmlTransformado=datoXmlTransformado.replace(/<\w+><\/\w+>/g,"").replace(/\d>/,">").replace(/campoAdicional\d/g,"campoAdicional").replace(/"><\//g,'">NO-HAY-DATOS<\/')};

			fs.writeFile(rutaXmlTranformado+nombre_archivo.replace('.xml','_transformado_mod.xml'), datoXmlTransformado, function (err) {
				  if (err) throw err;
				  var attachments=[];
				 attachments.push(fs.createReadStream(rutaXmlTranformado+nombre_archivo.replace('.xml','_transformado_mod.xml')));
				 servletWS.enviarArchivoXmlWS(attachments, "alien200525", function(resp_){
						console.log(resp_);
						if(resp_ && resp_.id>0){
							
								postgres.getPoolClienteConexion("UPDATE swissedi.eediarchivos_datos SET movimiento_id=$1 WHERE id=$2",[resp_.id ,id], function(resultado5){
									respuesta(resp_);
									return;
								});
						}else{
							respuesta(resp_);
									return;
						}
								
											
				});
			});
		
	});	
	
}
function grabarDirectorioImgEnEmpresa(empresa_id, nombre_archivo){
	console.log("grabarDirectorioImgEnEmpresa ");
	console.log("grabarDirectorioImgEnEmpresa "+empresa_id);
		console.log("grabarDirectorioImgEnEmpresa "+nombre_archivo);
	var codigo="imagen"
    postgres.getPoolClienteConexion("SELECT directorio FROM swissedi.eeditarchivos_conf WHERE nombre=$1",[codigo], function(resultado){

    console.log(resultado);
		if(resultado && resultado.rowCount>0 && resultado.rows && resultado.rows[0] && resultado.rows[0].directorio){
			if(resultado.rows[0].directorio.split("public").length ==2){
				 postgres.getPoolClienteConexion("UPDATE swissedi.eeditempresa set urllogo = $1  WHERE id=$2",[resultado.rows[0].directorio.split("public")[1]+"/"+empresa_id+"/"+nombre_archivo,empresa_id], function(resultadoa){
						console.log(resultadoa);
				 });
			}
		}
    });

}
function grabarConfiguracionesWebservice(datos, respuesta){
console.log("grabarConfiguracionesWebservice");
console.log(datos);
	var datosWS = JSON.parse(datos);
	var id = datosWS.id;
	console.log(datosWS);
	/*******
	VERIFICANDO SI TIENE ID PARA GRABAR COMO NUEVO REGISTRO
	********/
	console.log("registro "+id);
	console.log("registro "+(id && (id === 0 || id === "0")));
	if((id === 0 || id === "0")){
		console.log("nuevo registro");
		/*******
		NUEVO REGISTRO
		********/
		/*if(!(datosWS.wsconfiguracion && datosWS.wsconfiguracion.empresa && datosWS.wsconfiguracion.empresa.id)){
			console.log("No se encontro una empresa");
			respuesta("No se encontro una empresa");
			return;
		}
		*/

		postgres.getPoolClienteConexion("INSERT INTO swissedi.eeditconfiguraciones_webservice(empresa_id, estado, fecha_creacion, informacion) VALUES($1,$2,$3,$4)",[datosWS.wsconfiguracion.empresa, datosWS.wsconfiguracion.estado,new Date(),datosWS.wsconfiguracion ], function(resultado){
			console.log(resultado);
			if(resultado && resultado.rowCount>0 ){
				if(datosWS.wsconfiguracion.logoride && datosWS.wsconfiguracion.logoride.info && datosWS.wsconfiguracion.logoride.info.name){
					grabarDirectorioImgEnEmpresa(datosWS.wsconfiguracion.empresa,  datosWS.wsconfiguracion.logoride.name);
				}
				servletWS.actualizarWS(datosWS.wsconfiguracion.empresa, function(resp_){
					if(resp_ === "ok" ||resp_ === '"ok"'){
						respuesta("ok");
					}else{
						respuesta({grabado:true,actualizadows:false,mensaje:resp_});
					}
					
					
				});
				
			}else{
				respuesta({error:(resultado.detail?resultado.detail:"Error al grabar el registro")});
			}
		});
	}else{
		/*******
		ACTUALIZA EL REGISTRO
		********/
		var historialA; 
		postgres.getPoolClienteConexion("SELECT informacion, historial FROM swissedi.eeditconfiguraciones_webservice WHERE id=$1",[id ], function(resultado){
			if(resultado && resultado.rowCount>0 ){
				var historial = resultado.rows[0].informacion;
				if(!historial){
					historial = {};
				}
				historial.modificacion = new Date();
				if(resultado.rows[0] && resultado.rows[0].historial){
					
					resultado.rows[0].historial.datos.push(historial);
					historialA = resultado.rows[0].historial;
				}else{
					historialA = {datos:[historial]};
				}
				console.log("A modificar ws");
				postgres.getPoolClienteConexion("UPDATE swissedi.eeditconfiguraciones_webservice SET empresa_id=$1, estado=$2, fecha_cambio=$3, informacion=$4,historial=$5 WHERE id=$6",[datosWS.wsconfiguracion.empresa, datosWS.wsconfiguracion.estado,new Date(),datosWS.wsconfiguracion,historialA, id ], function(resultado){

					console.log(resultado);
					if(resultado && resultado.rowCount>0 ){

					   console.log(datosWS.wsconfiguracion.logoride);
						if(datosWS.wsconfiguracion.logoride && datosWS.wsconfiguracion.logoride.info && datosWS.wsconfiguracion.logoride.info.name){
							grabarDirectorioImgEnEmpresa(datosWS.wsconfiguracion.empresa,  datosWS.wsconfiguracion.logoride.info.name);
						}

						servletWS.actualizarWS(datosWS.wsconfiguracion.empresa, function(resp_){
							console.log(resp_);
							if(resp_ instanceof String && resp_.indexOf("ok::ws")>=0){
								respuesta("ok");
							}else{
								respuesta({grabado:true,actualizadows:false,mensaje:resp_});
							}
							
							
						});
						//respuesta("ok");
					}else{
						respuesta({error:(resultado.detail?resultado.detail:"Error al grabar el registro")});
					}
				});
			}
		});
		
	}

}

function validarExistenciaArchivos(empresa_id,tipo, archivo, res){

		//Get Ruta
		postgres.getPoolClienteConexion("SELECT directorio FROM swissedi.eeditarchivos_conf WHERE nombre=$1",[tipo], function(resultado){
			if(resultado && resultado.rowCount>0 && resultado.rows && resultado.rows[0] && resultado.rows[0].directorio){
				fs.exists(resultado.rows[0].directorio+'/'+empresa_id + '/' + archivo, function (exists) {
                                  console.log(exists ? "it's there" : 'no passwd!');
                                  res(exists);
                        });
			}

		});

}



function getConfiguracionesWebservice(empresa_id, respuesta){
	
		postgres.getPoolClienteConexion("SELECT * FROM swissedi.eeditconfiguraciones_webservice WHERE empresa_id=$1",[empresa_id ], function(resultado){
			if(resultado && resultado.rowCount>0 ){
				if(resultado.rows[0].informacion && resultado.rows[0].informacion.logoride && resultado.rows[0].informacion.logoride.name){

					validarExistenciaArchivos(empresa_id,"imagen", resultado.rows[0].informacion.logoride.info.name, function(res){

                    					console.log("validarExistenciaArchivos**************");
                    					console.log(resultado.rows[0].informacion.logoride.info.name);
                    					console.log(res);
                    						if(!res){
                    							resultado.rows[0].informacion.logoride.error="El archivo "+resultado.rows[0].informacion.logoride.info.name+" no existe, por favor intente bajar el archivo, si lo logra bajar elimine y vuelava a subir el archivo en caso contrario vuelva a subir el archivo";
                    						}else{
                    							resultado.rows[0].informacion.logoride.error="";
                    						}

                    						if(resultado.rows[0].informacion.certificadobc && resultado.rows[0].informacion.certificadobc.archivop12 && resultado.rows[0].informacion.certificadobc.archivop12.name){
                    							validarExistenciaArchivos(empresa_id,"archivo12-banco-central", resultado.rows[0].informacion.certificadobc.archivop12.name, function(res){
                    								if(!res){
                    									resultado.rows[0].informacion.certificadobc.error="El archivo "+resultado.rows[0].informacion.certificadobc.archivop12.name+" no existe, por favor intente bajar el archivo, si lo logra bajar elimine y vuelava a subir el archivo en caso contrario vuelva a subir el archivo";
                    								}else{
                    									resultado.rows[0].informacion.certificadobc.error="";
                    								 }
                    								respuesta(resultado.rows);
                    							 });
                    						}else{
                    							respuesta(resultado.rows);
                    						}



                    				})

				}else{

					if(!resultado.rows[0].informacion.logoride){resultado.rows[0].informacion.logoride={}};
					resultado.rows[0].informacion.logoride.error = "Por favor vuela a subir el logo";
					respuesta(resultado.rows);
				}



			}else{
				respuesta(nohayresultados);
			}
		});
	
}

function getInfoArchivop12(nombre, clave,rol,empresa, respuesta){
	
	if(rol === 'admin'){
		var codigo="archivo12-banco-central"
			postgres.getPoolClienteConexion("SELECT directorio FROM swissedi.eeditarchivos_conf WHERE nombre=$1",[codigo ], function(resultado){
				if(resultado && resultado.rowCount>0 && resultado.rows && resultado.rows[0] && resultado.rows[0].directorio){
					
					servletWS.getInformacionArchivop12(resultado.rows[0].directorio,nombre,clave,empresa,  function(respuestaws){
						console.log(respuestaws);
						respuesta(respuestaws)
					});
				}else{
					respuesta("NO se encontro la ubicacion del archvio");
				}
			});
	}else{
		respuesta("no tiene permisos");
	}
}


function getActualizarEmailPersona(identificacion, email, respuesta){
	if(identificacion && email){
			//Validando email
			var emailCheck=/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
			var emailNovalidos = [];
			var emailYaExisten = [];
			var emailValidos = [];
			var emailsNuevos = [];
			 console.log("email.split(",")");
			console.log(email.split(","));
			console.log("for ***********+");
			for(var i=0;i<email.split(",").length;i++){
				console.log(email.split(",")[i] + " res   "+(emailCheck.test(email.split(",")[i])));
				if(!emailCheck.test(email.split(",")[i])){
					emailNovalidos.push(email.split(",")[i]);
				}else{
					emailValidos.push(email.split(",")[i]);
				}
			}
			console.log("for ***********+");
				
			if(email.split(",").length === emailNovalidos.length){
				respuesta("La identificacion "+identificacion+", resultado:: email"+(email.split(",").length >1?"s":"")+ " no valido"+(email.split(",").length >1?"s":"")+" :: "+email);
				return;
			}
			
			postgres.getPoolClienteConexion("SELECT id, email from  swissedi.eeditpersona WHERE identificacion=$1",[identificacion ], function(resultado){
				if(resultado && resultado.rowCount>0 && resultado.rows && resultado.rows[0]  && resultado.rows[0].id){
				   var email_ = "";
				     console.log("emailValidos");
				    console.log(emailValidos);
					if(resultado.rows[0].email){
						 email_ = resultado.rows[0].email.split('\n')[resultado.rows[0].email.split("\n").length-1];
						console.log(email_);
						for(var i = 0;i<emailValidos.length;i++){
							if(email_.toLowerCase().indexOf(emailValidos[i].toLowerCase())>=0){
								emailYaExisten.push(emailValidos[i]);
							}else{
								emailsNuevos.push(emailValidos[i]);
								email_ +=","+emailValidos[i];
							}
						}
					}else{
						for(var i = 0;i<email.split(",").length;i++){
							emailsNuevos.push(email.split(",")[i]);
						}
						  
						email_ = emailsNuevos.join(",");
					}
					console.log(emailsNuevos);
					if(emailsNuevos.length>0){
						postgres.getPoolClienteConexion("UPDATE  swissedi.eeditpersona SET email = $1 WHERE identificacion=$2",[email_.toLowerCase(), identificacion ], function(resultado1){
							if(resultado1 && resultado1.rowCount>0 ){
								respuesta("Email actualizado a  "+email_ + "; Emails nuevos ::"+emailsNuevos.join(","));
							}else{
								respuesta("Email anterior "+email_+", email no actualzado "+email);
								
							}
							return;
						});
					}else{
						respuesta("No exsiten emails nuevos, por favor compare  "+resultado.rows[0].email + " con los que se intenta actualizar "+email);
						return;
					}
					
					setTimeout(function() {
						respuesta("Time out..al actualizar a la persona");
						return;
					},600000);
				}else{
					respuesta("NO se encontro una persona con la identificacion "+identificacion);
					return;
				}
			});
			setTimeout(function() {
					respuesta("Time out.. al buscar a la personsa");
					return;
			},600000);
			
	}else{
		respuesta("Identificacion  no puede estar vacia");
		return;
	}
}


function getClientesFormatoExcel(columnas,rol, respuesta){
	
	if(rol === 'admin'){
		
			postgres.getPoolClienteConexion("SELECT " +columnas.split(",").join(",")+ " FROM swissedi.eeditpersona order by id desc",[ ], function(resultado){
				respuesta(resultado.rows);
			});
	}else{
		respuesta(false);
	}
}
function getClientesFormatoJson(columnas,identificacion,uidd, respuesta){
	console.log(uidd);
	if(uidd){
		//Tomar alguna accion
	}
	if(identificacion === "-1" ||identificacion === -1){
		postgres.getPoolClienteConexion("SELECT " +columnas.trim().split(",").join(",")+ " FROM swissedi.eeditpersona order by id desc limit 100",[ ], function(resultado){
				respuesta(resultado.rows);
			});
	}else{
		postgres.getPoolClienteConexion("SELECT " +columnas.trim().split(",").join(",")+ " FROM swissedi.eeditpersona WHERE identificacion = $1",[identificacion], function(resultado){
				respuesta(resultado.rows);
			});
	}
		
			
	
}

function grabarEmpresa(datos, respuesta){


	postgres.getPoolClienteConexion("insert into swissedi.eeditempresa(codigo,descripcion,ruc) values($1,$2,$3) RETURNING id",[datos.RUC,datos.RazonSocial,datos.RUC], function(resultado){
		console.log(resultado)
		if(resultado  && resultado.rows && resultado.rows && resultado.rows[0] && resultado.rows[0].id){
			respuesta({tipo:"success",mensaje:"Empresa creada"});
		}else{
			respuesta({tipo:"error",mensaje:"Empresa NO CREADAD "});
		}

	});
}

function consultarEmpresasPorRuc(ruc,respuesta){
	postgres.getPoolClienteConexion("SELECT id FROM swissedi.eeditempresa WHERE ruc = $1",[ruc], function(resultado){

    		if(resultado  && resultado.rows && resultado.rows && resultado.rows[0] && resultado.rows[0].id){
    			respuesta({tipo:"success",id:resultado.rows[0].id, encontrado:true});
    		}else{
    			respuesta({tipo:"error",mensaje:"Empresa NO CREADAD ",encontrado:false});
    		}

    });
}

function enviarJsonParaGrabarRecepcioDocumentos(datos,ruc,origen,grabarBytes, respuesta){

		consultarEmpresasPorRuc(ruc,function(resultadoEmpresa){

			if(resultadoEmpresa.encontrado){
				/***************
					CREANDO EL JSON
				****************/
					//Oteniendo el id del tipo de documento
					var jsonClaveAcceso = getJsonFromClaveAcceso(datos.claveAcceso);
					if(jsonClaveAcceso.error){
						respuesta({error:true,mensaje:jsonClaveAcceso.mensaje})
						return;
					}else{
						//Validacion de la clave de acceso con el resto de informacion
						if(!(jsonClaveAcceso.ruc === datos.ruc && jsonClaveAcceso.serie === datos.serie && jsonClaveAcceso.comprobante === datos.comprobante && jsonClaveAcceso.fechaEmision === datos.fechaEmision.replace("/","").replace("/",""))){
							respuesta({error:true,mensaje:"Los datos en la tabla html no coinciden con los datos extraidos de la clave de acceso",jsonClaveAcceso:jsonClaveAcceso,datos:datos})
                            return;
						}
						consultarRegistrosDinamicamenteClausulaWhereIgual("id", "swissedi.eedittipo_documento_sri", "codigo",jsonClaveAcceso.codDoc, function(resultado){
							if(resultado && resultado[0] && resultado[0].id){

								var jsonAGrabar={empresa_id:resultadoEmpresa.id,fechacreacion:new Date(),tipodocumentosri_id:resultado[0].id,fechaemision:new Date(formatDateV2(jsonClaveAcceso.fechaEmision,"/",null)),fechasri:new Date(formatDateV2(datos.fechaAutorizacion.split(" ")[0].replace("/","").replace("/",""),"/",null)+" "+datos.fechaAutorizacion.split(" ")[1]),claveacceso:datos.claveAcceso,serie:datos.serie,comprobante:datos.comprobante,estado:'A',numeroautorizacion:datos.numeroAutorizacion,tipoemision:jsonClaveAcceso.tipoEmision,ambiente:jsonClaveAcceso.ambiente,origen:origen};

								if(grabarBytes && datos.urlxml && datos.urlpdf ){
									console.log("Gragando archivos xml "+datos.urlxml)
									jsonAGrabar["xmlsri"]=fs.createReadStream(datos.urlxml);
									jsonAGrabar["ride"]=fs.createReadStream(datos.urlpdf);
									/*fs.readFile(datos.urlxml, function(err, data)  {

											console.log("Gragando archivos xml "+datos.urlxml+" encontrado")
                                          	jsonAGrabar["xmlsri"]=data;
                                          	console.log("Gragando archivos pdf "+datos.urlpdf)
                                          	fs.readFile(datos.urlpdf, function(err, data1)  {


                                                    	console.log("Gragando archivos pdf "+datos.urlpdf+" encontrado")
                                                    	console.log(data1)
                                                    	jsonAGrabar["ride"]=data1;
                                                    	postgres.grabarJson(jsonAGrabar,"swissedi.eeditrecepcion_documentos", function(respuestaGJ){
                                                        		respuesta(respuestaGJ);
                                                        })


                                             });


                                    });*/
                                    postgres.grabarJson(jsonAGrabar,"swissedi.eeditrecepcion_documentos", function(respuestaGJ){
                                                            				respuesta(respuestaGJ);
                                                            			})
								}else{
								console.log("no Gragando archivos ");
								console.log("no Gragando archivos "+grabarBytes);
									postgres.grabarJson(jsonAGrabar,"swissedi.eeditrecepcion_documentos", function(respuestaGJ){
                        				respuesta(respuestaGJ);
                        			})
								}




							}else{
								respuesta({error:true,mensaje:"No se encontro el id del codigo de documento "+jsonClaveAcceso.codDoc})
								return;
                            }


						})

					}


			}else{
				respuesta({error:true,mensaje:"RUC NO ECONTADO"})
			}
		});


}
function  getJsonFromClaveAcceso(claveacceso){
	 if(claveacceso && claveacceso.length === 49){
	 	return {fechaEmision:claveacceso.substring(0,8),codDoc:claveacceso.substring(8,10),ruc:claveacceso.substring(10,23),ambiente:claveacceso.substring(23,24),serie:claveacceso.substring(24,30),comprobante:claveacceso.substring(30,39),codigoNumerico:claveacceso.substring(39,47),tipoEmision:claveacceso.substring(47,48),digitoVerficador:claveacceso.substring(48,49)}
	 }else{
	 	return {error:true,mensaje:"Clave de acceso no valida, la longitud es diferente a 49 "+claveacceso}
	 }
}
function getTableFromJson(datosJson){
	var filas_ = '';
	var labels = {'razonsocial':'Raz&oacute;n Social:','ruc':'RUC:','nombrecomercial':'Nombre Comercial:','estadodelcontribuyenteenelruc':'Estado del Contribuyente en el RUC:','clasedecontribuyente':'Clase de Contribuyente:','tipodecontribuyente':'Tipo de Contribuyente:','obligadoallevarcontabilidad':'Obligado a llevar Contabilidad:','actividadeconomicaprincipal':'Actividad Econ&oacute;mica Principal:','fechadeiniciodeactividades':'Fecha de inicio de actividades:','fechaactualizacion':'Fecha actualizaci&oacute;n:','direccion':'Direcci&oacute;n:','ubicacion':'Ubicaci&oacute;n:','totalestab':'Total de establecimeintos:'};
	for(var key_ in  datosJson){
		filas_ = filas_ + '<tr><td>'+(labels[key_] ? labels[key_]:key_)+'</td><td>'+datosJson[key_]+'</td></tr>'
	}
	return '<table>' + filas_ +'</table>';
}
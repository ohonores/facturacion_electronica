#!/bin/env node
/**************
	Manejo de archivos
 *******************/
 
var sys = require('sys')
var exec = require('child_process').exec;
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var request = require("request");
/****************
	Passporte ingreso al sistema
*****************/
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
zlib = require('zlib');
var http = require('http');
//var flash  = require('connect-flash');
var express = require('express')

, app = express()
, server = require('http').createServer(app)
io = require('engine.io').attach(server)
/*, io = require("socket.io").listen(server)*/
, _ = require('underscore')._;

/**************
Logger
********************/
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'ediwebpage',
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
});

var session  = require('express-session');
/***********
	CONFIGURACION DE REDIS, SI NO TIENE LA BASE DE REDIS POR FAVOR COMENTAR HASTA "FIN REDIS"
*************
var redis = require("redis").createClient(6379,'localhost');
var RedisStore = require('connect-redis')(session);
/*********FIN REDIS**************/


var conexiones = [];
var puertoPrincipal =80;  //8080;Conauto//8084;QUI; //80; Farmagro
/***********CONFIGURACION LOCALHOST
**********/
var redLocal = "localhost";
var puertoLocal = "8080";
var hostSwissEdi = redLocal+":"+puertoLocal;
var puertoTablasTransitorias = "8081/swissedi-tablaProduccionATablasTransito";
var puertoWS = "8444/swisedi-webService";
var hostSwissEdiTablasTransitorias = redLocal+":"+puertoTablasTransitorias;
var hostSwissEdiWS = redLocal+":"+puertoWS;
/********/
/*****************
ECUAQUIMICA****
var redLocal = "localhost";
var puertoLocal = "8080";
var hostSwissEdi = redLocal+":"+puertoLocal;
var puertoTablasTransitorias = "8016/swissedi-tablaProduccionATablasTransito";
var puertoWS = "8444/swisedi-webService";
var hostSwissEdiTablasTransitorias = redLocal+":"+puertoTablasTransitorias;
var hostSwissEdiWS = redLocal+":"+puertoWS;
*************/
/**************
	CONAUTO
*******************
var redLocal = "localhost";
var puertoLocal = "8081";
var hostSwissEdi = redLocal+":"+puertoLocal;
var puertoTablasTransitorias = "8083/swissedi-tablaProduccionATablasTransito";
var puertoWS = "8448/swisedi-webService";
var hostSwissEdiTablasTransitorias = redLocal+":"+puertoTablasTransitorias;
var hostSwissEdiWS = redLocal+":"+puertoWS;

*******/

/********************
QUICORNAC
**********************
var redLocal = "localhost";
var puertoLocal = "8080";
var hostSwissEdi = redLocal+":"+puertoLocal;
var puertoTablasTransitorias = "8081/swissedi-tablaProduccionATablasTransito";
var puertoWS = "8443/swisedi-webService";
var hostSwissEdiTablasTransitorias = redLocal+":"+puertoTablasTransitorias;
var hostSwissEdiWS = redLocal+":"+puertoWS;

*************************************/
/*******
	farmagro
*******
var redLocal = "localhost";
var puertoLocal = "8081";        
var hostSwissEdi = redLocal+":"+puertoLocal;
var puertoTablasTransitorias = "8083/swissedi-tablaProduccionATablasTransito";
var puertoWS = "8443/swisedi-webService";
var hostSwissEdiTablasTransitorias = redLocal+":"+puertoTablasTransitorias;
var hostSwissEdiWS = redLocal+":"+puertoWS;  
/*****/
/****************************************
	CONEXION BASE DE DATOS :: POSTGRES
	Variable pg
****************************************/
var postgres = require('./conexion-basedatos/conexion-postgres.js');
var postgres2 = require('./conexion-basedatos/conexion-postgres.js');
var postgres3 = require('./conexion-basedatos/conexion-postgres.js');


var usuarioConectados = [];
app.configure(function() {
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || puertoPrincipal);
  	app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
	//app.use(express.logger());
	app.use(express.cookieParser('alien'));
	app.use(express.bodyParser());
	//app.use(express.json());  -->si se quit express.bodyParser(), se debe descomentar
	//app.use(express.urlencoded());-->si se quit express.bodyParser(), se debe descomentar
	//app.use(express.multipart());-->si se quit express.bodyParser(), se debe descomentar
	app.use(express.methodOverride());
	/***********
	CONFIGURACION DE REDIS, SI NO TIENE LA BASE DE REDIS POR FAVOR COMENTAR HASTA "FIN REDIS"
	***************/
	app.use(express.session({ secret: 'alien' }));
	/*************/
	/***********
	CONFIGURACION DE REDIS, SI NO TIENE LA BASE DE REDIS POR FAVOR COMENTAR HASTA "FIN REDIS" Y COMENTAR LA LINEA SUPERIOR -->app.use(express.session({ secret: 'alien' }));
	*************
	app.use(express.session({ store: new RedisStore({ host:'localhost', port:6379, prefix:'sessi',client:redis}), secret: 'lolcat',cookie:{maxAge:8640000} }));
	/***************/
	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use('/components', express.static(__dirname + '/components'));
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/icons', express.static(__dirname + '/icons'));
	
	app.set('views', __dirname + '/views');
	app.engine('html', require('ejs').renderFile);
	
	
});

var agentOptions_= {
					//cert: fs.readFileSync("C:/restful-nodeEdi-v01/certificados/client.cer"),
					//key: fs.readFileSync("C:/restful-nodeEdi-v01/certificados/client.keystore"),
					// Or use `pfx` property replacing `cert` and `key` when using private key, certificate and CA certs in PFX or PKCS12 format: 
					pfx: fs.readFileSync(__dirname+"/certificados/KEYSTORE.p12"), 
					passphrase: 'Alien20150521EQ',
					securityOptions: 'SSLv2',
					strictSSL: false, // allow us to use our self-signed cert for testing
					rejectUnauthorized: false
					//rejectUnhauthorized : false
				};

/****************************************
	SERVICIOS CON EL SERVLET DE WS
****************************************/

var servletWS = require('./conexion-servletsws/conexionWS.js');

servletWS.instanciarVariables(hostSwissEdiWS,hostSwissEdiTablasTransitorias,agentOptions_);






/*NOTIFICACION ELECTRONICA POR ID DEL DOCUMENTO
 * 1.- Se crea un namespace por empresa
 * 2.- Se crea un room por id para enviar notificaciones(envio al sri, autorizacion del sri, ride, email)
 * 3.- Una vez culminado el servidor elimina ese room*/
var series = [];
var conexiones = [];
var usuariosConectadosParaNotificacion = [];
var notificacionesLista = false;
function NOTIFICACIONELECTRONICA(empresas){
	return;
	
	if(notificacionesLista == true){
		return;
	}
	empresas.push({ruc:'invitados'}); //para registrar a los invitados del sistema que son nuestros clients
	
	empresas.push({ruc:'middleware'});
	empresas.push({ruc:'usuarios'});
	empresas.push({ruc:'watchers'}); //usuario ->watcher, grupo->watcher
	empresas.push({ruc:'tablastransito'}); //usuario ->transito, grupo->transito
	empresas.push({ruc:'chatClientes'});
	empresas.push({ruc:'administrado'}); //usuario ->transito, grupo->transito
	empresas.push({ruc:'tareas-realizadas'}); //usuario ->transito, grupo->transito
	empresas.push({ruc:'bitacoraArchivos'}); //usuario ->transito, grupo->transito
	empresas.push({ruc:'grabarxmltojson'}); //usuario ->transito, grupo->transito
	
	for(var id=0; id<empresas.length; id++){
		console.log("conexion "+empresas[id].ruc);
	conexiones[empresas[id].ruc]= io
		.of('/'+empresas[id].ruc)
		.on('connection', function (socket) {
		   
			var joinedRoom = null;
			//Creamos un room
			socket.on('nuevoUsuario', function(jsonmensaje){
				// console.log('mensaje '+jsonmensaje);
				 var jsonmensajed;
			//  var jsonmensaje = JSON.parse(json_mensajei);
				//seteamos el usuario en el sockect
				 //console.log('mensaje despues '+jsonmensaje);
				 if(jsonmensaje.usuario){
					  console.log('usuario '+jsonmensaje.usuario);
					 // if(usuariosConectadosParaNotificacion.indexOf(jsonmensaje.usuario)<0){
						 socket.usuario = jsonmensaje.usuario;
					 // }
					 
				 }else{
					 jsonmensajed = JSON.parse(jsonmensaje);
					  //console.log('usuario '+jsonmensajed[0].usuario);
					  //if(usuariosConectadosParaNotificacion.indexOf(jsonmensajed[0].usuario)<0){
						socket.usuario = jsonmensajed[0].usuario;
					 // }
					  
				 }
				  if(jsonmensaje.serie){
					  //console.log('usuario '+jsonmensaje.serie);
					 // if(series.indexOf(jsonmensaje.serie)<0){
						 socket.room = jsonmensaje.serie;
					 // }
					 joinedRoom = jsonmensaje.serie;
				 }else{
					  //console.log('usuario '+jsonmensajed[0].serie);
					   //if(series.indexOf(jsonmensajed[0].serie)<0){
						 socket.room = jsonmensajed[0].serie;
					  // }
					   joinedRoom = jsonmensajed[0].serie;
				 }
				
				 
				//console.log(io.sockets);
				// seteamos el room que vendria a ser la serie
				
				if(series.indexOf(joinedRoom)<0){
					socket.join(joinedRoom);
					series.push(joinedRoom);
					socket.emit('usuario_conectado', {mensaje:socket.usuario + ' Conectado'});
					/************
						NOTIFICAR USARIO CONECTADO SEGUN EL NAMESPACE
					*************/
					/*switch(empresas[id].ruc){
						case 'chatClientes':
							socket.emit('usuario_conectado', {mensaje:socket.usuario + ' Conectado'});
						break;
						
					}*/
				}else{
					console.log(new Date());
					console.log('ya existe el usuario ingresado '+joinedRoom);
				}
				
				// nos unimos al sockect con el room
				
				
				
				
			//	var rooms = io.sockets.manager.roomClients[socket.id];
				
				console.log('io.sockets*****************');
			
				console.log('series*****************');
				try{
					socket.broadcast.emit('notificarPersonasIngresadas', {usuario:socket.usuario,room:joinedRoom,mensaje:jsonmensaje.mensaje,email:jsonmensaje.email});
				}catch(error){
					console.log(error);
				}
			});
			
			// when the client emits 'sendchat', this listens and executes
		socket.on('servidor_notificar', function (data) {
			var json_data = JSON.parse(data);
			//console.log('mensaje '+data);
			// we tell the client to execute 'updatechat' with 2 parameters
			socket.broadcast.to(json_data.room).send(json_data);
				 
					 
		});
		socket.on('mensaje', function (data) {
			// we tell the client to execute 'updatechat' with 2 parameters
			//console.log('mensaje '+joinedRoom);
			socket.broadcast.to(joinedRoom)
							 .send(data);
					  console.log('mensaje '+data);
		});
		socket.on('servidor_elimina_room', function(room){
			// leave the current room (stored in session)
			socket.leave(room);
		});
			
			// when the user disconnects.. perform this
		socket.on('disconnect', function(){
			console.log('abandono '+socket.room);
			socket.leave(socket.room);
			var i = series.indexOf(socket.room);
			if(i != -1) {
				series.splice(i, 1);
			}
			socket.broadcast.emit('notificarChatUsuarioDesconectado', {usuario:socket.usuario,room:joinedRoom});
			
		});
			
			// when the client emits 'sendchat', this listens and executes
		socket.on('sendchat', function (data) {
			// we tell the client to execute 'updatechat' with 2 parameters
			try{
			//io.sockets.in(socket.room).emit('updatechat', socket.usuario, data);
			}catch(error){
			  console.log(error);
			}
			try{
			socket.broadcast.to(socket.room).emit('updatechat', data);
			}catch(error){
			   console.log(error);
			}
			console.log(data);
			//console.log('socket.usuario '+socket.usuario);
			//console.log('socket.room '+socket.room);
			try{
					socket.broadcast.emit('notificarChatMensajeAdmin', {usuario:socket.usuario,room:socket.room,mensaje:data});
				}catch(error){
					console.log(error);
				}
		});
		socket.on('sendchatAdmin', function (data) {
			// we tell the client to execute 'updatechat' with 2 parameters
			
			try{
			console.log(data)
				socket.broadcast.to(data.room).emit('updatechat',data);
			}catch(error){
			   console.log(error);
			}
			
		});
		/************
			Get usuarios Conectados
		*************/
        socket.on('getconectados', function (data) {
			// we tell the client to execute 'updatechat' with 2 parameters
			
			try{
			console.log(data)
				socket.broadcast.to(data.room).emit('conectados',series);
			}catch(error){
			   console.log(error);
			}
			
		});
	});
	notificacionesLista = true;
} //FIN FUNCION NOTIFICACIONELECTRONICA  

  

 




}//fin for


/****************************************
	CONEXION BASE DE DATOS :: POSTGRES
	Variable pg
****************************************/

postgres3.consultarempresasParaSocketIO(NOTIFICACIONELECTRONICA);
























/**************
	MONITOR DE ARCHIVOS
***************/
var archivosMonitoriados = [];

var docsTablasTransitoEmpresas = []; //{empresa:1,registrosPorEmpresa:docsTablasTransito}
var docsTablasTransitoWService = []; //{empresa:1,registrosPorEmpresa:docsTablasTransito}

var MonitorArchivos = require('./modulos_edi/MonitorArchivos.js');
var TareaProgramada = require('./modulos_edi/tareasProgramadas.js');
TareaProgramada.instanciarVariables(postgres2,servletWS,MonitorArchivos);
MonitorArchivos.instanciarVariables (docsTablasTransitoEmpresas, docsTablasTransitoWService, archivosMonitoriados,conexiones);



// =====================================
// RUTAS BASICAS PARA EL MANEJO DEL SISTEMA,==============================
// =====================================
require('./modulos_edi/rutas.js')(app, passport,servletWS); // load our routes and pass in our app and fully configured passport
require('./modulos_edi/rutasEdi.js')(app, postgres,postgres2, supportCrossOriginScript, servletWS,MonitorArchivos,TareaProgramada); // load our routes and pass in our app and fully configured passport



require('./modulos_edi/passportEdi.js')(passport,hostSwissEdiWS,postgres, LocalStrategy, agentOptions_); // pass passport for configuration



/*
Servicios para conexion con servlets de swissEdi
*/
// CODIGO 030
app.get('/sesion-usuario/:propiedad', supportCrossOriginScript, function(req, res){
	servletWS.getSesionUsuarioMB(req.params.propiedad, res);
});
// CODIGO 031
app.get('/sesion-usuario/:propiedad', supportCrossOriginScript, function(req, res){
	servletWS.getSesionUsuarioMB(req.params.propiedad, res);
});
// CODIGO 032
app.get('/sesion-usuario/thumbnail/:origen/:destino',  function(req, res){
	servletWS.setThumbnail(req.params.origen, req.params.destino, res);
});
// CODIGO 033
app.get('/sesion-usuario/imagen/:propiedad', supportCrossOriginScript, function(req, res){
var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        servletWS.getImagenCaptcha(req.params.propiedad,ip, res);                  
});

	/***********************************
			LLAMADA A ROBOTOS
	*************************************/
	
	/**************************************
	LLAMADA AL SERVLET DE SWISSEDI(PAGINA WEB) PARA INICIAR O PARAR LOS ROBOTS DEL WEB SERVICE
	ojo llamada directo al webservice y no a la pagina
	// CODIGO 034
	***************************************/
	app.get('/robots-ws/:empresa/:accion/:codigo/:id/:estados', supportCrossOriginScript, function(req, res){
		console.log(req.params);
		servletWS.procesarRoborEdiWS(req.params.empresa, req.params.accion, req.params.codigo,req.params.id,req.params.estados,res);
	});

	app.get('/robots-ws/tablastransito/por-empresas/:empresa/:accion/:tipodoc/:tiempo', supportCrossOriginScript, function(req, res){
	    console.log('/robots-ws/tablastransito/por-e');
		servletWS.procesarRoboTablasTransito(req.params.empresa, req.params.accion, req.params.tipodoc,req.params.tiempo,res);
	});

	app.get('/robots-ws-exs-sas-spas-ee/:accion/:codigo/:id', supportCrossOriginScript, function(req, res){
		 console.log('/robots-ws-exs-sas-spas-ee/:accion');
		servletWS.procesarRoborEdiWSEXS_SAS_EE_SPAS(req.params.accion, req.params.codigo,req.params.id,res);
	});
	
	
	/*****************************
	mensajes
******************************/
app.get('/mensaje/:json', function(req, res) {
	//console.log("/mensaje/:json");


	var json_data = JSON.parse(req.params.json);

	if(json_data.ws && json_data.tipo){
	//console.log(usuariosAsistenteVirtualConectados);
		for( var key in usuariosAsistenteVirtualConectados){

			if(usuariosAsistenteVirtualConectados[key][json_data.tipo]){

					io.clients[key].send(JSON.stringify({mensajejavaws:json_data.mensaje}));

			}
			
		}
	
	}
	res.send('ok');
});



function supportCrossOriginScript(req, res, next) {
	console.log('entro');
    res.status(200);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type,content-Type, accept, X-Requested-With");
    res.header("Access-Control-Allow-Methods","POST, GET, OPTIONS, DELETE, PUT, HEAD");
	res.header("Access-Control-Request-Method","POST, GET, OPTIONS, DELETE, PUT, HEAD");
	res.header("Access-Control-Request-Headers","content-Type, accept");
	next();
}





/*****************
	CLUSTER
*****************/

/***************
 FIN CLUSTER
*****************/

/******************************************
	UN SOLO PROCESO, OCUPA UN SOLO PROCESADOR
	SI SE ESTA UTILIZANDO NGNIX ES RECOMENDABLE
******************}**********************/
server.listen(app.get('port'), app.get('ipaddr'), function(){
	log.info({ req: app.get('ipaddr')  }, 'start request');  // <-- this is the guy we're testing
	
	console.log('Express server listening on  IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
	console.log('pid is ' + process.pid);

  });
  
/* 
io.set("log level", 1);
io.set("reconnection limit",10);
var usurios_webrtc = [];
io.sockets.on('connection', function (socket) {
	function log(){
		var array = [">>> Message from server: "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

	socket.on('message', function (msg) {
		console.log('Message Received: ', msg);
		socket.broadcast.emit('message', msg);
	});
	socket.on('create or join', function (room) {
		var numClients = usurios_webrtc.length;// io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room ' + room);

		if (numClients === 0){
			socket.join(room);
			usurios_webrtc.push(room);
			socket.emit('created', room);
		} else if (numClients === 1) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			usurios_webrtc.push(room);
			socket.emit('joined', room);
		} else { // max two clients
			socket.emit('full', room);
		}
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});

});
*/
/********************
VARIABLE ARRAY DE USUARIOS CONECTADOS
************************/
var usuariosAsistenteVirtual ={};
var usuariosAsistenteVirtualConectados ={};

/********************
PAGINA ESPEJO
**********************/
var accionesAsistenVirtualEspejo = {
	'enviarCoordenadas':function(datos, socket){
		for( var i in io.clients){
			if(socket.id !== io.clients[i].id){
				//io.clients[i].send(JSON.stringify({coordenadas:datos}));
			}
			
		}
		for( var key in usuariosAsistenteVirtualConectados){
			if(usuariosAsistenteVirtualConectados[key].admin && usuariosAsistenteVirtualConectados[key].id === socket.id && io.clients && io.clients[key]){
					io.clients[key].send(JSON.stringify({coordenadas:datos}));
				}
			
		}
	//	socket.send(datos);
	},
	'enviarEspejoDatos':function(datos, socket){
		for( var i in io.clients){
			if(socket.id !== io.clients[i].id){
			//	io.clients[i].send(JSON.stringify({copiadatos:datos}));
			}
			
		}
		for( var key in usuariosAsistenteVirtualConectados){
			if(usuariosAsistenteVirtualConectados[key].admin && usuariosAsistenteVirtualConectados[key].id === socket.id && io.clients && io.clients[key]){
					io.clients[key].send(JSON.stringify({copiadatos:datos}));
				}
			
		}
	//	socket.send(datos);
	},
	'enviarEspejoNotificaciones':function(datos, socket){
		usuariosAsistenteVirtualConectados[socket.id]["obs"]=datos;
		notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
		for( var i in io.clients){
			if(socket.id !== io.clients[i].id){
				//io.clients[i].send(JSON.stringify({notificaciones:datos}));
			}
			
		}
		for( var key in usuariosAsistenteVirtualConectados){
			if(usuariosAsistenteVirtualConectados[key].admin && usuariosAsistenteVirtualConectados[key].id === socket.id && io.clients && io.clients[key]){
					io.clients[key].send(JSON.stringify({notificaciones:datos}));
				}
			
		}
	//	socket.send(datos);
	}
}

/********************
MONITORIAR USUARIOS
**********************/
var accionesAsistenVirtualAdministrador = {
	'monitoriar':function(datos, socket){
		for( var key in usuariosAsistenteVirtualConectados){
			if(usuariosAsistenteVirtualConectados[key].admin && usuariosAsistenteVirtualConectados[key].id === socket.id){
					io.clients[key].send(JSON.stringify({coordenadas:datos}));
				}
			
		}
		
	//	socket.send(datos);
	},
	'autentificarAministrador':function(datos, socket){
		
	},
	'enviarEspejoNotificaciones':function(datos, socket){
		
		for( var i in io.clients){
			if(socket.id !== io.clients[i].id){
				//io.clients[i].send(JSON.stringify({notificaciones:datos}));
			}
			
		}
		for( var key in usuariosAsistenteVirtualConectados){
			if(usuariosAsistenteVirtualConectados[key].admin && usuariosAsistenteVirtualConectados[key].id === socket.id){
					io.clients[key].send(JSON.stringify({notificaciones:datos}));
					
				}
			
		}
	//	socket.send(datos);
	}
}


/********
validar doc
*************/
function validarDoc(doc){
	var nuevoDoc = ""
	if(doc && doc.split("-").length === 3 && doc.split("-")[2].length>0 && doc.split("-")[0] !=="0"){
		nuevoDoc = doc.split("-")[0] + "-"+doc.split("-")[1];
		if(doc.split("-")[2].length>9){
			nuevoDoc +="-" + doc.split("-")[2].substr(doc.split("-")[2].length - 9,doc.split("-")[2].lenght);
		}else{
			nuevoDoc +="-" +Array(10-doc.split("-")[2].length).join("0")+doc.split("-")[2];
		}
	}else{
		nuevoDoc = 0;
	}
	return nuevoDoc;
}
function notificarAdministrador(mensaje){
	for( var key in usuariosAsistenteVirtualConectados){
			if(usuariosAsistenteVirtualConectados[key].admin && usuariosAsistenteVirtualConectados[key].usuarios && io.clients && io.clients[key]){
					io.clients[key].send(JSON.stringify({mensajeadmin:mensaje}));
					
				}
			
		}
}
/********************
FUNCIONES DEL ASISTENTE VIRTUAL
********************/
var accionesAsistenVirtual = {
	'administrador':function(identificacion, socket){
		usuariosAsistenteVirtualConectados[socket.id]["admin"]=true;
		usuariosAsistenteVirtualConectados[socket.id]["id"]=identificacion;
		usuariosAsistenteVirtualConectados[socket.id]["fecha"]=new Date();
		usuariosAsistenteVirtualConectados[socket.id]["obs"]={mensaje:"Monitoriando al id::"+identificacion};
		notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
		console.log(usuariosAsistenteVirtualConectados);
		
	},
	'administrador-usuarios':function(identificacion, socket){
		usuariosAsistenteVirtualConectados[socket.id]["admin"]=true;
		usuariosAsistenteVirtualConectados[socket.id]["id"]=identificacion;
		usuariosAsistenteVirtualConectados[socket.id]["fecha"]=new Date();
		usuariosAsistenteVirtualConectados[socket.id]["usuarios"]=true;
		notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
		
		
	},
	'enviarChat':function(mensaje, socket){
		usuariosAsistenteVirtualConectados[socket.id]["chat"] = mensaje;
		usuariosAsistenteVirtualConectados[socket.id]["chatfecha"] = new Date();
		notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
	},
	'enviarChatAdmin':function(mensaje, socket){
		io.clients[mensaje.id].send(JSON.stringify({mensajechatadmin:mensaje.mensaje}));
		
	},
	'getAsistentesConectados':function(mensaje, socket){
		usuariosAsistenteVirtualConectados[socket.id]["id"]=mensaje;
		usuariosAsistenteVirtualConectados[socket.id]["fecha"]=new Date();
		usuariosAsistenteVirtualConectados[socket.id]["usuarios"]=true;
		notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
		if(mensaje.username){
			for(var id in usuariosAsistenteVirtualConectados){
				if(usuariosAsistenteVirtualConectados[id].admin){
					io.clients[socket.id].send(JSON.stringify({mensajechatadmin:mensaje,id:usuariosAsistenteVirtualConectados[id].id}));
					break;
				}
			}
		
		}else{
			io.clients[socket.id].send(JSON.stringify({mensajechatadmin:"mensaje no aceptado"}));
		}
	},
	'setComunicacionWS':function(mensaje, socket){
		usuariosAsistenteVirtualConectados[socket.id][mensaje.codigo]=true;
		usuariosAsistenteVirtualConectados[socket.id]["fecha_ws"]=new Date();
		notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
		io.clients[socket.id].send(JSON.stringify({mensajechatadmin:"Solicitud aceptada"}));
	},
	
	'validacionIdentificacion':function(identificacion, socket){
		if(usuariosAsistenteVirtual[identificacion] && usuariosAsistenteVirtual[identificacion].info){
			console.log(usuariosAsistenteVirtual[identificacion].info);
			console.log("usuariosAsistenteVirtual[identificacion].info");
			socket.send(JSON.stringify({resultado:usuariosAsistenteVirtual[identificacion].info}));
			usuariosAsistenteVirtualConectados[socket.id]={"id":identificacion,"fecha":new Date,"nombre":usuariosAsistenteVirtual[identificacion].info,"accion":"validando identifiacion"};
			notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
			return;
			
		}
		if(identificacion){
			postgres.getPoolClienteConexion("SELECT razonsocial, email from swissedi.eeditpersona  WHERE identificacion=$1 LIMIT 1",[identificacion], function(resultado){
				
				if(resultado && resultado.rowCount>0){
					var infoUsuario = {};
					infoUsuario.info = resultado.rows[0];
					usuariosAsistenteVirtual[identificacion]=infoUsuario;
					usuariosAsistenteVirtualConectados[socket.id]={"id":identificacion,"fecha":new Date,"nombre":usuariosAsistenteVirtual[identificacion].info};
					console.log(usuariosAsistenteVirtual);
					socket.send(JSON.stringify({resultado:resultado.rows[0]}));
					notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
				}else{
					socket.send(JSON.stringify({error:"Identificaci&oacute;n "+identificacion+" no encontrada."}));
				//	usuariosAsistenteVirtualConectados[socket.id]["obs"]="Identificaci&oacute;n "+identificacion+" no encontrada.";
					notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
				}
			});
		}else{
			socket.send(JSON.stringify({error:"Identificaci&oacute;n no aceptada"}));
			usuariosAsistenteVirtualConectados[socket.id]["obs"]="Identificaci&oacute;n no aceptada";
			notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
		}
	},
	'validacionInformacionAdicional':function(informacion, socket){
		
		if(informacion && informacion.confirmacion && informacion.docelectronico && (informacion.docelectronico=validarDoc(informacion.docelectronico))){
			
			
			postgres.getPoolClienteConexion("SELECT claveacceso from  swissedi.eeditmovimiento m join swissedi.eeditempresa_persona ep on ep.id=m.empresapersona_id join swissedi.eeditpersona p on p.id=ep.persona_id  WHERE p.identificacion=$1 and m.serie||'-'||m.comprobante = $2",[informacion.identificacion,informacion.docelectronico], function(resultado){
				console.log(resultado);
				if(resultado && resultado.rowCount>0){
					postgres.getPoolClienteConexion("SELECT email from  swissedi.eeditemails_invalidos WHERE  email like $1",["%"+informacion.email+"%"], function(resultado3){
						if(resultado3 && resultado3.rowCount>0){
							socket.send(JSON.stringify({error:"El email ingresado "+informacion.email+" se encuentra registrado como No V&aacute;lido, por favor ingrese otro correo."}));
							//usuariosAsistenteVirtualConectados[socket.id]["obs"]="El email ingresado "+informacion.email+" se encuentra registrado como No V&aacute;lido, por favor ingrese otro correo."
						}else{
							socket.send(JSON.stringify({resultado:"ok"}));
							//usuariosAsistenteVirtualConectados[socket.id]["obs"]="Validacion de datos::ok"
							
						}
						notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
					});
					
					
				}else{
					socket.send(JSON.stringify({error:"La Informaci&oacute;n entregada no es v&aacute;lida, por favor ingrese correctamente su documento."}));
					//usuariosAsistenteVirtualConectados[socket.id]["obs"]="La Informaci&oacute;n entregada no es v&aacute;lida, por favor ingrese correctamente su documento."
					notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
				}
			});
		}else{
			//usuariosAsistenteVirtualConectados[socket.id]["obs"]="Datos no aceptados"
			socket.send(JSON.stringify({error:"Datos no aceptados"}));
			notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
		}
	},
	'cambiarClave': function(informacion, socket){
		if(informacion && informacion.nuevaclave && informacion.renuevaclave){
			servletWS.reseteoPasswordPaginaMovimiento(informacion.identificacion,"123",informacion.nuevaclave,informacion.renuevaclave,true,true, function(resultado){
				if(resultado && resultado.indexOf("exitosamente")>=0){
					var email = informacion.email;
					console.log(usuariosAsistenteVirtual);
					if(usuariosAsistenteVirtual[informacion.identificacion] && usuariosAsistenteVirtual[informacion.identificacion].info && usuariosAsistenteVirtual[informacion.identificacion].info.email){
						if(usuariosAsistenteVirtual[informacion.identificacion].info.email.indexOf(email)<0){
								email = usuariosAsistenteVirtual[informacion.identificacion].info.email + ","+email;
						}else{
								email = usuariosAsistenteVirtual[informacion.identificacion].info.email;
						}
					
					}
					postgres.getPoolClienteConexion("UPDATE  swissedi.eeditpersona SET email = $1  WHERE identificacion=$2",[email,informacion.identificacion], function(resultado2){
						
						if(resultado2 && resultado2.rowCount>0){
							socket.send(JSON.stringify({resultado:{clavecambiada:"ok",emailactualizado:"ok"}}));
						//	usuariosAsistenteVirtualConectados[socket.id]["obs"]="Clave Cambiada::ok"
							
						}else{
							socket.send(JSON.stringify({resultado:{clavecambiada:"ok",emailactualizado:"error"}}));
						//	usuariosAsistenteVirtualConectados[socket.id]["obs"]="clave cambiada pero el email no se lo pudo actualizar";
						}
						notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
					});
					
				}else{
					console.log(resultado);
					socket.send(JSON.stringify({resultado:resultado}));
					//usuariosAsistenteVirtualConectados[socket.id]["obs"]=resultado2;
					notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
				}
				
			});
		}
	},
	'actualizarEmail':function(informacion, socket){
		if(informacion && informacion.confirmacion && informacion.email){
			postgres.getPoolClienteConexion("UPDATE  swissedi.eeditpersona SET email = email||','||$1  WHERE identificacion=$2",[identificacion], function(resultado){
				console.log(resultado);
				if(resultado && resultado.rowCount>0){
					infoUsuario.info = resultado.rows[0];
					usuariosAsistenteVirtual[socket.id]=infoUsuario;
					socket.send(JSON.stringify({resultado:{emailactualizado:"ok"}}));
					
				}else{
					socket.send(JSON.stringify({error:"Email no actualizado"}));
					//usuariosAsistenteVirtualConectados[socket.id]["obs"]="Email no actualizado";
				}
			});
		}else{
			socket.send(JSON.stringify({error:"Datos no aceptados"}));
		//	usuariosAsistenteVirtualConectados[socket.id]["obs"]="Datos no aceptados";
		}
	},
	
}

io.on('connection', function(socket){
	console.log('connection');
	console.log(socket.id);
	console.log(io.clientsCount);
	usuariosAsistenteVirtualConectados[socket.id]={"id":"Por vereficar",fecha:new Date()};
	console.log("socket.request.user");
	
	if(socket.request.header){
		usuariosAsistenteVirtualConectados[socket.id]["ip"] = socket.request.header('x-forwarded-for');
	}else{
		if(socket.request.headers && socket.request.headers['x-forwarded-for'] && socket.request.headers['x-forwarded-for'].indexOf(".")){
			usuariosAsistenteVirtualConectados[socket.id]["ip"] = socket.request.headers['x-forwarded-for'];
		}else{
			usuariosAsistenteVirtualConectados[socket.id]["ip"] = socket.request.connection.remoteAddress;
		}
		
	}
	if(usuariosAsistenteVirtualConectados[socket.id]["ip"] !== "127.0.0.1"){
		getUbicacionIp(usuariosAsistenteVirtualConectados[socket.id]["ip"], function(ubicacion){
				if(usuariosAsistenteVirtualConectados[socket.id]){
					usuariosAsistenteVirtualConectados[socket.id]["ubicacion"]=ubicacion;
				}
				
		});
	}else{
		usuariosAsistenteVirtualConectados[socket.id]["ubicacion"] = "maquina local";
	}
	if(socket.request.headers && socket.request.headers['user-agent']){
		usuariosAsistenteVirtualConectados[socket.id]["browser"]=parserBrowser.setUA(socket.request.headers['user-agent']).getResult();
	}
//	req.headers['user-agent'];
	console.log(socket.request.headers['x-forwarded-for']);
	
	notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
	/*******************
	ASISTENTE VIRTUAL CUANDO UN CLIENTE TIENE PROBLEMAS AL INGRESAR AL SISTEMA
	AV=Asistente Virtual
	*******************/
	socket.on('message', function(datos){
		var datosJson = JSON.parse(datos);
		//console.log(datosJson);
		if(datos && datosJson && datosJson.accion && typeof accionesAsistenVirtual[datosJson.accion]==='function'){
			if(datosJson.chat){
				accionesAsistenVirtual[datosJson.accion](datosJson.chat ,socket);
			}else{
				/********
				CHAT CON EL ADMINISTRADOR
				*********/
				if(datosJson.chatAdmin){
					accionesAsistenVirtual[datosJson.accion](datosJson.chatAdmin ,socket);
				}else{
					accionesAsistenVirtual[datosJson.accion](datosJson.identificacion,socket);
				}
			}
		}
		if(datos && datosJson && datosJson.accion && typeof accionesAsistenVirtualEspejo[datosJson.accion]==='function'){
			if(datosJson.coordenadas){
				accionesAsistenVirtualEspejo[datosJson.accion](datosJson.coordenadas ,socket);
			}
			if(datosJson.copiadatos){
				accionesAsistenVirtualEspejo[datosJson.accion](datosJson.copiadatos ,socket);
				//usuariosAsistenteVirtualConectados[socket.id]["info"]=datosJson.copiadatos;
				notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
			}
			if(datosJson.notificaciones){
				accionesAsistenVirtualEspejo[datosJson.accion](datosJson.notificaciones ,socket);
			}
			
			
			
		}
		
		
	});
	socket.on('close', function(datos){
		console.log("cose "+socket.id);
		delete usuariosAsistenteVirtualConectados[socket.id];
		notificarAdministrador({usuarios:usuariosAsistenteVirtualConectados});
	});

  /*socket.on('message', function(v){
	console.log(v);
    socket.send('pong');
  });
  */
  function log(){
		var array = [">>> Message from server: "];
	  for (var i = 0; i < arguments.length; i++) {
	  	array.push(arguments[i]);
	  }
	    socket.emit('log', array);
	}

/*	socket.on('message', function (msg) {
		console.log('Message Received: ', msg);
		socket.broadcast.emit('message', msg);
	});
	*/
	socket.on('create or join', function (room) {
		var numClients = usurios_webrtc.length;// io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room ' + room);

		if (numClients === 0){
			socket.join(room);
			usurios_webrtc.push(room);
			socket.emit('created', room);
		} else if (numClients === 1) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			usurios_webrtc.push(room);
			socket.emit('joined', room);
		} else { // max two clients
			socket.emit('full', room);
		}
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

	});

});



/*********************************
	RUTAS
**********************************/
var rutasNodeJS=[];
rutasNodeJS[0]={codigo:"001", ruta:"/"};
rutasNodeJS[1]={codigo:"002", ruta:"/login"};
rutasNodeJS[2]={codigo:"003", ruta:"/movimientos"};
rutasNodeJS[3]={codigo:"004", ruta:"/salir"};
rutasNodeJS[4]={codigo:"005", ruta:"/administracion"};
rutasNodeJS[5]={codigo:"006", ruta:"/administracion-robots/ingresar"};
rutasNodeJS[6]={codigo:"007", ruta:"/monitor"};
rutasNodeJS[7]={codigo:"008", ruta:"/robots/:empresa/:accion/:codigo"};
rutasNodeJS[8]={codigo:"009", ruta:"/ipAddress"};
rutasNodeJS[9]={codigo:"010", ruta:"/reseteo"};
rutasNodeJS[10]={codigo:"011", ruta:"/consultar/perfiles/1"};
rutasNodeJS[11]={codigo:"012", ruta:"/cambioPassword"};
rutasNodeJS[12]={codigo:"013", ruta:"/consultar/empresas/1"};
rutasNodeJS[13]={codigo:"014", ruta:"/consultar/clientes/id/:id"};
rutasNodeJS[14]={codigo:"015", ruta:"/consultar/documentos/sri"};
rutasNodeJS[15]={codigo:"016", ruta:"/consultar/movimientos-criteria/por-receptor-fecha/:empresa/:identificacion/:limite"};
rutasNodeJS[16]={codigo:"017", ruta:"/consultar/movimientos-criteria/por-fecha-now-desc/:empresa/:limite"};
rutasNodeJS[17]={codigo:"018", ruta:"/consultar/movimientos-criteria-total/por-usuario/:empresa/:identificacion"};
rutasNodeJS[18]={codigo:"019", ruta:"/consultar/clientes/criterio/:sql"};
rutasNodeJS[19]={codigo:"020", ruta:"/consultar/empresa/id/:q"};
rutasNodeJS[20]={codigo:"021", ruta:"/consultar/empresas/id/:q"};
rutasNodeJS[21]={codigo:"023", ruta:"/consultar/movimientos-bitacora/:movimiento_id"};
rutasNodeJS[22]={codigo:"024", ruta:"/verificar-ruc/:tipo/:ruc"};
rutasNodeJS[23]={codigo:"025", ruta:"/verificar-cedula/:cedula"};
rutasNodeJS[24]={codigo:"026", ruta:"/magap/beneficiario/:ruc"};
rutasNodeJS[25]={codigo:"027", ruta:"/actualizar-infomracion-cliente/json"};
rutasNodeJS[26]={codigo:"028", ruta:"/actualizar-infomracion-usuario/json"};
rutasNodeJS[26]={codigo:"029", ruta:"/ride/tipo/:tipo/:download/id/:id"};
rutasNodeJS[27]={codigo:"030", ruta:"/sesion-usuario/:propiedad"};
rutasNodeJS[28]={codigo:"031", ruta:"/sesion-usuario/:propiedad"};
rutasNodeJS[29]={codigo:"032", ruta:"/sesion-usuario/thumbnail/:origen/:destino"};
rutasNodeJS[30]={codigo:"033", ruta:"/sesion-usuario/imagen/:propiedad"};
rutasNodeJS[31]={codigo:"034", ruta:"/robots-ws/:empresa/:accion/:codigo/:id/:estados"};


var xml2js = require('xml2js');
var parser = new xml2js.Parser();


/**************
Comentado por ahora, luego por favor borrame
app.get('/mensaje/:json', function(req, res) {
   
   var json_data = JSON.parse(req.params.json);
   console.log('/mensaje/:json');
   console.log(json_data);
   if(json_data && json_data.empresa && json_data.room){
        
		switch(json_data.data.tipo){
			case 'ws':
				MonitorArchivos.grabarDatosMonitoreoEnVariablePrincipalWService(json_data.data);
			break;
			case 'xmlToJson':
					setTimeout(function () {
						leerArchivoXmlBaseDatos(json_data.data.id, function(res){
							//console.log(res);
						});
					}, 5000)
				
			break;
		}
		if(json_data.data.tipo !== 'xmlToJson' && conexiones && json_data.empresa && conexiones[json_data.empresa]){
			 conexiones[json_data.empresa].to(json_data.room).emit('notificar',json_data.data);
		}
       
    
   }else{
        io.sockets.emit('message', req.params.json);
   }
   res.send('ok');
 
});
*************/
/*
Metodo para finalizar cuando el servidor ha sido finalizado
con esto hacemos que si justo lo finalizo en una request y esta 
aun esta siendo procesada, lo que hace es esperar terminar esta ultima
sin aceptar nuevas peticiones y luego finaliza el servidor
*/
process.on('SIGTERM', function () {
  server.close(function () {
    process.exit(0);
  });
});


/**********
VARIABLE ACUMULADOR DE IDENTIFICACION
**********/
var listaIdentificaciones = [];
var schedule = require('node-schedule');
/********
Creando reglas:
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0,1,2,3,4,5,6];
//rule.hour = 1;
//rule.minute = 47;
rule.second=1;
//console.log(new Date());
****************/
//Ejecutando el cron cada 5 segundos
var j = schedule.scheduleJob('*/5 * * * * *', function(){

    /************
	TAREA 
	1.- ACTUALIZA LOS XMLS A JSON
	*************/
	postgres.getPoolClienteConexion("SELECT id  FROM swissedi.eeditmovimiento  WHERE infjson is null order by id desc limit 100",[], function(resultado2){
		if(resultado2 && resultado2.rows && resultado2.rows.length >0){
			for(id in resultado2.rows){
				
				leerArchivoXmlBaseDatos(resultado2.rows[id].id, function(resultado){
					if(resultado.indexOf("Not")>=0){
						console.log(resultado);
					}

				});
			}
			
		}
	});
	//Permite volver a poner a null los infjson que no fueron creados con exito en las retenciones
	postgres.getPoolClienteConexion("update swissedi.eeditmovimiento set infjson=null where tipodocumentosri_id=5 and infjson::text like '[{\"codigo%'",[], function(resultado2){

	});
});

var idModificar=  100793;

/***********
1;"01";"FACTURA";"A"
2;"04";"NOTA DE CREDITO";"A"
3;"05";"NOTA DE DEBITO";"A"
4;"06";"GUIA DE REMISION";"A"
5;"07";"COMPROBANTE DE RETENCION";"A"

***********/
var doscElec = [];
doscElec[1]="factura";
doscElec[2]="notaCredito";
doscElec[3]="notaDebito";
doscElec[4]="guiaRemision";
doscElec[5]="comprobanteRetencion";
var rucnoecnontrado="Ruc no encontrado";
var sriNoResponde="error::El Sri No responde";
function leerArchivoXmlBaseDatos(id, resultado){
	postgres.getPoolClienteConexion("SELECT id, xmlorigen  FROM swissedi.eeditmovimiento  WHERE id=$1",[id], function(resultado2){
		
		if(resultado2 && resultado2.rows && resultado2.rows.length == 1){
			
			parser.parseString(resultado2.rows[0].xmlorigen, function (err, result) {
				if(err){
					console.log("Error en leerArchivoXmlBaseDatos  ");	
					console.log(err);
					return;
				}
				var updateMov = "UPDATE swissedi.eeditmovimiento SET infjson = ($1) WHERE id = $2";
				if(!result){
					console.log("no creo el json para "+id);
				}
				/********
				Quitanto los _ por # y los $ por @
				**************/
				//console.log(JSON.stringify(result));
				var aux = JSON.stringify(result).replace(/_/g,"#").replace(/\$/g,"@");

				//console.log(aux);
				postgres.getPoolClienteConexion(updateMov,[JSON.parse(aux),resultado2.rows[0].id], function(resultado4){
					
					/******
					VERIFICANDO QUE EL CAMPO INFJSON TENGA INFORMACION
					************/
					postgres.getPoolClienteConexion("SELECT infjson  FROM swissedi.eeditmovimiento  WHERE id=$1",[id], function(resultado5){
							if(!(resultado5 && resultado5.rows && resultado5.rows.length === 1 && resultado5.rows[0].infjson && 
								(resultado5.rows[0].infjson["factura"] || resultado5.rows[0].infjson["notaCredito"] || resultado5.rows[0].infjson["notaDebito"]  || resultado5.rows[0].infjson["guiaRemision"] || resultado5.rows[0].infjson["comprobanteRetencion"] )
								)){
								resultado("Not ok "+id);
							}else{
								resultado("ok "+id);
							}
					});
				});
				
				
				
				
			});
		}
	});
			

}
/***********
Comunicacion entre procesos
***********
var cp = require('child_process');

var n = cp.fork(__dirname + '/xmlToJson.js');

n.on('message', function(m) {
  console.log('PARENT got message:', m);
});
*/


/*leerArchivoXmlBaseDatos(100999, function(r){
	console.log(r);
});*/
/*leerArchivoXmlBaseDatos(6061, function(r){
	console.log(r);
});
leerArchivoXmlBaseDatos(6060, function(r){
	console.log(r);
});
leerArchivoXmlBaseDatos(6058, function(r){
	console.log(r);
});
leerArchivoXmlBaseDatos(6057, function(r){
	console.log(r);
});
*/


function getUbicacionIp(ip, respuesta){
 console.log("https://ip.pycox.co/json/llll"+ip);
	//
    // Set las cabeceras
var headers = {
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding':'gzip, deflate, sdch',
	'Accept-Language':'es-ES,es;q=0.8,en;q=0.6',
	'Cache-Control':'max-age=0',
	'Connection':'keep-alive',
	'Cookie':'__utma=99737929.574697054.1428207658.1428207658.1430886819.2; __utmc=99737929; __utmz=99737929.1430886819.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
	'Host':'ip.pycox.com',
	'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
}

var headersA = {
	'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Language':'es-ES,es;q=0.8,en;q=0.6',
	'Cache-Control':'max-age=0',
	'Connection':'keep-alive',
	'Host':'ip-json.rhcloud.com',
	//'If-None-Match':"40c768c9fae643f5bc12870a13cedf3a425fb3a9",
	'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
}
//http://ip-json.rhcloud.com/json/200.31.29.27

    request({
		uri: "http://ip-json.rhcloud.com/json/"+ip,
		method: "GET",
		headers: headersA,
		timeout : 80000
	//	rejectUnauthorized: false,
  
	}, function(error, response, body) {
	 console.log(body);
	  console.log(error);
	   if(error){
			respuesta({error:true,mensaje:error,ip:ip});
	   }else{
			if(response && response.statusCode == 200 ){
				
				if(body && body.indexOf('error')>=0)respuesta({error:true,mensaje:JSON.parse(body),ip:ip});
				respuesta(JSON.parse(body));
			}else{
				respuesta({error:true,mensaje:'No encontrada'});
			}
	   }
		

   });
   //
}
var UAParser = require('ua-parser-js');
var request = require("request");
var parserBrowser = new UAParser();


postgres.getPoolClienteConexion("SELECT id,xmlsri  FROM swissedi.eeditrecepcion_documentos  WHERE id=$1",[85], function(resultado2){
	if(resultado2 && resultado2.rows && resultado2.rows[0] && resultado2.rows[0].xmlsri){
		var wstream= fs.createWriteStream("C:/archivosMeliisa/"+resultado2.rows[0].id+".xml");
		wstream.write(resultado2.rows[0].xmlsri);

        wstream.end();
	}
});
var wstream= fs.createWriteStream("C:/archivosMeliisa/nuevo3.xml");
fs.readFile("C:/restful-nodeEdi-v01/xml-2.xml", function(err, data)  {
  if(data){
  	 wstream.write(data);

             wstream.end()
  }

});



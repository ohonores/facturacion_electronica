// app/rutas.js
var fs = require('fs');

// load all the things we need
// Passport soporta varios tipo de login, en este caso se utiliza el passport-local
var LocalStrategy;
var UAParser = require('ua-parser-js');
var request = require("request");
var parser = new UAParser();
var agentOptions_;
function formatDate(d,separador) {
 
console.log(d);
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return '\''+mm+separador+dd+separador+yy+'\''
}

function getParametroCondiciiones() {
 //MMyyyydd condicones
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return 'c'+mm+''+yy+''+dd;
}
function getParametroCaptcha() {
 //ddyyyyMM captcah
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return dd+''+yy+''+mm;
}
function getParametroCodigo() {
 //yyyyddMM codigo
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return yy+''+dd+''+mm;
}
function getParametroClave() {
 //ddMMyyyy codigo/email
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return dd+''+mm+''+yy;
}

function getParametroNuevaClave() {
 //MMddyyyy codigo/email
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return 'n'+mm+''+dd+''+yy;
}

function getParametroReNuevaClave() {
 //ddyyyyMM codigo/email, ddyyyyMM
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return 'r'+dd+''+yy+''+mm;
}




var validarUsuarioImpl = function(codigo, clave, hostSwissEdi, callback){
  console.log('validarUsuarioImpl');
  console.log(codigo);
  console.log(clave);
  try{
  	var header={
	'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding':'gzip, deflate, sdch',
	'Accept-Language':'es-ES,es;q=0.8,en;q=0.6',
	'Cache-Control':'max-age=0',
	'Connection':'keep-alive',
	'Cookie':'JSESSIONID=B2D4124FF866E5F4C6033A63D07B545D',
	'Host':'localhost',
	'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
	}
	 console.log( "https://"+hostSwissEdi+"/obteneSesionUsuarioMB?"+getParametroCodigo()+"="+codigo+"&"+getParametroClave()+"="+clave+"&"+getParametroCondiciiones()+"=true");//?pagina=resultado&opcion=1&texto="+ruc,);
	 console.log(agentOptions_);
	request({
				uri: "https://"+hostSwissEdi+"/obteneSesionUsuarioMB?"+getParametroCodigo()+"="+codigo+"&"+getParametroClave()+"="+clave+"&"+getParametroCondiciiones()+"=true",//?pagina=resultado&opcion=1&texto="+ruc,
				method: "POST",
				headers: header,
				timeout : 20000, //Maximo espera 10 segundos por peticion,
				agentOptions: agentOptions_
			}, function(error, response, body) {
				console.log("error e n validarUsuarioImpl");
			 	console.log(error);
			     	if (!error && response.statusCode == 200) {
						var respuesta = "";
						try{
							 
							respuesta = JSON.parse(body);
							
						}catch(error){
							respuesta = "Por favor intentelo mas tarde";
						}
						callback(null, respuesta);
					  
					} else {
					  callback(error,null);
					}
			})

  
   }catch(error){
      console.log(error);
   }
}



/**********************************************
GET UBICACION DE LA IP
SE UTILIZO UN WEB SERVICE GRATUITO LLAMADO:
https://freegeoip.net
Ejemplo: https://freegeoip.net/json/200.31.25.34
Resultado: {"ip":"200.31.25.34","country_code":"EC","country_name":"Ecuador","region_code":"P","region_name":"Provincia de Pichincha","city":"Quito","zip_code":"","time_zone":"America/Guayaquil","latitude":-0.217,"longitude":-78.5,"metro_code":0}

http://ip.pycox.com
Ejemplo: http://ip.pycox.com/json/64.27.57.24
Resultado: {"site": "http://ip.pycox.com", "city": "Quito", "region_name": "Pichincha", "region": "18", "area_code": 0, "time_zone": "America/Guayaquil", "longitude": -78.5, "metro_code": 0, "country_code3": "ECU", "latitude": -0.2167000025510788, "postal_code": null, "dma_code": 0, "country_code": "EC", "country_name": "Ecuador", "q": "200.31.25.34"}
***********************************************/

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
				respuesta(body);
			}else{
				respuesta({error:true,mensaje:'No encontrada'});
			}
	   }
		

   });
   //
}



consultarEmpresasPorIdentificacionPersonaLogin = function(identificacion, edi, postgres, respuesta){
var criterios = [identificacion]
    
	
	if(identificacion == '1714784251'){
		respuesta(1);
	}else{
		var sqlTotal = "SELECT e.id as empresaid FROM  swissedi.eeditempresa e join swissedi.eeditempresa_persona ep on ep.empresa_id=e.id where  ep.codigo=$1::varchar order by e.id desc limit 1 ";
		postgres.getPoolClienteConexion(sqlTotal, criterios, function(resultado){
		
				if(resultado){
					respuesta(resultado.rows[0].empresaid);
				}else{
					respuesta.json(-1);
					
				}
		});
	}

}


module.exports = function(passport, hostSwissEdi, postgres, LocalStrategy_,agentOptions__) {
	
	LocalStrategy = LocalStrategy_;
	agentOptions_ = agentOptions__;
	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
	
	    console.log(user);
       if(user && user.id){
			done(null, user);
		  }else{
			done(null, null);
		}
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
       done(null, user);
    });

 	

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(new LocalStrategy({passReqToCallback: true},function(req,username, password, done) { // callback with email and password from our form
	
		validarUsuarioImpl(username,password,hostSwissEdi, function(error, respuesta){
			if(error){
				console.log('login error 001')
				console.log(error)
				if(error.code == 'ECONNREFUSED'){
					console.log('SERVIDOR WS NO ESTA DANDO RESPUESTA POR FAVOR VERIFIQUE Q ESTE ARRIBA')
				}
				return done(null, false, {mensaje: 'Por favor intentelo mas tarde error:001'});
			}else{
			
				if(!respuesta){
					return done(null, false, {mensaje: 'No existe conexion con el serivdor, intentelo mas tarde'});
				}
				if(respuesta.login){
					
					var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
					/*
						Obteniendo el perfil del usuario.
					*/
					if(!respuesta.perfil){
						respuesta.perfil='edi';
					}
					switch(respuesta.perfil){
						case 'usuario':
							postgres.buscarUsuarioJson(respuesta.usuario, function(resultado){	
								
								if(resultado != false){
									respuesta.infoadicional = {};
									respuesta.infoadicional.empresas = resultado.empresas;
									respuesta.infoadicional.documentos = resultado.documentos;
									user = { username: respuesta.usuario, edi:respuesta.edi, perfil:respuesta.perfil,empresa:respuesta.empresa, id:respuesta.usuario, fechaInicio:new Date(),ipAddress:ip, persona:respuesta.persona, identificacion:respuesta.identificacion,infoadicional:respuesta.infoadicional};
									/*************
										Grabar bitacora del usuario
									**************/
									var ua = req.headers['user-agent'];     // user-agent header from an HTTP request 
									//
									getUbicacionIp(req.header('x-forwarded-for') || req.connection.remoteAddress, function(ubicacion){
										
									    postgres.buscarIngresosBitacoraUsuario(req.sessionID,function(respuesta_a){
										
											if(respuesta_a === false){
												postgres.grabarBitacoraUsuario(respuesta.empresa,req.sessionID,respuesta.usuario,parser.setUA(ua).getResult(),req.header('x-forwarded-for') || req.connection.remoteAddress, ubicacion, function(resultado){console.log('Bitacora id '+resultado)});
											}else{
												if(respuesta_a.fechaingreso){
													postgres.actualizarIngresosBitacoraUsuario(req.sessionID,respuesta_a,function(respuestaA){console.log(respuestaA)});
												}
											}
										});
										
									});	
									
									
										
									
									return done(null, user);
								}
							});
						break;
						case 'edi':
						case 'root':
						case 'admin':
							user = { username: respuesta.usuario, edi:respuesta.edi, perfil:respuesta.perfil,empresa:respuesta.empresa, id:respuesta.usuario, fechaInicio:new Date(),ipAddress:ip, persona:respuesta.persona, identificacion:respuesta.identificacion,infoadicional:respuesta.infoadicional};
							if(respuesta.perfil === 'admin'){
								user.eliminarregistros = true;
							}
									/*************
										Grabar bitacora del usuario
									**************/
									var ua = req.headers['user-agent'];     // user-agent header from an HTTP request 
									//
									getUbicacionIp(req.header('x-forwarded-for') || req.connection.remoteAddress, function(ubicacion){
										
									    postgres.buscarIngresosBitacoraUsuario(req.sessionID,function(respuesta_a){
										
											if(respuesta_a === false){
												postgres.grabarBitacoraUsuario(respuesta.empresa,req.sessionID,respuesta.usuario,parser.setUA(ua).getResult(),req.header('x-forwarded-for') || req.connection.remoteAddress, ubicacion, function(resultado){console.log('Bitacora id '+resultado)});
											}else{
												if(respuesta_a.fechaingreso){
													postgres.actualizarIngresosBitacoraUsuario(req.sessionID,respuesta_a,function(respuestaA){console.log(respuestaA)});
												}
											}
										});
										
									});	
							//console.log(req)	;	
							//console.log(req.sessionID)
							return done(null, user);
						break;
					}
					
					
					
					
					
				}else{
					//console.log(respuesta)
					return done(null, false, {mensaje: 'Usuario o password no aceptado'});
				}
				
			}
		});
    }));   
   
	
	

};
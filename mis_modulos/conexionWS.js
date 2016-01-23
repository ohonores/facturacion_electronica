var request = require("request");
var fs = require('fs');
var ServletWS = function () {};
var hostSwissEdiWS; 
var puertoLocal_ = "8081";
var hostSwissEdi_ = 'localhost'+":"+puertoLocal_;
var hostSwissEdiTablasTransitorias;
var fecheestilo='mdy';
var agentOptions_;
/****************************************
	SEGURIDADEDC
****************************************/

var seguridadEDC = require('../modulos_edi/SeguridadEDC.js');
var MonitorArchivos = require('../modulos_edi/MonitorArchivos.js');
function formatDate(d,separador) {
 

 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy
  switch(fecheestilo){
	case 'mdy':
	return '\''+mm+separador+dd+separador+yy+'\''
	case 'dmy':
	return '\''+dd+separador+mm+separador+yy+'\''
	
  }
  
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

function getParametroDinamico(formato,parametroextra) {
 //MMddyyyy codigo/email
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd

  

  var yy = d.getFullYear();
  var resultado = parametroextra; 
  if ( yy < 10 ) yy = '0' + yy
	switch(formato){
		case 'ddMMyyyy':
			resultado = resultado +  dd+''+mm+''+yy;
		break;
		case 'yyyyddMM':
			resultado = resultado + yy+''+dd+''+mm;
		break;
		case 'MMddyyyy':
			resultado = resultado + mm+''+dd+''+yy;
		break;
		case 'ddyyyyMM':
			resultado = resultado + dd+''+yy+''+mm;
		break;
		
	}
  return resultado;
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




ServletWS.prototype.instanciarVariables = function(hostSwissEdiWS_,hostSwissEdiTablasTransitorias_,agentOptions__){
	hostSwissEdiWS = hostSwissEdiWS_;
	hostSwissEdiTablasTransitorias = hostSwissEdiTablasTransitorias_;
	agentOptions_ = agentOptions__;
};
ServletWS.prototype.getSesionUsuarioMB = function(propiedad, res) {
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
	request({
				uri: "https://"+hostSwissEdiWS+"/obteneSesionUsuarioMB?propiedad="+propiedad,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
			  
			   if (propiedad === 'imagen'){
					try{
						request.pipe(res);
					}catch(error){
						console.log(error);
						res.send('No se encontro la imagen');
					}
			   }else{
					res.send(body); //imprime el resultado en pantalla
				}
			})

	
}//fin function getInfoMagapClienteBeneficiario

ServletWS.prototype.procesarRoborEdiWS = function (empresa, accion, codigo,id,estados,res){
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
	request({
				
				uri: "https://"+hostSwissEdiWS+"/procesarRobots?clave=clave&empresa="+empresa+"&accion="+accion+"&codigo="+codigo+"&id="+id+"&estados="+estados,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
			
					if (!error && response.statusCode == 200) {
					  
					  res.send(body);
					} else {
					  res.send(body)
					}
			})

   
}
/*******************
ACTIVAR ROBOTS
********************/
ServletWS.prototype.procesarRoborEdiWSEXS_SAS_EE_SPAS = function(accion,codigo,id,res){
	
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
	request({
				
				uri: "https://"+hostSwissEdiWS+"/procesarRobots?clave=clave&accion="+accion+"&codigo="+codigo+"&id="+id,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
					 
					  res.send(body);
					} else {
					  res.send(body)
					}
			})

   
}
/*******************
ENVIAR MOVIEMIENTO AL SRI
********************/
ServletWS.prototype.procesarRoborEdiEnviarAutorizarXmlSri = function(tipo,id,res){
	
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
	request({
				
				uri: "https://"+hostSwissEdiWS+"/procesarRobots?clave=clave&"+(tipo==='1'?"enviar":(tipo==='2'?"autorizar":"ninguno"))+"=true"+"&id="+id,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if(error){	
						res(error)
						return;
					}
					if (body && response.statusCode == 200) {
					 
					  res(body);
					} else {
						if(body){
							res(body)
						}else{
							res("Error codigo::"+response.statusCode);
						}
					  
					}
			})

   
}


ServletWS.prototype.getTiposRobots = function(grupo,res){
	
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
	grupo = grupo == '1'?'':grupo
	request({
				
				uri: "https://"+hostSwissEdiWS+"/procesarRobots?clave=clave&tiposDeHilos="+grupo,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
					 
					  res.send(body);
					} else {
					  res.send(body)
					}
			})

   
}

ServletWS.prototype.getEstadosEdi = function(res){
	
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
	
	request({
				
				uri: "https://"+hostSwissEdiWS+"/procesarRobots?clave=clave&tpestado=1",
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
					 
					  res.send(body);
					} else {
					  res.send(body)
					}
			})

}

ServletWS.prototype.procesarRoboTablasTransito = function(empresa, accion, tipodoc,tiempo,res){
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
	request({
				//curl "http://localhost:8083/swissedi-tablaProduccionATablasTransito/iniciarRobot?clave=clave&empresa=500&accion=2&tipodoc=1&fecha=&tiempoEspera=10&codigoUltimoId=1"
				uri: "http://"+hostSwissEdiTablasTransitorias+"/iniciarRobot?clave=clave&empresa="+empresa+"&accion="+accion+"&tipodoc="+tipodoc+"&fecha=&tiempoEspera="+tiempo+"&codigoUltimoId=1",
				method: "GET",
				headers: header,
				timeout : 10000 //Maximo espera 10 segundos por peticion
				//agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response && response.statusCode == 200) {
					 
					  res.send(body);
					} else {
					    console.log(error)
					  res.send(error)
					}
			})

  
}


ServletWS.prototype.procesarRobotUnsuscribedEmailEstadoCuenta = function(email, idpersona, id,proceso,clave,respuesta){
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
	request({
				//curl "http://localhost:8081/swissedi-tablaProduccionATablasTransito/iniciarRobot?email=ohonores@hotmail.com&id=1&proceso=1&clave=mAXec4WIeyDSFCK89kyL6A17PNBnEgF3"
				uri: "http://"+hostSwissEdiTablasTransitorias+"/iniciarRobot?email="+email+"&id="+id+"&idpersona="+idpersona+"&proceso="+proceso+"&clave="+clave,
				method: "GET",
				headers: header,
				timeout : 10000 //Maximo espera 10 segundos por peticion
				//agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response && response.statusCode == 200) {
					 
					  respuesta(JSON.parse(body));
					} else {
					    console.log(error)
					  respuesta({"error":error})
					}
			})


}



ServletWS.prototype.procesarRobotEmailsInvalidos = function(objson,respuesta){
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
	
	request({
				//curl "http://localhost:8083/swissedi-tablaProduccionATablasTransito/iniciarRobot?clave=clave&empresa=500&accion=2&tipodoc=1&fecha=&tiempoEspera=10&codigoUltimoId=1"
				uri: "https://"+hostSwissEdiWS+"/procesarRobots?clave=clave&datosServidorEmail="+objson,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					
					if (!error && response && response.statusCode == 200) {
					 
					  respuesta(body);
					} else {
					   
					  respuesta(error)
					}
			})

  
}



ServletWS.prototype.getImagenCaptcha = function (propiedad, ipaddress, res){
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
	request.get({
			uri:'https://'+hostSwissEdiWS+'/obteneSesionUsuarioMB?propiedad=imagen&ipaddress='+ipaddress,
			method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
	}).pipe(res)
}

ServletWS.prototype.setThumbnail = function (origen, destino, res){

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
	request({
				
				uri: 'https://'+hostSwissEdiWS+'/obteneSesionUsuarioMB?' + getParametroDinamico('yyyyddMM','') + '=clave&thumbnail=1&origen='+seguridadEDC.desencriptar(origen)+'&destino='+seguridadEDC.desencriptar(destino),
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
			
					if (!error && response.statusCode == 200) {
					  
					  res.send(body);
					} else {
					  res.send(body)
					}
			})
}


ServletWS.prototype.validarReseteoPasswordImpl = function(codigo, email, captcha, condicion,ipaddress, res){
	
	
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
	request({
				uri: "https://"+hostSwissEdiWS+"/obteneSesionUsuarioMB?"+getParametroCodigo()+"="+codigo+"&"+getParametroClave()+"="+email+"&"+getParametroCondiciiones()+"="+condicion+"&"+getParametroCaptcha()+"="+captcha+"&ipaddress="+ipaddress,//?pagina=resultado&opcion=1&texto="+ruc,
				method: "POST",
				headers: header,
				timeout : 10000,
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
					 
					  res.send(body);
					} else {
					  res.send(body)
					}
			})

   
}


ServletWS.prototype.encriptarClaveYEnviarEmail = function(id, email, ip, usuario, respuesta){
	
	
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
	request({
				uri: "https://"+hostSwissEdiWS+"/obteneSesionUsuarioMB?"+getParametroDinamico('yyyyddMM','')+"=clave"+"&"+getParametroDinamico('ddMMyyyy','')+"="+id+"&"+getParametroDinamico('yyyyddMM','e')+"="+email+"&"+getParametroDinamico('ddyyyyMM','i')+"="+ip+"&"+getParametroDinamico('ddyyyyMM','u')+"="+usuario,//?pagina=resultado&opcion=1&texto="+ruc,
				method: "POST",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						respuesta(body);
					} else {
					  respuesta(error)
					}
			})

   
}

ServletWS.prototype.getInformacionArchivop12 = function(ruta,nombre,clave,empresa, respuesta){
	
	
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
	request({
				uri: "https://"+hostSwissEdiWS+"/archivop12?"+getParametroDinamico('ddMMyyyy','a')+"="+ruta+"&"+getParametroDinamico('ddMMyyyy','b')+"="+nombre+"&"+getParametroDinamico('ddMMyyyy','c')+"="+clave+"&"+getParametroDinamico('ddMMyyyy','d')+"="+empresa,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						body = body.replace(/\\r\\n/g,' ');
							
						respuesta(JSON.parse(body));
						
					} else {
					 
					  respuesta(error)
					}
			})

   
}

ServletWS.prototype.actualizarWS = function(empresa, respuesta){
	
	
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
	request({
				uri: "https://"+hostSwissEdiWS+"/archivop12?"+getParametroDinamico('ddMMyyyy','aa')+"="+empresa+"&"+getParametroDinamico('ddMMyyyy','bb')+"=alien",
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						body = body.replace(/\\r\\n/g,'');
							
						respuesta(body);
						
					} else {
					 
					  respuesta(error)
					}
			})

   
}



ServletWS.prototype.procesarRoborEdi = function(empresa, accion, codigo,respuesta){
	
	
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
	request({
				
				uri: "https://"+hostSwissEdiWS+"/procesarRobots?clave=clave&empresa="+empresa+"&accion="+accion+"&codigo="+codigo,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
					 
					  respuesta(body);
					} else {
					  respuesta(body)
					}
			})

   
}

ServletWS.prototype.robotAdminEnviarNotificacion = function(codigo, respuesta){


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
	request({

				uri: "https://"+hostSwissEdiWS+"/procesarRobots?"+codigo,
				method: "GET",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if (!error && response.statusCode == 200) {

					  respuesta(body);
					} else {
					  respuesta(body)
					}
			})


}


ServletWS.prototype.reseteoPasswordPaginaMovimiento = function reseteoPasswordPaginaMovimiento(codigo,clave,nuevaclave,renuevaclave,condiciones,verificar, respuesta){
console.log("reseteoPasswordPaginaMovimiento");
	console.log(nuevaclave);
	
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
	request({
				uri: "https://"+hostSwissEdiWS+"/obteneSesionUsuarioMB?"+getParametroCodigo()+"="+codigo+"&"+getParametroClave()+"="+clave+"&"+getParametroNuevaClave()+"="+nuevaclave+"&"+getParametroReNuevaClave()+"="+renuevaclave+"&"+getParametroDinamico('ddyyyyMM','v')+"="+verificar,//?pagina=resultado&opcion=1&texto="+ruc,
				method: "POST",
				headers: header,
				timeout : 10000, //Maximo espera 10 segundos por peticion,
				agentOptions: agentOptions_
			}, function(error, response, body) {
					
					if (!error && response.statusCode == 200) {
					 
					  respuesta(body);
					} else {
					  respuesta(body)
					}
			})

   
}

ServletWS.prototype.enviarArchivoXmlWS = function (attachments_, clave, respuesta){
	
	
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
	//var source = fs.createReadStream('swissedi1031.xml');
	//source.pipe(
	var formData = {
	  attachments: attachments_
	};
//ddMMyyyy
	request({
				uri: "https://"+hostSwissEdiWS+"/subirArchivo?"+getParametroDinamico('ddMMyyyy','')+"="+clave,
				method: "POST",
				headers: header,
				formData: formData,
				timeout : 10000, //Maximo espera 10 segundos por peticion,
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if(error){
						
						respuesta(error);
						return;
					}
					try{
						if(body && body.indexOf('estado')>=0){
						
							body = body.replace(/\\r\\n/g,' ');
							
							respuesta(JSON.parse(body));
						}else{
							respuesta(body);
						}

					}catch(error){
						respuesta(body);
						console.log(error);
					}
					
					return;
					
					
			})
	//)
   
}



ServletWS.prototype.enviarArchivosWS = function enviarArchivosWS(attachments_, clave,nombre,empresa, respuesta){
	
	
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
	//var source = fs.createReadStream('swissedi1031.xml');
	//source.pipe(
	var formData = {
	 /* attachments: [
		fs.createReadStream(rutaXmlSri)
	  ],*/
	  attachments : attachments_
	};
//ddMMyyyy
	request({
				uri: "https://"+hostSwissEdiWS+"/subirArchivo?"+getParametroDinamico('ddMMyyyy','')+"="+clave+"&nombre="+nombre+"&empresa="+empresa,
				method: "POST",
				headers: header,
				formData: formData,
				timeout : 10000, //Maximo espera 10 segundos por peticion,
				agentOptions: agentOptions_
			}, function(error, response, body) {
					if(error){
						
						respuesta(error);
						return;
					}
					try{
						if(body && body.indexOf('estado')>=0){
						
							body = body.replace(/\\r\\n/g,' ');
							
							respuesta(JSON.parse(body));
						}else{
							body = body.replace(/\\r\\n/g,' ');
							respuesta(JSON.parse(body));
						}

					}catch(error){
						respuesta(body);
						console.log(error);
					}
					
					return;
					
					
			})
	//)
   
}


/**********************************************
VERIFICAR RUC EN WS
***********************************************/
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
function transfomrarTablaToArray22(tabla){

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
function transfomrarTablaToArrayMetodo2(datos){
	var datosJson={};
	
	if(!(datos && datos.split("tbody") && datos.split("tbody")[1] && datos.split("tbody")[1].split("<tr"))){
		return {error:"no se pudo formar el json"};
	}
	for(var i=0;i<datos.split("tbody")[1].split("<tr").length;i++){
		
		var key,valor;
		
		for(var i1=0;i1<datos.split("tbody")[1].split("<tr")[i].split("<td").length;i1++){
			if(i1 === 0){
				continue;
			}
			var d=/>[^\n]*</.exec(datos.split("tbody")[1].split("<tr")[i].split("<td")[i1]);
			console.log("***********************************");

			if(d && d[0]){
				switch(i1){
					case 1:
						key = d[0].substring(1,d[0].length-1).replace(/<\/td>/g,"").replace(/<tr>/g,"").replace(/<\/tr>/g,"").replace(/<td>/g,"");
						break;
					case 2:
						valor=d[0].substring(1,d[0].length-1).replace(/<\/td>/g,"").replace(/<tr>/g,"").replace(/<\/tr>/g,"").replace(/<td>/g,"");
						break;
				}
			}
			
			
		}
		
		if(key && valor){
			key=key.replace(/:/g,"").replace(/&oacute;/g,"o").replace(/&eacute;/g,"e").trim();
			valor = valor.trim();
			datosJson[key]=valor;
			
			
		}
		
	}
	console.log(datosJson);
  return datosJson;
}
/***********************
	RETORNA UNA LISTA DE JSON DE UNA TABLA DEL SRI, DE LOS COMPROBANTES ELECTRONICOS RECIBIDOS
************************/
function transfomrarTablaToArrayMetodo3(datos){

	var lista=[];
	if(!(datos && datos.split("tbody") && datos.split("tbody")[1] && datos.split("tbody")[1].split("<tr"))){
		return {error:"no se pudo formar el json"};
	}
	var key,valor;
	var datosJson={};
	for(var i=0;i<datos.split("tbody")[1].split("<tr").length;i++){


		datosJson={};
		for(var i1=0;i1<datos.split("tbody")[1].split("<tr")[i].split("<td").length;i1++){

			if(i1 === 0){
				continue;
			}
			var d=(datos.split("tbody")[1].split("<tr")[i].split("<td")[i1]);
			switch(i1){
				case 1:
					key = "id";
				break;
				case 2:
					key = "razonSocial";
                break;
                case 3:
                	key = "documento";
                break;
                case 4:
                	key = "claveAcceso";
                break;
                case 5:
                	key = "fechaAutorizacion";
                break;
                case 6:
                	key = "fechaEmision";
                break;
                case 7:
                	key = "tipoEmision";
                break;
                default :
                    key = "";
               break;
			}



			if(key ){
				valor=d.replace(/><\/td>/g,"").replace(/<\/td>/,"").replace(/</,"").replace(/ >/,"").replace(/>/,"").replace("--------------",":::");
				if(valor){
					if(key === "claveAcceso"){
						//Clave de acceso

						//Numero de autorizacion
						valor = valor.trim();
                        datosJson["claveAcceso"]=valor.split(":::")[0].replace("CA:","").trim();
                        datosJson["numeroAutorizacion"]=valor.split(":::")[1].replace("NA:","").trim();
					}else{
						if(key === "razonSocial"){
                        	valor = valor.trim();
                            datosJson["ruc"]=valor.split(":::")[0].trim();
                            datosJson["razonSocial"]=valor.split(":::")[1].trim();
                        }else{
                        	if(key === "documento"){
                               //Clave de acceso
                               //Numero de autorizacion
                               valor = valor.trim();
                               datosJson["serie"]=valor.split("  ")[1].split("-")[0]+valor.split("  ")[1].split("-")[1].trim();
                               datosJson["comprobante"]=valor.split("  ")[1].split("-")[2].trim();
                               datosJson["documento"]=valor.split("  ")[1];
                               datosJson["tipoDocumento"]=valor.split("  ")[0];
                            }else{
								valor = valor.trim();
                       			datosJson[key]=valor;
                       		}
                        }
					}

				}

            }
		}
		if(datosJson && datosJson["id"]){
			lista.push(datosJson)
		}


	}


  return lista;
}





var numeroIntentos = 0;
var rucnoecnontrado="Ruc no encontrado";
var sriNoResponde="error::El Sri No responde";
ServletWS.prototype.revisarRucNuevaVersion = function revisarRucNuevaVersion(ruc,tipo, res){

    // Set las cabeceras
var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
    'Content-Type':'application/x-www-form-urlencoded',
	'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Host':'declaraciones.sri.gob.ec',
    'Origin':'https://declaraciones.sri.gob.ec',
	 'Referer':'https://declaraciones.sri.gob.ec/facturacion-internet/consultas/publico/ruc-datos1.jspa',
	'Accept-Language':'es-ES,es;q=0.8,en;q=0.6',
	'Cache-Control':'max-age=0',
	'Connection':'keep-alive',
	'Content-Length':'45',
	'Cookie':'JSESSIONID=feXyogGV1Ov9CWbSvpWb1g**.sriint05; __utma=188394346.1414492352.1419866942.1419871610.1419874981.3; __utmb=188394346.1.10.1419874981; __utmc=188394346; __utmz=188394346.1419866942.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmt=1; __utma=246370193.1217165655.1419866977.1419872203.1419875585.3; __utmb=246370193.1.10.1419875585; __utmc=246370193; __utmz=246370193.1419875585.3.3.utmcsr=sri.gob.ec|utmccn=(referral)|utmcmd=referral|utmcct=/web/guest/home'
}
    request({
		uri: "https://declaraciones.sri.gob.ec/facturacion-internet/consultas/publico/ruc-datos2.jspa?ruc="+ruc,
		method: "POST",
		headers: headers,
		timeout : 30000
  
	}, function(error, response, body) {
	 
		var arr2 = body ?  body.toString().split('class="formulario"')[1]:null;
				if(arr2){
				  arr2 = arr2.split('</table>')[0];
					if(tipo == 1){
						numeroIntentos = 0;
						res('<table class="formulario" '+arr2+' </table>');
					}else{
						numeroIntentos = 0;
						res(transfomrarTablaToArray('<table class="formulario" '+arr2+' </table>'));
					}
					
				}else{
					if(error){
						if(error.code == 'ECONNRESET' && numeroIntentos <10){
							numeroIntentos ++;
							revisarRucNuevaVersion(ruc,tipo, res);
						}else{
							numeroIntentos = 0;
							res(sriNoResponde+', mensaje '+error);
						}
						
					}else{
						numeroIntentos = 0;
						res(rucnoecnontrado);
					}
				}
	   
	  

   });
   //
}


ServletWS.prototype.getInfoCedula = function getInfoCedula(identificacion, resultado){
     
	 
	 
	 
	 /******************
		CNE
	 ******************/
	var headers = {
	   
		'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		//'Accept-Encoding':'gzip, deflate, sdch',
		'Accept-Language':'es-ES,es;q=0.8,en;q=0.6',
		'Cache-Control':'max-age=0',
		'Connection':'keep-alive',
		//'Cookie':'csfcfc=_1495Xfn; COOKIE_SUPPORT=true; JSESSIONID=node2~3492DB2AD74470137BFDEB68EF55A1E1.nodo2; GUEST_LANGUAGE_ID=es_ES; __utmt=1; __utma=175726519.1690206560.1427945570.1427945570.1429445698.2; __utmb=175726519.23.10.1429445698; __utmc=175726519; __utmz=175726519.1429445698.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
		'Host':'www.datoseguro.gob.ec',
		'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'
	}

	
	request.get({
		url: 'https://186.101.75.60/web/guest/consulta-cne',
	   headers:headers,
	   rejectUnauthorized: false,
	}, function(error_, response, body){
		var ViewState;
	    if(!error_){
				if(body.split('<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value=')[1]){
					ViewState = body.split('<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value=')[1].split('autocomplete')[0];
					ViewState = ViewState.replace('"','').trim();
					ViewState = ViewState.replace('"','').trim();
				}
				
		}else{
			resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',error:true})
			return;
		}
		
		if(!ViewState){
			
			resultado({encontrado:false, mensaje:'Datos del cliente no ha sido verificados, debido a que el servidor validador de la cedula no responde',error:true})
			return;
		}
		if(response && response.statusCode == 200 ){//Siginifica que esta logoneado al sistema
			
		   try{
			//console.log(response.headers);
			//Importante una vez logoneado se obtiene el header para enviarle como parametros al siguiente url
			var heads = response.request.headers;
			//heads['Accept-Encoding']='gzip, deflate, sdch';
			heads['Content-Type'] = 'application/x-www-form-urlencoded; charset=iso-8859-1';
			heads['Accept'] = 'application/xml, text/xml, */*; q=0.01';
			heads['Origin'] = 'https://www.datoseguro.gob.ec';
			heads['Referer'] = 'https://www.datoseguro.gob.ec/web/guest/consulta-cne';
			heads['X-Requested-With'] = 'XMLHttpRequest';
			heads['Cookie'] = 'csfcfc=_1495Xfn; COOKIE_SUPPORT=true; '+response.headers['set-cookie'][0]
			
			request({
				uri: "https://186.101.75.60/web/guest/consulta-cne?p_p_id=consultapublica_WAR_consultapublica10&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_consultapublica_WAR_consultapublica10__jsfBridgeAjax=true&_consultapublica_WAR_consultapublica10__facesViewIdResource=%2Fviews%2Fview.xhtml&javax.faces.partial.ajax=true&javax.faces.source=A0945%3AformConsultaPublica%3Aj_idt12&javax.faces.partial.execute=%40all&javax.faces.partial.render=A0945%3AformConsultaPublica%3AmsnMatriz+A0945%3AformConsultaPublica%3AmessageCedula&A0945%3AformConsultaPublica%3Aj_idt12=A0945%3AformConsultaPublica%3Aj_idt12&A0945%3AformConsultaPublica=A0945%3AformConsultaPublica&javax.faces.encodedURL=https%3A%2F%2Fwww.datoseguro.gob.ec%2Fweb%2Fguest%2Fconsulta-cne%3Fp_p_id%3Dconsultapublica_WAR_consultapublica10%26p_p_lifecycle%3D2%26p_p_state%3Dnormal%26p_p_mode%3Dview%26p_p_cacheability%3DcacheLevelPage%26p_p_col_id%3Dcolumn-1%26p_p_col_count%3D1%26_consultapublica_WAR_consultapublica10__jsfBridgeAjax%3Dtrue%26_consultapublica_WAR_consultapublica10__facesViewIdResource%3D%252Fviews%252Fview.xhtml&A0945%3AformConsultaPublica%3AinputTextCedula="+identificacion+"&javax.faces.ViewState="+ViewState,
				method: "POST",
				//gzip: true,
				headers: heads,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				 rejectUnauthorized: false,
				 postData: {
					mimeType: 'application/x-www-form-urlencoded',
					}
			}, function(error, response, body) {
					 if(response && response.statusCode == 200 ){
						//try{
						//Siginifica que esta logoneado al sistema
					
						if(body && body.indexOf('Exception')<0 && body.split('url=') &&  body.split('url=')[1] && body.split('url=')[1].split('></redirect>') && body.split('url=')[1].split('></redirect>')[0]){
						   //var headers1= response.request.headers;
							//headers1['Cookie'] = 'csfcfc=_1495Xfn; COOKIE_SUPPORT=true; '+response.headers['set-cookie'][0]
							request({
								uri: body.split('url=')[1].split('></redirect>')[0].replace('"','').replace('"','').replace('www.datoseguro.gob.ec','186.101.75.60').replace(/&amp;/g,'&').trim(),
								method: "GET",
								headers:  response.request.headers,
								timeout : 10000, //Maximo espera 10 segundos por peticion
								rejectUnauthorized: false,
								encoding: 'utf8'
							}, function(error, response, body) {
							    
								if(body && body.indexOf('disponible temporalmente')>=0){
									resultado({encontrado:false,mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
								}else{
									if(body && body.indexOf(identificacion)>=0 && body.split('<div class="ui-datatable-tablewrapper">') && body.split('<div class="ui-datatable-tablewrapper">')[1] && body.split('<div class="ui-datatable-tablewrapper">')[1].split('</div>') && body.split('<div class="ui-datatable-tablewrapper">')[1].split('</div>')[0]){
										resultado(body.split('<div class="ui-datatable-tablewrapper">')[1].split('</div>')[0].replace('<table role="grid">','<table id="datos-cne" >')); //imprime el resultado en pantalla
										
									}else{
										if(body && body.indexOf('No se puede consultar')>=0){
											resultado({encontrado:false, mensaje:'No se puede consultar el numero de cedula '+identificacion, mostrarBoxAlternos:true})
										}else{
											if(body && body.indexOf('No hay registros disponibles')>=0){	
											
												resultado({encontrado:false, mensaje:'No hay registros disponibles con la identificacion '+identificacion,cancelar:true})
											}else{
												if(!body){
													console.log('body undefined')
													resultado({encontrado:false, mensaje:'No se obtuvo respuesta del servidor, por favor vuelva a intentar',mostrarBoxAlternos:true})
												}else{
													resultado({encontrado:false, mensaje:'No se puede consultar el numero de cedula',mostrarBoxAlternos:true})
												}
											}
											
										}
										
										
									}
									
								}
								
							})
						}else{
						   console.log('Exception');
							resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
						}
						/*}catch(error){
						
							console.log(error);
							resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
						}*/
					}else{
						resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
					}
						
			})
			}catch(error){
				console.log(error);
				resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
				
			}
		}else{
			console.log(error);
			resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',error:true})
		}
		
	});
	
}//fin function getInfoCedula

ServletWS.prototype.getInfoCedula2 = function getInfoCedula2(identificacion, resultado){
     
	 
	 
	 
	 /******************
		CNE
	 ******************/
	var headers = {
	   
		'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		//'Accept-Encoding':'gzip, deflate, sdch',
		'Accept-Language':'es-ES,es;q=0.8,en;q=0.6',
		'Cache-Control':'max-age=0',
		'Connection':'keep-alive',
		//'Cookie':'csfcfc=_1495Xfn; COOKIE_SUPPORT=true; JSESSIONID=node2~3492DB2AD74470137BFDEB68EF55A1E1.nodo2; GUEST_LANGUAGE_ID=es_ES; __utmt=1; __utma=175726519.1690206560.1427945570.1427945570.1429445698.2; __utmb=175726519.23.10.1429445698; __utmc=175726519; __utmz=175726519.1429445698.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
		'Host':'www.datoseguro.gob.ec',
		'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'
	}

	
	request.get({
		url: 'https://186.101.75.60/web/guest/consulta-cne',
	   headers:headers,
	   rejectUnauthorized: false,
	}, function(error_, response, body){
		var ViewState;
	    if(!error_){
				if(body.split('<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value=')[1]){
					ViewState = body.split('<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value=')[1].split('autocomplete')[0];
					ViewState = ViewState.replace('"','').trim();
					ViewState = ViewState.replace('"','').trim();
				}
				
		}else{
			resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',error:true})
			return;
		}
		
		if(!ViewState){
			
			resultado({encontrado:false, mensaje:'Datos del cliente no ha sido verificados, debido a que el servidor validador de la cedula no responde',error:true})
			return;
		}
		if(response && response.statusCode == 200 ){//Siginifica que esta logoneado al sistema
			
		   try{
			//console.log(response.headers);
			//Importante una vez logoneado se obtiene el header para enviarle como parametros al siguiente url
			var heads = response.request.headers;
			//heads['Accept-Encoding']='gzip, deflate, sdch';
			heads['Content-Type'] = 'application/x-www-form-urlencoded; charset=iso-8859-1';
			heads['Accept'] = 'application/xml, text/xml, */*; q=0.01';
			heads['Origin'] = 'https://www.datoseguro.gob.ec';
			heads['Referer'] = 'https://www.datoseguro.gob.ec/web/guest/consulta-cne';
			heads['X-Requested-With'] = 'XMLHttpRequest';
			heads['Cookie'] = 'csfcfc=_1495Xfn; COOKIE_SUPPORT=true; '+response.headers['set-cookie'][0]
			
			request({
				uri: "https://186.101.75.60/web/guest/consulta-cne?p_p_id=consultapublica_WAR_consultapublica10&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_consultapublica_WAR_consultapublica10__jsfBridgeAjax=true&_consultapublica_WAR_consultapublica10__facesViewIdResource=%2Fviews%2Fview.xhtml&javax.faces.partial.ajax=true&javax.faces.source=A0945%3AformConsultaPublica%3Aj_idt12&javax.faces.partial.execute=%40all&javax.faces.partial.render=A0945%3AformConsultaPublica%3AmsnMatriz+A0945%3AformConsultaPublica%3AmessageCedula&A0945%3AformConsultaPublica%3Aj_idt12=A0945%3AformConsultaPublica%3Aj_idt12&A0945%3AformConsultaPublica=A0945%3AformConsultaPublica&javax.faces.encodedURL=https%3A%2F%2Fwww.datoseguro.gob.ec%2Fweb%2Fguest%2Fconsulta-cne%3Fp_p_id%3Dconsultapublica_WAR_consultapublica10%26p_p_lifecycle%3D2%26p_p_state%3Dnormal%26p_p_mode%3Dview%26p_p_cacheability%3DcacheLevelPage%26p_p_col_id%3Dcolumn-1%26p_p_col_count%3D1%26_consultapublica_WAR_consultapublica10__jsfBridgeAjax%3Dtrue%26_consultapublica_WAR_consultapublica10__facesViewIdResource%3D%252Fviews%252Fview.xhtml&A0945%3AformConsultaPublica%3AinputTextCedula="+identificacion+"&javax.faces.ViewState="+ViewState,
				method: "POST",
				//gzip: true,
				headers: heads,
				timeout : 10000, //Maximo espera 10 segundos por peticion
				 rejectUnauthorized: false,
				 postData: {
					mimeType: 'application/x-www-form-urlencoded',
					}
			}, function(error, response, body) {
					 if(response && response.statusCode == 200 ){
						//try{
						//Siginifica que esta logoneado al sistema
					
						if(body && body.indexOf('Exception')<0 && body.split('url=') &&  body.split('url=')[1] && body.split('url=')[1].split('></redirect>') && body.split('url=')[1].split('></redirect>')[0]){
						   //var headers1= response.request.headers;
							//headers1['Cookie'] = 'csfcfc=_1495Xfn; COOKIE_SUPPORT=true; '+response.headers['set-cookie'][0]
							request({
								uri: body.split('url=')[1].split('></redirect>')[0].replace('"','').replace('"','').replace('www.datoseguro.gob.ec','186.101.75.60').replace(/&amp;/g,'&').trim(),
								method: "GET",
								headers:  response.request.headers,
								timeout : 10000, //Maximo espera 10 segundos por peticion
								rejectUnauthorized: false,
								encoding: 'utf8'
							}, function(error, response, body) {
							    
								if(body && body.indexOf('disponible temporalmente')>=0){
									resultado({encontrado:false,mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
								}else{
									if(body && body.indexOf(identificacion)>=0 && body.split('<div class="ui-datatable-tablewrapper">') && body.split('<div class="ui-datatable-tablewrapper">')[1] && body.split('<div class="ui-datatable-tablewrapper">')[1].split('</div>') && body.split('<div class="ui-datatable-tablewrapper">')[1].split('</div>')[0]){
										resultado(transfomrarTablaToArrayMetodo2(body.split('<div class="ui-datatable-tablewrapper">')[1].split('</div>')[0].replace('<table role="grid">','<table id="datos-cne" >'))); //imprime el resultado en pantalla
										
									}else{
										if(body && body.indexOf('No se puede consultar')>=0){
											resultado({encontrado:false, mensaje:'No se puede consultar el numero de cedula '+identificacion, mostrarBoxAlternos:true})
										}else{
											if(body && body.indexOf('No hay registros disponibles')>=0){	
											
												resultado({encontrado:false, mensaje:'No hay registros disponibles con la identificacion '+identificacion,cancelar:true})
											}else{
												if(!body){
													console.log('body undefined')
													resultado({encontrado:false, mensaje:'No se obtuvo respuesta del servidor, por favor vuelva a intentar',mostrarBoxAlternos:true})
												}else{
													resultado({encontrado:false, mensaje:'No se puede consultar el numero de cedula',mostrarBoxAlternos:true})
												}
											}
											
										}
										
										
									}
									
								}
								
							})
						}else{
						   console.log('Exception');
							resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
						}
						/*}catch(error){
						
							console.log(error);
							resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
						}*/
					}else{
						resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
					}
						
			})
			}catch(error){
				console.log(error);
				resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',mostrarBoxAlternos:true})
				
			}
		}else{
			console.log(error);
			resultado({encontrado:false, mensaje:'No disponible, por favor vuelva a intentarlo',error:true})
		}
		
	});
	
}//fin function getInfoCedula

/****************
CONSULTA DE COMPROBANTES ELECTRONICOS EN EL SRI
Debido a las diferentes capas que tiene el sri para acceder a los comprabantes recibidos, se realizo varios request
a) Se hace un request al https://declaraciones.sri.gob.ec/tuportal-internet enviando una cokie jar, generada aleatoriamente con el modulo request
b) Una vez ingresado, se hace el login respectivo
******************/
ServletWS.prototype.getInfoComprobantesElectronicosRecibidos = function(identificacion,clave,busqueda,grabarArchivos, resultadoComprobantes){

	var j = request.jar()
	var url = 'https://declaraciones.sri.gob.ec/tuportal-internet';
    request({url: url, jar: j}, function () {
    	var cookie_string = j.getCookieString(url);
      	var cookies = j.getCookies(url);
      	//Haciendo el login
      	console.log("https://declaraciones.sri.gob.ec/tuportal-internet/j_security_check?j_username=#j_username&j_cedula=&j_password=#j_password&loguear=si&boton=Aceptar".replace("#j_username",identificacion).replace("#j_password",clave));
     	request({
     			url: 'https://declaraciones.sri.gob.ec/tuportal-internet/j_security_check?j_username=#j_username&j_cedula=&j_password=#j_password&loguear=si&boton=Aceptar'.replace("#j_username",identificacion).replace("#j_password",clave),
         		method: "GET",
         	  	jar: j,
				}, function(error, response1, body){
					if(error){
                    	console.log(error)
                    	resultadoComprobantes("DESCONECTADO, EN EL PRIMER LOGIN, SE ECONTRO UN ERROR");
                        return;
                    }
					//Segun la pagina existe un campo llamado estadoUsuario, que determina si esta ingresado(Usuario >>identificacion) o no(>>Desconectado)
					//Estado Desconectado o usario, password no valido
         			if(body && body.indexOf("estadoUsuario")>=0 && body.split("estadoUsuario")[1] && body.split("estadoUsuario")[1].indexOf("Desconectado")>=0){
         				console.log("Estado DESCONECTADO");
         				resultadoComprobantes("DESCONECTADO POR FAVOR REVISE LA IDIENTIFICACION Y LA CLAVE");
         				return;
         			}
         			//Estado Conectado
         			if(body.indexOf("estadoUsuario")>=0 && body.split("estadoUsuario")[1] && body.split("estadoUsuario")[1].indexOf(identificacion)>=0){
         				console.log("Estado CONECTADO*");
         				//Una vez ingresado se verifica si existe el menu CONSULTA COMPROBANTES ELECTRONICOS
         				//Es importante ya que este contiene un submenu que nos permite redirigirnos al url princiapl con un token
						if(body && body.indexOf("CONSULTA COMPROBANTES ELECTRONICOS")>=0){
							//Obteniendo el submenu, para esto se hace una busqueda dentro del menu CONSULTA COMPROBANTES ELECTRONICOS
							var parametro = body.split("CONSULTA COMPROBANTES ELECTRONICOS")[0].split("cambiarSigno")[body.split("CONSULTA COMPROBANTES ELECTRONICOS")[0].split("cambiarSigno").length-1].split("parameters:")[1].split("})")[0].split(",")[0]
							parametro = parametro.replace("'","").replace("'","");
							//Una vez obtenido el parametro, se lo inserta al final de la siguiente url para recien obtener el link a consultas de comprobantes
							request({
								url: 'https://declaraciones.sri.gob.ec/tuportal-internet/menusFavoritos.jspa?'+parametro,
								method: "GET",
								jar: j,
								}, function(error, response13, body3){

									if(error){
                                         console.log(error)
                                         resultadoComprobantes("ERROR, DESPUES DE HACER EL LOGIN Y QUERE CONSULTAR EL LINK");
                                         return;
                                     }
									//Si el request devuelve un body con el siguiente contenido ::COMPROBANTES ELECTRONICOS RECIBIDOS, significa que el contribuyente tiene acceso al menu consultar comprobantes electronicos
									if(body3 && body3.indexOf("COMPROBANTES ELECTRONICOS RECIBIDOS")>=0){
										var hrefs = body3.split("href");
										//Buscando los links, estos links son los subemuns de CONSULTA COMPROBANTES ELECTRONICOS
										//Ejemplo:
										//Menu
										//	->CONSULTA COMPROBANTES ELECTRONICOS
										//		->COMPROBANTES ELECTRONICOS RECIBIDOS
										//Se hace un recorrido con el objetivo de encontrar el que tenga como titulo COMPROBANTES ELECTRONICOS RECIBIDOS
										var hrefecontrado = false;
										for(var i in hrefs ){

											if(hrefs[i] && hrefs[i].indexOf("COMPROBANTES ELECTRONICOS RECIBIDOS")>=0){
												hrefecontrado = true;
												//Si es contrado se extrae el href, para hacer un request
												hrefs[i] = hrefs[i].split("COMPROBANTES ELECTRONICOS RECIBIDOS")[0].replace('="','').replace('">','').replace("&amp;",'&');
												//Haciendo el 4 request
												request({
													url:hrefs[i],
													method: "GET",
													jar: j,
													}, function(error, response14, body4){
															if(error){
                                                            	console.log(error)
                                                                resultadoComprobantes("ERROR, DESPUES DE HACER EL LOGIN Y QUERE CONSULTAR EL SUBLINK");
                                                                return;
                                                            }
															//El body de este 4 request nos entrega un form, que contien unas credenciales para ingresarnos temporalmente
															//Estas credenciales contienen un token, que es el username y token al mismo tiempo.
															if(body4 && body4.indexOf("j_security_check")>=0){
																var j_username = body4.split("j_security_check")[1].split("j_username")[1].split("value")[1].split("/>")[0].trim().replace('=','');
																var j_password = body4.split("j_security_check")[1].split("j_password")[1].split("value")[1].split("/>")[0].replace('"','').replace('"','').trim().replace('=','');
																var j_token = body4.split("j_security_check")[1].split("j_token")[1].split("value")[1].split("/>")[0].trim().replace('=','');
																//Hacieno un nuevo login con diferente cabezera
																request({
																	url: "https://declaraciones.sri.gob.ec/comprobantes-electronicos-internet/pages/consultas/recibidos/j_security_check?j_username="+j_username+"&j_password="+j_password+"&j_token="+j_token,
																	method: "GET",
																	headers:response14.request.headers,
																	}, function(error, response15, body5){
																			if(error){
																				console.log(error)
																				resultadoComprobantes("DESCONECTADO, EN EL SEGUNDO LOGIN, SE ECONTRO UN ERROR");
                                                                                return;
																			}
																			var ViewState  = "";
																			var anio=busqueda.anio;
																			var mes=busqueda.mes;
																			var dia=busqueda.dia;
																			//Como es una pagina jsf, esta contien un viewState que identifica a la vista, por tal motivo se necesita el viewState para enviar los paramtros,
																			//ya que sin este id, el servidor no reconoceria lo que enviaremos, es un nivel de seguridad
																			if(body5.split('<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value=')[1]){
																				ViewState = body5.split('<input type="hidden" name="javax.faces.ViewState" id="javax.faces.ViewState" value=')[1].split('autocomplete')[0];
																				ViewState = ViewState.replace('"','').trim();
																				ViewState = ViewState.replace('"','').trim().replace(":",'%3A').replace("","");
																			}
																			if(!ViewState){
                                                                            	console.log(error)
                                                                            	resultadoComprobantes("LO SENTIMOS NO SE ENCONTRO UN VIEWSTATE");
                                                                                return;
                                                                            }
                                                                            //Una vez hallado el viewstate se envian los parametros(anio, mes, dia) para obtener los comprobantes recibidos
																			request({
																				url: "https://declaraciones.sri.gob.ec/comprobantes-electronicos-internet/pages/consultas/recibidos/comprobantesRecibidos.jsf?frmPrincipal=frmPrincipal&frmPrincipal%3Aopciones=ruc&frmPrincipal%3Aano="+anio+"&frmPrincipal%3Ames="+mes+"&frmPrincipal%3Adia="+dia+"&frmPrincipal%3AcmbTipoComprobante=0&frmPrincipal%3AbtnBuscar=&javax.faces.ViewState="+ViewState,
																				method: "GET",
																				headers:response14.request.headers,
																				}, function(error, response16, body6){
																						//MonitorArchivos.grabarLogsObserver('logCron.txt',body6);
																						if(error){
                                                                                        	console.log(error)
                                                                                        	resultadoComprobantes("ERROR AL CONSULTAR LOS COMPROBANTES ELECTRONICOS DE RECEPCION");
                                                                                            return;
                                                                                        }
                                                                                        //Se verfica que exista la tabla de resultados, esta viene en formato html
																						if(body6 && body6.indexOf('<table role="grid">')>=0){
																							//La tabla que retorna es compleja y se traro de simplicarla para obtener solo lo neceario
																							var tabla = body6.split('<table role="grid">')[1].split("</table>")[0];
																							tabla = ('<table role="grid">'+tabla+"</table>").replace(/<div class="ui-dt-c">/g,"").replace(/<span style="font-weight:bold">/g,"").replace(/<\/span>/g,"").replace(/<\/div>/g,"");
																							var linkEliminar = '<a id="frmPrincipal:tablaCompRecibidos:??:j_idt63" href="#" class="ui-commandlink no-decor" onclick="PrimeFaces.ab({source:\'frmPrincipal:tablaCompRecibidos:??:j_idt63\',process:\'frmPrincipal:tablaCompRecibidos:??:j_idt63\',update:\'form-detalle-factura:panel-detalle-factura\',oncomplete:function(xhr,status,args){dlgPanelDetalleFactura.show();;}});return false;">';
																							var linkRelacionadosEliminar = '<a id="frmPrincipal:tablaCompRecibidos:??:j_idt84" href="#" class="ui-commandlink no-decor" onclick="PrimeFaces.ab({source:\'frmPrincipal:tablaCompRecibidos:??:j_idt84\',process:\'frmPrincipal:tablaCompRecibidos:??:j_idt84\',update:\'frmPrincipalMpn:pnlCabecera frmPrincipalMpn:pnlDetalle\',oncomplete:function(xhr,status,args){dlgDocumentosRelacionados.show();;}});return false;">';
																							var linkEliminar2 = '<a id="frmPrincipal:tablaCompRecibidos:??:lnkXml" href="#" style=" width : 16px;" onclick="mojarra.jsfcljs(document.getElementById(\'frmPrincipal\'),{\'frmPrincipal:tablaCompRecibidos:??:lnkXml\':\'frmPrincipal:tablaCompRecibidos:??:lnkXml\'},\'\');return false">';
																							var linkEliminar3 = '<a id="frmPrincipal:tablaCompRecibidos:??:lnkPdf" href="#" style=" width : 16px;" onclick="mojarra.jsfcljs(document.getElementById(\'frmPrincipal\'),{\'frmPrincipal:tablaCompRecibidos:??:lnkPdf\':\'frmPrincipal:tablaCompRecibidos:??:lnkPdf\'},\'\');return false">';
																							var imgEliminar = '<img src="/comprobantes-electronicos-internet/resources/imagenes/formatos/xml.gif" style="border:0;" />';
																							tabla = tabla.replace(/<img src="\/comprobantes-electronicos-internet\/resources\/imagenes\/formatos\/xml.gif" style="border:0;" \/>/g,"");
																							tabla = tabla.replace(/<img src="\/comprobantes-electronicos-internet\/resources\/imagenes\/formatos\/pdf.gif" style="border:0;" \/>/g,"");
																							tabla = tabla.replace(/<img src="\/comprobantes-electronicos-internet\/javax.faces.resource\/listar.gif.jsf\?ln=imagenes\/eventos" alt="Documentos Relacionados" style="border:0;" \/>/g,"");
																							tabla = tabla.replace(/\n|\r/g, "");
																							tabla = tabla.replace(/\t/g, "--");
																							tabla = tabla.replace(/<br \/>/g, "");
																							tabla = tabla.replace(/role="gridcell" style="text-align:center;"/g,"");
																							for(var i=0;i<100;i++){
																								tabla = tabla.replace(linkEliminar.replace(/\?\?/g,i),"").replace("</a>","");
																								tabla = tabla.replace(linkRelacionadosEliminar.replace(/\?\?/g,i),"").replace("</a>","");
																								tabla = tabla.replace(linkEliminar2.replace(/\?\?/g,i),"").replace("</a>","");
																								tabla = tabla.replace(linkEliminar3.replace(/\?\?/g,i),"").replace("</a>","");
																							}
																							console.log(tabla);

																							if(grabarArchivos){
																								var comprabantesR = transfomrarTablaToArrayMetodo3(tabla);
																								for(var iy1 in comprabantesR){
																									comprabantesR[iy1].urlxml = "c:/restful-nodeEdi-v01/xml-"+comprabantesR[iy1].id+".xml";
																									comprabantesR[iy1].urlpdf = "c:/restful-nodeEdi-v01/pdf-"+comprabantesR[iy1].id+".pdf";
																								}
																								for(var iy in comprabantesR){

																									request({
																										url: "https://declaraciones.sri.gob.ec/comprobantes-electronicos-internet/pages/consultas/recibidos/comprobantesRecibidos.jsf?frmPrincipal=frmPrincipal&frmPrincipal%3Aopciones=ruc&frmPrincipal%3Aano="+anio+"&frmPrincipal%3Ames="+mes+"&frmPrincipal%3Adia="+dia+"&frmPrincipal%3AcmbTipoComprobante=0&frmPrincipal%3AbtnBuscar=&javax.faces.ViewState="+ViewState+"&frmPrincipal%3AtablaCompRecibidos%3A#ID%3AlnkXml=frmPrincipal%3AtablaCompRecibidos%3A#ID%3AlnkXml".replace(/#ID/,parseInt(comprabantesR[iy].id - 1)),
																										method: "GET",
																										headers:response14.request.headers,
																										}, function(error, response17, body7){

																										}).pipe(fs.createWriteStream("xml-"+comprabantesR[iy].id+".xml"));
																									request({
																										url: "https://declaraciones.sri.gob.ec/comprobantes-electronicos-internet/pages/consultas/recibidos/comprobantesRecibidos.jsf?frmPrincipal=frmPrincipal&frmPrincipal%3Aopciones=ruc&frmPrincipal%3Aano="+anio+"&frmPrincipal%3Ames="+mes+"&frmPrincipal%3Adia="+dia+"&frmPrincipal%3AcmbTipoComprobante=0&frmPrincipal%3AbtnBuscar=&javax.faces.ViewState="+ViewState+"&frmPrincipal%3AtablaCompRecibidos%3A#ID%3AlnkPdf=frmPrincipal%3AtablaCompRecibidos%3A#ID%3AlnkPdf".replace(/#ID/,parseInt(comprabantesR[iy].id - 1)),
																										method: "GET",
																										headers:response14.request.headers,
																										}, function(error, response17, body7){

																										}).pipe(fs.createWriteStream("pdf-"+comprabantesR[iy].id+".pdf"));


																								}
																								resultadoComprobantes(comprabantesR);
																							}else{
																								resultadoComprobantes(transfomrarTablaToArrayMetodo3(tabla));
																							}


																							//

																						}else{
																							resultadoComprobantes("NO SE CONTRARON REGISTROS CON LOS PARAMETROS INGRESADOS");
                                                                                            return;
                                                                                        }//fIN IF

																			 });//FIN REQUEST
																});//Fin request
															}else{
                                                                 	resultadoComprobantes("NO SE CONTRARON LAS CREDENCIALES PARA EL SEGUNDO LOGIN");
                                                                    return;
                                                             }//fin if
												});//fin request
											break;
											}//Fin if
										}//Fin for HREF
										if(!hrefecontrado){
                                            resultadoComprobantes("CONECTADO, PERO NO SE ENCONTRO EL MENU CONSULTA COMPROBANTES ELECTRONICOS EN EL TERCER LINK");
                                            return;
                                         }
									}else{
										resultadoComprobantes("CONECTADO, PERO NO SE ENCONTRO EL MENU CONSULTA COMPROBANTES ELECTRONICOS EN EL SEGUNDO LINK");
                                    	return;
                                    }//Fin if
							}); //Fin request
						}else{
							resultadoComprobantes("CONECTADO, PERO NO SE ENCONTRO EL MENU CONSULTA COMPROBANTES ELECTRONICOS");
							return;


						}//Fin if
                    }else{

                    	console.log("Estado DESCONECTADO");
                        resultadoComprobantes("NO CONTIENE EL ESTADO DESCONECTADO NI TAMPOCO SE ECONTRO LA IDENTIFICACION, POR LO TANTO NO SE LOGRO INGRESAR");
                        return;
                    }//Fin if

         	    	//MonitorArchivos.grabarLogsObserver('logCron.txt',response1);
         			setTimeout(function () {
                						request({
                                        	uri: "https://declaraciones.sri.gob.ec/tuportal-internet/salir.jspa",
                                            method: "GET",
                                            headers: response1.request.headers,
                                            timeout : 10000 //Maximo espera 10 segundos por peticion
                                            }, function(error, response3, body3) {
                                               //Salio del sistema sri
                                               console.log("Logout de la cokie ");
										});

                	}, 60000); //Despues de 1minuto hace un logout
        }); //Fin request
    });//Fin request

}//fin function getInfoComprobantesElectronicosRecibidos


module.exports = new ServletWS();


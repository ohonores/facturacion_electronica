// app/rutas.js
var UAParser = require('ua-parser-js');

module.exports = function(app, passport, servletWS) {

    // =====================================
    // PAGINA PRINCIPAL
	// CODIGO 001
    // =====================================
    app.get('/', function(req, res) {
	console.log('pid is ' + process.pid);
		var parser = new UAParser();
		var ua = req.headers['user-agent'];     // user-agent header from an HTTP request 
		console.log(parser.setUA(ua).getResult());
		var browserAceptado = false;
		switch(parser.setUA(ua).getResult().browser.name){
			case 'IE':
				if(parser.setUA(ua).getResult().browser.version>=10){
					browserAceptado = true;
				}else{
					browserAceptado = false;
				}
			break;
			case 'Chrome':
				var version = parser.setUA(ua).getResult().browser.version.slice(0,2);
				if(version>=10){
					browserAceptado = true;
				}else{
					browserAceptado = false;
				}
			break;
			case 'Firefox':
				if(parser.setUA(ua).getResult().browser.version>=4){
					browserAceptado = true;
				}else{
					browserAceptado = false;
				}
			break;
			default:
			browserAceptado = true;
			
		}
		if(browserAceptado){
			
			res.render('home/index3.html',{ user: req.user , message: req.flash ?  req.flash('loginMensaje') : null ,ip:req.header('x-forwarded-for') || req.connection.remoteAddress});
			//res.render('home/usuarios.html',{ user: req.user , message: req.flash ?  req.flash('loginMensaje') : null });
		}else{
			 res.render('versiones-anteriores/index.html',{ user: req.user , message: req.flash ?  req.flash('loginMensaje') : null });
		}
		
       
    });

		
    // =====================================
    // LOGIN ===============================
	// Codigo 002
    // =====================================
    // show the login form
    app.post('/login', function(req, res, next) {
	 
	  passport.authenticate('local', function(err, user, info) {
		if (err) { 
			console.log(err);
		return next(err) 
		}
		if (!user) {
			
		  return res.send({login:false,mensaje:info.mensaje});
		}
		req.logIn(user, function(err) {
			
		
		  if (err) { 
			console.log(err); 
			return next(err); 
			}
		 return res.send({login:true});
		});
	  })(req, res, next);
	});

	
	// =====================================
    // MOVIMIENTO ===============================
	// Codigo 003
    // =====================================
    // muestra los documentos electronicos
	app.get('/movimientos', isUserAutenficado, function(req, res){
	  
		res.render('movimientos/index.html', { user: req.user});
	});

	app.get('/usuarios-conectados', isUserAutenficado, function(req, res){
	  
		res.render('home/usuarios.html', { user: req.user});
	});
	app.get('/movimientos-eq', isUserAutenficado, function(req, res){
	  
		res.render('home/movimientos24092015.html', { user: req.user});
	});
	app.get('/administracion-edi', isUserAutenficado, function(req, res){
	  
		res.render('13102015admin/index.html', { user: req.user});
	});
	
	

    
    // =====================================
    // LOGOUT, sale del sistema==============================
	// Codigo 004
    // =====================================
	app.get('/salir', function(req, res){
		  req.logout();
		   res.redirect('/');
		  res.send('ok');
	});
	
	// =====================================
    // ADMINISTRACION, administracion del sistema==============================
	// Codigo 005
    // =====================================
	app.get('/administracion', isUserAutenficado, function(req, res){
		res.render('administracion/adminstracion.html', { user: req.user, message: req.session.messages });
	});
   
    // =====================================
    // ROBOTS, robots del sistema==============================
	// Codigo 006
    // =====================================
   app.get('/administracion-robots/ingresar', isUserAutenficado, function(req, res){
		res.render('robots/index.html', { user: req.user, message: req.session.messages });
	});
	 app.get('/webrtc', function(req, res){
		res.render('webrtc/index.html', { user: req.user, message: req.session.messages });
	});
	
	// =====================================
    // MONITOR, robots del sistema==============================
	// Codigo 007
    // =====================================
	
	app.get('/monitor',isUserAutenficado, function(req, res) {
		res.render('monitor/index.html',{ user: req.user });
	});
	
	
	/**************************************
	LLAMADA AL SERVLET DE SWISSEDI(PAGINA WEB) PARA INICIAR O PARAR LOS ROBOTS DEL WEB SERVICE
	// Codigo 008
***************************************/
	app.get('/robots/:empresa/:accion/:codigo',isUserAutenficado, function(req, res){
		
		servletWS.procesarRoborEdi(req.params.empresa, req.params.accion, req.params.codigo,function(respuesta){
			res.send(respuesta);
		});
	});

	// =====================================
    // IP ADDRES, robots del sistema==============================
	// Codigo 009
    // =====================================
	
	app.get('/ipAddress',isUserAutenficado, function(req, res) {
		var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		res.send(ip);
		
	});
	
	/********************************************************
			RESETEO DE PASSWORD AL SISTEMA
			METODO POST->reseteo
			// Codigo 010
	**********************************************************/

	app.post('/reseteo', function(req, res) {
	  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	  servletWS.validarReseteoPasswordImpl(req.body.username,req.body.email,req.body.captcha,req.body.condic,ip, res);
	});

	/********************************************************
			CONSULTAR PERFILES
			// Codigo 011
	**********************************************************/

	app.get('/consultar/perfiles/1', isUserAutenficado ,function(req, res) {
	  res.send(['admin','usuario','invitado']);
	});


	/**************************************
	RESETEO DE PASSWORD VENTANA MOVIMIENTOS
	// Codigo 012
	***************************************/

	app.all('/cambioPassword', isUserAutenficado, function(req, res){
		servletWS.reseteoPasswordPaginaMovimiento(req.body.codigo,req.body.clave,req.body.nuevaClave,req.body.renuevaClave,req.body.condic,false, function(resultado){
			res.send(resultado);
		});
		
	});
	
	
	 /********************************************************
                        unsubscribed envio de estado de cuenta
                        // Codigo 011
      **********************************************************/

     app.get('/estado-cuenta/unsubscribed/:email/:idpersona/:id/:proceso/:clave',function(req, res) {
		/*********	
		verifica que todos los parametros tengan valores
		OJO :id es el idcliente osea el id del establecimiento
		**********/
		var mensaje;
		if(req.params.email && req.params.id && req.params.idpersona && req.params.proceso && req.params.clave){
			//Se almacena en un json los datos que recibe de la primera llamada
			mensaje={confirmar:true,email:req.params.email, url:"/estado-cuenta/unsubscribed/"+req.params.email+"/"+req.params.idpersona+"/"+req.params.id+"/"+req.params.proceso+"/"+req.params.clave+"/true"}
			
		}else{
			mensaje ="Error el link con cumple con los parametros de seguridad";
			
		}
		res.render('estado-cuenta/index.html',{"mensaje":mensaje}); 
		
	 });
	 
	 
	  
	 app.get('/estado-cuenta/unsubscribed/cancelar/',function(req, res) {
		var mensaje="Usted ha decido Cancelar, este link.";
		res.render('estado-cuenta/index.html',{"mensaje":mensaje}); 
	 });
	
	 /********************************************************
                        unsubscribed envio de estado de cuenta
                        // Codigo 012
        **********************************************************/

     app.get('/estado-cuenta/unsubscribed/:email/:idpersona/:id/:proceso/:clave/:confirmacion',function(req, res) {
		 if(req.params.confirmacion === "true"){
			servletWS.procesarRobotUnsuscribedEmailEstadoCuenta(req.params.email, req.params.idpersona, req.params.id, req.params.proceso,req.params.clave,
				function(respuesta){
					var mensaje = "La cuenta de correo "+req.params.email;
					if(respuesta && respuesta.ok){
						 switch(respuesta.ok){
							case "unsuscbribed":
								mensaje +=", ha sido unsubscribed exitosamente.";
							break;
							case "already_unsuscbribed":
								mensaje +=", ya se encuentra unsubscribed.";
							break;
							case "error_unsuscbribed":
								mensaje ="Error al unsubscribed la cuenta de correo "+req.params.email+", por favor int&#233;ntelo mas tarde";
							break;
							default:
								mensaje ="Error al unsubscribed la cuenta de correo "+req.params.email+", por favor int&#233;ntelo mas tarde";
							break;
						 }
						 
					}else{
						if(respuesta && respuesta.error){
							
							if(respuesta && respuesta.error.code){
								mensaje ="Error el servidor para desactivar el envio de emails, el servidor no esta dando respuesta"
							}else{
								if(respuesta && respuesta.error && respuesta.error.indexOf('rango')>=0){
									mensaje ="Error el link tiene una vigencia de un mes. Por favor espere recibir el proximo estado de cuenta para hacer realizar el unsuscbribed.";
								}
								if(respuesta && respuesta.error && respuesta.error.indexOf('seguridad')>=0){
								
									mensaje ="Error el link con cumple con los parametros de seguridad";
								}
							}
						}else
							mensaje ="Error al unsubscribed la cuenta de correo "+req.params.email+", por favor int&#233;ntelo mas tarde";
						
					}
					res.render('estado-cuenta/index.html',{"mensaje":mensaje}); 
				}
			)
		}else{
			var mensaje="Usted ha decido Cancelar, este link.";
			res.render('estado-cuenta/index.html',{"mensaje":mensaje}); 
		}
                          
     });


	
};

// verifica si el usuario se encuentra autentificado
function isUserAutenficado(req, res, next) {

    if (req.isAuthenticated())
        return next();

    //Si no esta lo envia a la pagina principal
    res.redirect('/');
}



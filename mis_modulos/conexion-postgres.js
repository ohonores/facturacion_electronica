var pg = require("pg");
var produccion = false;
var databaseNameProduccion ="swissediproducciona";
var databaseNameDesarrollo ="swissEdiDesarrollo";
var conString = "pg://postgres:root@localhost:5432/"+(produccion? databaseNameProduccion: databaseNameDesarrollo);
//var conString = "pg://postgres:Quicornac01@localhost:5432/"+(produccion? databaseNameProduccion: databaseNameDesarrollo);//Quicornac
var donea;
var ClientePG = function () {};
var cliente;

ClientePG.prototype.sql = function () {
		return cliente;
};

ClientePG.prototype.init = function () {
		pg.connect(conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			cliente = client;
			donea=done;
			
 
		});
};
	
ClientePG.prototype.getPoolClienteConexion = function (sql, parametros, resultado) {
		pg.connect(conString, function(err, client, done) {
			if(err) {
				console.error('error fetching client from pool', err)
				return null;
			}
			var query = client.query(sql, parametros, function(err, result) {
				// return the client to the connection pool for other requests to reuse
				done();
				if(err) {
					console.log(err);
					resultado(err);
				}else{
					resultado(result);
				}
			});
			
		});
};
ClientePG.prototype.consultarempresasParaSocketIO = function(NOTIFICACIONELECTRONICA){
	var query = "SELECT ruc||' '||descripcion||' '||codigo as query,ruc,id,descripcion,codigo,mensaje,urllogo, true as mostrar FROM swissedi.eeditempresa ";
	this.getPoolClienteConexion(query, [], function(result){
	
			if(result){
				
				NOTIFICACIONELECTRONICA(result.rows)
			}else{
				console.log('No se encontraron registros');
			}
	});
	
}
/***************************************************************
	FUNCION QUE PERMITE OBTENER LA PRIMARY KEY DE LA TABLA
****************************************************************/
ClientePG.prototype.getPrimaryKeyPorTabla  = function(tabla, respuesta){
		try{
			/********************
				Oteniendo tablas por esquema
			*******/
			var sqltablas = "SELECT column_name FROM information_schema.table_constraints a join information_schema.key_column_usage b on a.constraint_name=b.constraint_name WHERE a.TABLE_NAME =$1 and a.constraint_type='PRIMARY KEY'"
			this.getPoolClienteConexion(sqltablas,[tabla], function(resultado){

				if(resultado && resultado.rowCount>0){
					respuesta(resultado.rows[0].column_name);
				}else{
					respuesta("");
				}
			});
		}catch(error){
			console.log(error);
		}

}

ClientePG.prototype.initNoitificacion = function (NOTIFICACIONELECTRONICA) {
		pg.connect(conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			cliente = client;
			this.consultarempresasParaSocketIO(function(resultado){
				if(resultado){
					NOTIFICACIONELECTRONICA(resultado);
					console.log('******************');
					console.log(resultado);
				}
			});
 
		});
};


ClientePG.prototype.buscarUsuarioJson  = function(cedula, respuesta){
	/********************
		BASE DE DATOS
	 ********************/
	 
	 console.log('entro a garbarjson_usuario');
	
	var sqlbusqueda = "select datos_personales_y_perfil as datos from swissedi.eeditusarios_json where usuario = $1";
	
	this.getPoolClienteConexion(sqlbusqueda,[cedula], function(resultado){
		
		if(resultado && resultado.rowCount>0){
			respuesta(resultado.rows[0].datos);
		}else{
			respuesta(false);
		}
	});
	
}
ClientePG.prototype.buscarRucJson  = function(ruc, tipo, respuesta){
	/********************
		BASE DE DATOS
	 ********************/

	console.log('entro a garbarjson_usuario');
	/*
	SELECT NUMERO_ESTABLECIMIENTO,NUMERO_RUC,RAZON_SOCIAL,NOMBRE_COMERCIAL,ESTADO_CONTRIBUYENTE,CLASE_CONTRIBUYENTE,FECHA_INICIO_ACTIVIDADES,OBLIGADO,TIPO_CONTRIBUYENTE,NOMBRE_FANTASIA_COMERCIAL,CALLE,NUMERO,INTERSECCION,DESCRIPCION_PROVINCIA,DESCRIPCION_CANTON,DESCRIPCION_PARROQUIA, count(NUMERO_ESTABLECIMIENTO) OVER (PARTITION BY NUMERO_RUC)   FROM swissedi.registro_unico_contribuyentes WHERE Numero_Ruc=$1  AND ESTADO_CONTRIBUYENTE='ACTIVO' LIMIT 1;
	*/
	var sqlbusqueda = "";
	switch(tipo){
		case 2:
			sqlbusqueda = "SELECT NUMERO_RUC as RUC,RAZON_SOCIAL as RazonSocial,NOMBRE_COMERCIAL as NombreComercial,ESTADO_CONTRIBUYENTE as EstadodelContribuyenteenelRUC,CLASE_CONTRIBUYENTE as ClasedeContribuyente,FECHA_INICIO_ACTIVIDADES as Fechadeiniciodeactividades,FECHA_ACTUALIZACION as Fechaactualizacion, OBLIGADO as ObligadoallevarContabilidad,TIPO_CONTRIBUYENTE,NOMBRE_FANTASIA_COMERCIAL, count(NUMERO_ESTABLECIMIENTO) OVER (PARTITION BY NUMERO_RUC) as totalestab  FROM swissedi.registro_unico_contribuyentes WHERE Numero_Ruc=$1 AND ESTADO_CONTRIBUYENTE='ACTIVO' LIMIT 1;";
		break;
		case 1:
			sqlbusqueda = "SELECT NUMERO_RUC as RUC,RAZON_SOCIAL as RazonSocial,NOMBRE_COMERCIAL as NombreComercial,ESTADO_CONTRIBUYENTE as EstadodelContribuyenteenelRUC,CLASE_CONTRIBUYENTE as ClasedeContribuyente,FECHA_INICIO_ACTIVIDADES as Fechadeiniciodeactividades,FECHA_ACTUALIZACION as Fechaactualizacion, OBLIGADO as ObligadoallevarContabilidad,TIPO_CONTRIBUYENTE,NOMBRE_FANTASIA_COMERCIAL,(CALLE ||' '|| NUMERO ||' '|| INTERSECCION) as direccion,(DESCRIPCION_PROVINCIA ||'-'||DESCRIPCION_CANTON||','||DESCRIPCION_PARROQUIA) as ubicacion, count(NUMERO_ESTABLECIMIENTO) OVER (PARTITION BY NUMERO_RUC) as totalestab  FROM swissedi.registro_unico_contribuyentes WHERE Numero_Ruc=$1 AND NUMERO_ESTABLECIMIENTO::int=1 AND ESTADO_CONTRIBUYENTE='ACTIVO' LIMIT 1;";
		break;
	}

	if(!sqlbusqueda){
		respuesta(false);
		return;
	}
	console.log(sqlbusqueda);
	this.getPoolClienteConexion(sqlbusqueda ,[ruc], function(resultado){

		if(resultado && resultado.rowCount>0){
			console.log(resultado.rows[0]);
			console.log("fin postgres");
			respuesta(resultado.rows[0]);
		}else{
			respuesta(false);
		}
	});

}

/*********************
	BITACORA DEL USUARIO
**********************/


ClientePG.prototype.buscarIngresosBitacoraUsuario  = function(sesionid,respuesta){
	var sqlbusqueda = "select id,ingresos  from swissedi.eeditusarios_conectados where sesionid = $1";
	
	this.getPoolClienteConexion(sqlbusqueda,[sesionid], function(resultado){
		
		if(resultado && resultado.rowCount>0){
			var ingresos = resultado.rows[0].ingresos;
			ingresos.fechaingreso.push(new Date());
			
			respuesta(ingresos);
		}else{
			respuesta(false);
		}
	});
}

ClientePG.prototype.buscarRequestBitacoraUsuario  = function(sesionid,dato,respuesta){
	var sqlbusqueda = "select id,request  from swissedi.eeditusarios_conectados where sesionid = $1";
	
	this.getPoolClienteConexion(sqlbusqueda,[sesionid], function(resultado){
		
		if(resultado && resultado.rowCount>0){
			var ingresos = resultado.rows[0].request;
			
			ingresos.requests.push(dato);
			
			respuesta(ingresos);
		}else{
			respuesta(false);
		}
	});
}

ClientePG.prototype.actualizarIngresosBitacoraUsuario  = function(sesionid, ingresos, respuesta){
			/*****************
				ACTUALIZAR DATOS
			******************/
			
			sqlbusqueda = "UPDATE swissedi.eeditusarios_conectados SET ingresos = $1 where sesionid = $2";
			this.getPoolClienteConexion(sqlbusqueda,[ingresos,sesionid], function(resultado2){
		
				if(resultado2 && resultado2.rowCount>0){
					respuesta(true);
				}else{
					respuesta(false);
				}
			});
}

ClientePG.prototype.actualizarRequestBitacoraUsuario  = function(sesionid, requests, respuesta){
			/*****************
				ACTUALIZAR DATOS
			******************/
			
			sqlbusqueda = "UPDATE swissedi.eeditusarios_conectados SET ingresos = $1 where request = $2";
			requests
			this.getPoolClienteConexion(sqlbusqueda,[requests,sesionid], function(resultado2){
		
				if(resultado2 && resultado2.rowCount>0){
					respuesta(true);
				}else{
					respuesta(false);
				}
			});
}

ClientePG.prototype.grabarBitacoraUsuario  = function(empresa, sesionid,usuario,browser,ip,ubicacion, respuesta){
		try{
			/********************
				INSERTAR EN BASE DE DATOS
			 ********************/
			console.log(sesionid);
			
			var sqlinsert = "insert into swissedi.eeditusarios_conectados(empresa, sesionid, usuario,browser,ip,ubicacion,ingresos) values($1,$2,$3,$4,$5,$6,$7)  RETURNING id";
			var ingresos = {fechaingreso:[new Date()]};
			
			this.getPoolClienteConexion(sqlinsert,[empresa, sesionid,usuario,browser,ip,ubicacion,ingresos], function(resultado){
				
				if(resultado && resultado.rowCount>0){
					respuesta(true);
				}else{
					respuesta(false);
				}
			});
		}catch(error){	
			console.log(error);
		}
		
}
ClientePG.prototype.getTotalesAgrupadosPorEstado  = function(respuesta){
		try{
			/********************
				TOTALES AGRUPADOS POR ESTADO
			 ********************/
			 console.log('getTotalesAgrupadosPorEstado')
			//var sql = "SELECT empresa_id,estado,count(estado) as total FROM swissedi.eeditmovimiento GROUP BY estado,empresa_id order by empresa_id";
			var sql ="select * from (SELECT empresa_id,estado,count(estado) as total FROM swissedi.eeditmovimiento GROUP BY estado,empresa_id order by empresa_id) as a union  SELECT * from (SELECT empresa_id,'RIDE'::varchar as estado,count(*) as total FROM swissedi.eeditmovimiento where estado IN ('A','G')  GROUP BY empresa_id,ride,estado having ride is null) b";
			this.getPoolClienteConexion(sql,[], function(resultado){
				
				if(resultado && resultado.rowCount>0){
					respuesta(resultado.rows);
				}else{
					respuesta([]);
				}
			});
		}catch(error){	
			console.log(error);
		}
		
}
ClientePG.prototype.getTotalesAgrupadosPorEstadoRide  = function(respuesta){
		try{
			/********************
				TOTALES AGRUPADOS POR ESTADO
			 ********************/
			 console.log('getTotalesAgrupadosPorEstado')
			var sqlride ="SELECT empresa_id,count(*) as total FROM swissedi.eeditmovimiento where estado='A'  GROUP BY empresa_id,ride,estado having ride is null";
			this.getPoolClienteConexion(sqlride,[], function(resultado){
				
				if(resultado && resultado.rowCount>0){
					respuesta(resultado.rows);
				}else{
					respuesta([]);
				}
			});
		}catch(error){	
			console.log(error);
		}
		
}
ClientePG.prototype.getTamanioDB  = function(respuesta){
		try{
			/********************
				TOTALES AGRUPADOS POR ESTADO
			 ********************/
			 console.log('getTamanioDB')
			var sqlride ="SELECT datname as base, pg_size_pretty(pg_database_size(datname)) as size  FROM pg_database where datname = $1";
			this.getPoolClienteConexion(sqlride,[produccion? databaseNameProduccion: databaseNameDesarrollo], function(resultado){
				
				if(resultado && resultado.rowCount>0){
					respuesta(resultado.rows);
				}else{
					respuesta([]);
				}
			});
		}catch(error){	
			console.log(error);
		}
		
}
/*************
	CONSULTAR EMPRESAS IDS
**************/
ClientePG.prototype.getEmpresas  = function(respuesta){
		try{
			/********************
				TOTALES AGRUPADOS POR ESTADO
			 ********************/
			 console.log('getTamanioDB')
			var sqlride ="SELECT id FROM  swissedi.eeditempresa";
			this.getPoolClienteConexion(sqlride,null, function(resultado){
				
				if(resultado && resultado.rowCount>0){
					respuesta(resultado.rows);
				}else{
					respuesta([]);
				}
			});
		}catch(error){	
			console.log(error);
		}
		
}



 ClientePG.prototype.grabarJson  = function(datos, tabla, respuesta){
 	//Obteniendo la primary key de la tabla
 	var padre = this;
 	this.getPrimaryKeyPorTabla(tabla.split(".")[1], function(columnaId){
 		if(columnaId){

			var columnas = [];
			var sqlInsert = "INSERT INTO #TALBA(#COLUMNAS) VALUES(#VALORES)  RETURNING #COLUMNAID";
			var valores = [];
			var valoresIndices = [];
			var indice = 1;
			//Se hace un recorrido al json para obtener las columnas y valores
			for(var key in datos){
				valores.push(datos[key])
				valoresIndices.push("$"+indice);
				columnas.push(key);
				indice ++;
			}
			sqlInsert = sqlInsert.replace("#TALBA",tabla).replace("#COLUMNAS",columnas.join(",")).replace("#VALORES",valoresIndices.join(",")).replace("#COLUMNAID",columnaId);
			console.log(sqlInsert);
			padre.getPoolClienteConexion(sqlInsert,valores, function(resultado){
				if(resultado  && resultado.rows && resultado.rows && resultado.rows[0] && resultado.rows[0][columnaId]){
					respuesta({tipo:"success",mensaje:"REGISTRO GRABADO"});
				}else{
					respuesta({tipo:"error",mensaje:"REGISTRO NO GRABADO "});
				}

			});//FIN getPoolClienteConexion
         }else{
         	respuesta({tipo:"error",mensaje:"REGISTRO NO GRABADO, ERROR PG:PK NO ENCONTRADA"});
         }
 	})

 }

module.exports = new ClientePG();

  

    
   
    
    
  
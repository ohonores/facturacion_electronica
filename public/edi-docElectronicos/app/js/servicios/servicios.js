angular.module('uiRouterDocElectronicos.services', [

])

	// A RESTful factory para obtener variables a partir del archivo 'menusYestados.json'
	.factory('menusYestados', ['$http', 'utils', function ($http, utils) {
	  var path = 'assets/menusYestados.json';
	  var menusYestados = $http.get(path).then(function (resp) {
		return resp.data.todos;
	  });

	  var menusYestados = {};
	  menusYestados.all = function () {
		return todos;
	  };
	  menusYestados.get = function (id) {
		return todos.then(function(){
		  return utils.findByKey(todos, id);
		})
	  };
	  return menusYestados;
	}]);

	/*****
	RESTful factory:
	Movmientos
	****************/
	.factory('movimientoFactory', ['$http', 'utils', function ($http, utils) {
		var urlBase = '/movimientos/:prefijo/';
		var movimientoFactory = {};

		movimientoFactory.getMovimientos = function (busqueda, prefijo) {
			return $http.get(urlBase.replace(':prefijo',prefijo) + '/busqueda/' + JSON.stringify(busqueda));
		};

		movimientoFactory.getMovimientoBitacora = function (id, prefijo) {
		   return $http.get(urlBase.replace(':prefijo',prefijo) + '/bitacora/busqueda/' + id);
		};

		movimientoFactory.eliminarMovimiento = function (id, prefijo) {
			 return $http.get(urlBase.replace(':prefijo',prefijo) + '/eliminar/' + id);
		};
		
		movimientoFactory.editarXmlMovimiento = function (id, prefijo) {
			 return $http.get(urlBase.replace(':prefijo',prefijo) + '/editar/' + id);
		};
		movimientoFactory.bajarRide = function (id, prefijo) {
			 return $http.get(urlBase.replace(':prefijo',prefijo) + '/bajar/ride/' + id);
		};
		movimientoFactory.bajarXmlAutorizado = function (id, prefijo) {
			 return $http.get(urlBase.replace(':prefijo',prefijo) + '/bajar/xml/' + id);
		};

		return movimientoFactory;
	}])
	/*****
	RESTful factory:
	Cliente Proveedor
	****************/
	.factory('clienteProveedorFactory', ['$http', 'utils', function ($http, utils) {
		var urlBase = '/cliente-proveedor/:prefijo/';
		var clienteProveedorFactory = {};

		clienteProveedorFactory.getClienteProveedor = function (busqueda, prefijo) {
			return $http.get(urlBase.replace(':prefijo',prefijo) + '/busqueda/' + JSON.stringify(busqueda));
		};

		//Actualiza email y otros campos
		clienteProveedorFactory.actualizarClienteProveedor = function (datos, prefijo) {
			 return $http.put(urlBase.replace(':prefijo',prefijo) + '/actualizar/', datos);
		};

		return clienteProveedorFactory;
	}])
	/*****
	RESTful factory:
	Cliente Proveedor
	****************/
	.factory('sriFactory', ['$http', 'utils', function ($http, utils) {
		var urlBase = '/sri-acciones/:prefijo/';
		var sriFactory = {};

		sriFactory.enviarXml = function (id, prefijo) {
			return $http.get(urlBase.replace(':prefijo',prefijo) + '/enviar/' + id);
		};

		//Actualiza email y otros campos
		sriFactory.autorizarXml = function (id, prefijo) {
			 return $http.get(urlBase.replace(':prefijo',prefijo) + '/autorizar/'+ id);
		};

		return sriFactory;
	}]).
	/*****
	RESTful factory:
	Cliente Proveedor
	****************/
	.factory('archivoFactory', ['$http', 'utils', function ($http, utils) {
		var urlBase = '/archivos-acciones/:prefijo/';
		var archivoFactory = {};

		archivoFactory.subirArchivo = function (archivo, prefijo) {
			return $http.put(urlBase.replace(':prefijo',prefijo) + '/subir/', archivo);
		};

		//Actualiza email y otros campos
		archivoFactory.bajarArchivo = function (id, prefijo) {
			 return $http.get(urlBase.replace(':prefijo',prefijo) + '/bajar/'+ id);
		};

		//Actualiza email y otros campos
		archivoFactory.eliminarArchivo = function (id, prefijo) {
			 return $http.get(urlBase.replace(':prefijo',prefijo) + '/eliminar/'+ id);
		};

		return archivoFactory;
	}]);
	
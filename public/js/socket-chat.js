var socket = io();

//Para no pasar siempre el nombre 'Uriel'
var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('sala')) {
    window.location = 'index.html';
    throw new Error('El nombre y sala son necesarios');
}

var usuario = {
    nombre: params.get('nombre'),
    sala: params.get('sala')
};

socket.on('connect', function() {
    console.log('Conectado al servidor');
    //Para que el server sepa que usuario se conectó
    //Si yo me conecto o el server me acepta, tengo que ejecutar un callback
    socket.emit('entrarChat', usuario, function(resp) {
        console.log('Usuarios conectados: ', resp);
    });
    //configurarmos 'entrarChat' en socket.js
});

// escuchar
socket.on('disconnect', function() {

    console.log('Perdimos conexión con el servidor');

});


// Enviar información
/* socket.emit('crearMensaje', {
    usuario: 'Fernando',
    mensaje: 'Hola Mundo'
}, function(resp) {
    console.log('respuesta server: ', resp);
}); */

// Escuchar información
socket.on('crearMensaje', function(mensaje) {
    console.log('Servidor:', mensaje);
});

//Escuchar cambios de usuarios (Cuando un usuario entra o sale del chat)
socket.on('listaPersona', function(personas) { //(el nombre personas me lo acabo de inventar :p)
    console.log(personas);
});


//Mensajes privados (Acción de escuchar del cliente un mensaje privado)
socket.on('mensajePrivado', function(mensaje) {
    console.log('mensajePrivado:', mensaje);
})
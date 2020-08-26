const { io } = require('../server');
const { Usuarios } = require('../classes/usuario')
const { crearMensaje } = require('../utilidades/utilidades');
const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {


        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        //Instrucción que es primordial para conectar a un usuario a una sala
        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);


        //Cuando la persona vuelve a entrar al chat
        //Este evento se va a disparar cuando alguien entra al chat o sale del chat
        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        //Este evento también lo necesitamos cuando alguien se desconecta, así que lo copiamos abajo también
        callback(usuarios.getPersonasPorSala(data.sala));
    });

    //Para enviar mensaje a todo el grupo
    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id)
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
    });


    //Aquí vamos a trabajar con la desconexión, ya que cada que recargo el navegador, me genera un nuevo registro
    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id);
        //Para saber qué usuario abandonó el chat, se hace lo siguiente:
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salió`));
        //Despues de crear esta acción, necesito que los clientes estén escuchando este mensaje, así que nos movemos a "socket-chat.js"
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
        //Ahora creamos el evento "listaPersona" en "socket-chat.js"
    });

    //MENSAJES PRIVADOS
    //Lo que va a hacer el servidor cuando alguien quiera enviar un mensaje privado a alguien
    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    });


});
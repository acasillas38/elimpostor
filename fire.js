import * as fs from "https://cdn.jsdelivr.net/gh/smx-m14/js@main/firestore.js";

$(function () {
    configureDatabase();

    var idsTodosParticipantes = [];
    var nameTodosParticipantes = [];

    var esHost = false;
    var idMaquinaActual = randomBetween(1, 1000);
    var idFinalPartida = 0;
    var palabras = ["playa", "montaña", "pizza", "escuela", "perro", "gato", "coche", "avion", "movil", "ordenador", "fuego", "agua", "nieve", "lluvia", "sol", "luna", "estrella", "bosque", "rio", "mar", "isla", "ciudad", "pueblo", "hospital", "cine", "musica", "baile", "libro", "pelicula", "serie", "deporte", "futbol", "baloncesto", "tenis", "correr", "nadar", "comer", "beber", "cocina", "restaurante", "hotel", "viaje", "maleta", "dinero", "trabajo", "juego", "fiesta", "amigo", "familia", "amor"];
    var pistas = ["bronceado", "altitud", "porción", "examen", "correa", "bigotes", "aparcamiento", "embarque", "notificaciones", "pestañas", "ceniza", "transparente", "copos", "charcos", "quemar", "menguante", "constelación", "hojarasca", "caudal", "marea", "aislada", "tráfico", "campanario", "urgencias", "butaca", "ritmo", "coreografía", "capítulo", "tráiler", "temporada", "competición", "penalti", "rebote", "saque", "resistencia", "braza", "menú", "trago", "receta", "camarero", "check-in", "escapada", "equipaje", "efectivo", "horario", "random", "after", "confidente", "apellidos", "química"];

    $("#jugarBTN, #volverAJugar, #pasarAMostrar").hide();
    var recargar = false;
    var recargarCarga = setInterval(function () {
        if (recargar) {
            var cuantosJUG = $("#tbody tr").length;
            fs.getCollection("partidas/" + idFinalPartida + "/jugadores").then((col) => {
                if (cuantosJUG != col.length) {
                    $("#tbody tr").remove();
                    for (var i = 0; i < col.length; i++) {
                        var doc = col[i];
                        $("#tbody").append(`<tr><td>${doc.nom}</td></tr>`);
                    }
                }
            });
        }
    }, 2000);

    var cambiando = false;
    var crearPalabra = true;
    var cambiarPaginas = setInterval(function () {
        if (cambiando) {
            fs.getDocument("partidas", idFinalPartida).then((doc) => {
                if (doc.estado == "JUGANDO" && crearPalabra) {
                    if (esHost) {
                        crearPalabraJugar();
                    }
                    crearPalabra = false;

                    setTimeout(function () {
                        $("#esperando").hide();
                        $("#votacion").hide();
                        $("#palabra").show();
                    }, 500);
                    mostrarPalabraJugar();
                }
                else if (doc.estado == "VOTANDO") {
                    $("#esperando").hide();
                    $("#votacion").show();
                    $("#palabra").hide();
                    crearPalabra = true;
                } else if (doc.estado == "MOSTRANDO") {
                    quienEraImpostor();
                    $("#esperando").hide();
                    $("#votacion").hide();
                    $("#palabra").hide();
                    $("#mostrando").show();
                }
            });
        }
    }, 1000);

    var uniendome = false;

    $("#unirBTN").click(function () {
        if (!uniendome) {
            uniendome = true;
            $("#unirField").css("scale", "1");
            $("#unirField").show();
        } else if ($("#unirFieldname").val() != "" && uniendome && $("#unirField").val() != "") {
            var idPartida = $("#unirField").val();
            unirse(idPartida);
        }
    });

    $("#crearBTN").click(function () {
        if ($("#unirFieldname").val() != "") {
            crearJuego();
        }
    });

    $("#jugarBTN, #volverAJugar").click(function () {
        if (recargar) {
            recargar = false;
        }
        fs.saveDocument("partidas", idFinalPartida, {
            estado: "JUGANDO",
        });
    });

    $("#pasarAMostrar").click(function () {
        pasarAMostrarImpostor();
    })

    function crearJuego() {
        //fs.emptyCollection("partidas");
        var idPartida = randomBetween(0, 10000);
        fs.saveDocument("partidas", idPartida, {
            estado: "ESPERANDO",
        });
        unirse(idPartida);
        $("#jugarBTN, #volverAJugar, #pasarAMostrar").show();
        esHost = true;
    }

    function unirse(idpar) {
        $("#esperando").show();
        $("#unirse").hide();
        $("#idPartida").text(idpar);
        cambiando = true;
        idFinalPartida = idpar;
        setTimeout(function () {
            fs.saveDocument("partidas/" + idpar + "/jugadores", idMaquinaActual, {
                id: idMaquinaActual,
                nom: $("#unirFieldname").val(),
                palabra: "",
                desc: "",
                esimpostor: false,
            });
        }, 1000);
        recargar = true;
    }

    idsTodosParticipantes = [];
    nameTodosParticipantes = [];
    var palabraRandom = 0;
    var imp = 0;
    var idImpostor = 0;
    var palabraFinal = "";
    var pistaFinal = "";
    function crearPalabraJugar() {
        fs.getCollection("partidas/" + idFinalPartida + "/jugadores").then((col) => {
            for (var i = 0; i < col.length; i++) {
                var doc = col[i];
                idsTodosParticipantes.push(doc.id);
                nameTodosParticipantes.push(doc.nom);
            }
        });
        setTimeout(function () {
            palabraRandom = randomBetween(0, palabras.length - 1);
            imp = randomBetween(0, idsTodosParticipantes.length - 1);
            idImpostor = idsTodosParticipantes[imp];
            palabraFinal = palabras[palabraRandom];
            pistaFinal = pistas[palabraRandom];

            for (var i = 0; i < idsTodosParticipantes.length; i++) {
                var idParticipanteActual = idsTodosParticipantes[i];
                var nameParticipanteActual = nameTodosParticipantes[i];

                if (idImpostor == idParticipanteActual) {
                    console.log("impostor");
                    fs.saveDocument("partidas/" + idFinalPartida + "/jugadores", idParticipanteActual, {
                        id: idParticipanteActual,
                        nom: nameParticipanteActual,
                        palabra: "IMPOSTOR",
                        desc: pistaFinal,
                        esimpostor: true,
                        votos: 0,
                    });
                } else {
                    fs.saveDocument("partidas/" + idFinalPartida + "/jugadores", idParticipanteActual, {
                        id: idParticipanteActual,
                        nom: nameParticipanteActual,
                        palabra: palabraFinal,
                        desc: "",
                        esimpostor: false,
                        votos: 0,
                    });
                }
                console.log(idParticipanteActual);
                console.log(nameParticipanteActual);
                console.log("");

            }
        }, 400);
    }


    function mostrarPalabraJugar() {
        $("#palabraMostrada").text("TAPA TU PANTALLA");
        $("#descMostrada").text('AQUI SE MOSTRARA TU PALABRA');
        setTimeout(function () {
            fs.getDocument("partidas/" + idFinalPartida + "/jugadores", idMaquinaActual).then((doc) => {
                $("#palabraMostrada").text(doc.palabra);
                $("#descMostrada").text(doc.desc);
            });
            setTimeout(function () {
                fs.saveDocument("partidas", idFinalPartida, {
                    estado: "VOTANDO",
                });
            }, 4000);
        }, 3000);
    }

    function pasarAMostrarImpostor() {
        fs.saveDocument("partidas", idFinalPartida, {
            estado: "MOSTRANDO",
        });
    }

    function quienEraImpostor() {
        fs.getCollection("partidas/" + idFinalPartida + "/jugadores").then((col) => {
            for (var i = 0; i < col.length; i++) {
                var doc = col[i];
                if (doc.esimpostor == true) {
                    $("#quienERA").text(doc.nom);
                }
            }
        });
    }


    function configureDatabase() {
        const firebaseConfig = {
            apiKey: "AIzaSyBghrj6oHErXHJBoZVACrdOxILGKz017jY",
            authDomain: "programacion-e147b.firebaseapp.com",
            databaseURL: "https://programacion-e147b-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "programacion-e147b",
            storageBucket: "programacion-e147b.firebasestorage.app",
            messagingSenderId: "80079884903",
            appId: "1:80079884903:web:986135c397041094407ac2"
        };

        fs.prepareDatabase(firebaseConfig);
    }
});



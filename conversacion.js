saludo = "Hola, soy [CocaBot], tu  asistente de Whatsapp para  ordenar productos Coca  Cola para tu negocio."
emergencia = "¿Escribes para solucionar una situación urgente?"
//emergencia_respuesta = 

// Strings flujo de pedido
nueva_fecha = "Miercoles"
entrega_manana = "¡¡Haz tu pedido hoy antes de las 5 de la tarde para que llegue mañana!! Si lo envias después de las 5, llega hasta el " + nueva_fecha
confirmar_pedido = "Si pides ahora, tu pedido llega el Lunes 19 de Agosto"
catalogo = "Ir al catalogo de productos"

productos = "Cocacola"
total = "$650"
pedido = "Productos: " + productos + "\nTotal: " + total + "\n Paga en efectivo al recibir tus productos."

confirmacion = "¿Esta todo correcto?"

function buildButtonsMessagePayload(header, body, buttonTexts){
    // this should return the json we send to the user
    let i = 0;
    let len = buttonTexts.length;
    let buttons = []
    for (; i < len; ) {
        button = {
            "type": "reply",
            "reply": {
                "id": i,
                "title": buttonTexts[i]
            }
        }
        buttons.push(button)
        i++;
    }
    return {
        "header": {
            "text": header
        },
        "body": {
            "text": body
        },
        "action":{
            "buttons": buttons
        }
    }
}

function buildTextMessage(header, body){
    return {
        text: {
            "body": body
        }
    }
}

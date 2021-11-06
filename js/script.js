var materiasRecuperadas;
var flag = 0;
var idMateria;
var idCuatrimestre;

//Función para optimizar el getElementById
function $(id) {
    return document.getElementById(id);
}

//Funcion que administra el spinner
function mostrarSpinner(mostrar)
{
    if(mostrar)
    {
        $("divSpinner").hidden = false;
    }else
    {
        $("divSpinner").hidden = true;
    }
}

//Asocio los eventos.
window.addEventListener("load",()=>{

    CargarMaterias().then((listaDeMaterias) =>{
        mostrarSpinner(false);
        materiasRecuperadas = listaDeMaterias;
        ArmarTablaMaterias(materiasRecuperadas);
    });

    $("btnModificar").addEventListener("click",()=>{
        mostrarSpinner(true);
        let promise = ModificarMateria();
        promise.then(respuesta=>{
            ActualizarMateriasRecuperadas(generarObjetoDesdeForm());
            ArmarTablaMaterias(materiasRecuperadas);
            mostrarSpinner(false);
        }).catch(f=>{
            mostrarSpinner(false);
        })

    })

    $("btnEliminar").addEventListener("click",()=>{
        mostrarSpinner(true);
        let promise = EliminarMateria();
        promise.then(respuesta=>{
            ActualizarEliminarMateriasRecuperadas(idMateria);
            ArmarTablaMaterias(materiasRecuperadas);
            mostrarSpinner(false);
        }).catch(f=>{
            mostrarSpinner(false);
        })

    })
})

///CARGA EL JSON DE MATERIAS DESDE LA API.
function CargarMaterias()
{
    return new Promise((exito,error)=>{
        let peticion = new XMLHttpRequest()
        peticion.onreadystatechange = function(){
            if(peticion.readyState == 4 && peticion.status == 200)
            {
                exito(JSON.parse(peticion.responseText));
            }
            if(peticion.readyState == 4 && peticion.status !== 200)
            {
                error("Fallo la función 'CargarMaterias'.");
            }
        }
        peticion.open("GET", "http://localhost:3000/materias", true);
        peticion.send(); 
    });
}

///CARGA EL MENU DEL SELECT DE CUATRIMESTRE
function CargarMenuCuatrimestre()
{
    let sel = $("sel_cuatrimestre");
    if(flag == 0)
    {
        flag = 1;
        for(idCuatri=1; idCuatri<5; idCuatri++)
        {
            let opcion = document.createElement("option");
            opcion.appendChild(document.createTextNode(idCuatri));
            opcion.setAttribute("value", idCuatri.toString());
            sel.appendChild(opcion);
        }
    }

}

//CREA LA TABLA DE MATERIAS
function ArmarTablaMaterias(listaDeMaterias)
{ 
    let existTabla = $("tabla");
    //Valido si existe la tabla.
    if(existTabla)
    {
        existTabla.parentNode.removeChild(existTabla);
    }
    existTabla = document.createElement("table");
    existTabla.setAttribute("id", "tabla");
    $("divTabla").appendChild(existTabla);

    listaDeMaterias.forEach(materia =>{
        let fila = document.createElement("tr");
        //Nombre
        let tdNombre = document.createElement("td");
        let txtNombre = document.createTextNode(materia.nombre);
        fila.appendChild(tdNombre); tdNombre.appendChild(txtNombre);
        //Cuatrimestre
        let tdCuatrimestre = document.createElement("td");
        let txtCuatrimestre = document.createTextNode(materia.cuatrimestre);
        fila.appendChild(tdCuatrimestre); tdCuatrimestre.appendChild(txtCuatrimestre);
        //Fecha de Final
        let tdFechaFinal = document.createElement("td");
        let txtFechaFinal = document.createTextNode(materia.fechaFinal);
        fila.appendChild(tdFechaFinal); tdFechaFinal.appendChild(txtFechaFinal);
        //Turno
        let tdTurno = document.createElement("td");
        let txtTurno = document.createTextNode(materia.turno);
        fila.appendChild(tdTurno); tdTurno.appendChild(txtTurno);
        
        fila.setAttribute("id", materia.id);
        fila.setAttribute("idMateria", materia.id.toString());
        fila.setAttribute("idCuatrimestre", materia.cuatrimestre.toString());
        fila.addEventListener("dblclick",MostrarVentanaModificar);
        $("tabla").appendChild(fila);
    });
}

//MUESTRA LA VENTANA PARA MODIFICAR Y LE CARGA LOS DATOS DEL SELECCIONADO.
function MostrarVentanaModificar(event)
{
    let divMateria=$("divModificarMateria");
    divMateria.hidden = false;
    let fila = event.target.parentNode; 
    let nombre = fila.childNodes[0].childNodes[0].nodeValue;
    let cuatrimestre = fila.childNodes[1].childNodes[0].nodeValue;
    let fechaFinal = fila.childNodes[2].childNodes[0].nodeValue;
    let turno = fila.childNodes[3].childNodes[0].nodeValue;

    CargarMenuCuatrimestre();
    idMateria = fila.getAttribute("idMateria");
    idCuatrimestre = fila.getAttribute("idCuatrimestre");
    //Asigno las variables a la ventana.
    $("txtNombre").value = nombre;
    $("sel_cuatrimestre").value = cuatrimestre.toString();
    if(turno == "Mañana"){
        $("mañana").checked = true;
    }else{
        $("noche").checked = true;
    }
    let año = fechaFinal.toString().substr(6,4);
    let mes = fechaFinal.toString().substr(3,2);
    let dia = fechaFinal.toString().substr(0,2);
    let fecha = año + "-" + mes + "-" + dia;
    $("dateFechaFinal").value = fecha.toString();
}


//ACTUALIZA LA LISTA DE MATERIAS QUE YA TENGO
function ActualizarMateriasRecuperadas(materiaRecibida)
{
    materiasRecuperadas.forEach(materia =>{
        if(materia.id == materiaRecibida.id)
        {
            materia.nombre = materiaRecibida.nombre;
            materia.cuatrimestre = materiaRecibida.cuatrimestre;
            materia.fechaFinal = materiaRecibida.fechaFinal;
            materia.turno = materiaRecibida.turno;
        }  
    })
}

//ACTUALIZA LA LISTA DE MATERIAS QUE YA TENGO
function ActualizarEliminarMateriasRecuperadas(idMateria)
{
    materiasRecuperadas = materiasRecuperadas.filter(function(materia) {
        return materia.id !== idMateria; 
    });
}

//Validan los nuevos datos cargados de la Persona.
function ValidacionMateria(materia)
{
    $("sel_cuatrimestre").disabled = "disabled";
    let validarSelectCuatri = true;
    let validarNombreMateria = true;
    let validarFecha = true;
    let validarTurno = true;
    let fechaActual = new Date();

    //Valida el tamaño del nombre.
    if(materia.nombre.length <= 6)
    {
        $("txtNombre").style.borderColor="red";          
        validarNombreMateria = false;
    }

    //Valida la disponibilidad del select.
    if($("sel_cuatrimestre").disabled == "disabled")
    {       
        validarSelectCuatri = false;
    }

    let año = materia.fechaFinal.toString().substr(6,4);
    let mes = materia.fechaFinal.toString().substr(3,2);
    let dia = materia.fechaFinal.toString().substr(0,2);
    let fechaObjeto = new Date (año + "-" + mes + "-" + dia);
    if(Date.parse(fechaObjeto) <= Date.parse(fechaActual))
    {
        $("dateFechaFinal").style.borderColor="red";
        validarFecha = false;
    }

    //Valida si esta seleccionado algun turno.
    if(!($("mañana").checked || $("noche").checked))
    {
        validarTurno = false;
    }

    return validarNombreMateria && validarSelectCuatri && validarTurno && validarFecha;
}

///GENERA EL OBJETOS CON LOS DATOS DEL FORMULARIO
function generarObjetoDesdeForm()
{
    let fechaFinal = $("dateFechaFinal").value;
    let año = fechaFinal.toString().substr(0,4);
    let mes = fechaFinal.toString().substr(5,2);
    let dia = fechaFinal.toString().substr(8,2);
    let fechaModificada = dia + "/" + mes + "/" + año;

    let objeto = {
        id: parseInt(idMateria),
        nombre: $("txtNombre").value.toString(),
        cuatrimestre: parseInt(idCuatrimestre),
        fechaFinal: fechaModificada.toString(),
        turno: ($("mañana").checked==true ? "Mañana" : "Noche"),
    };
    return objeto;
}

//ENVIA LA PETICION AL SERVIDOR PARA MODIFICAR UNA MATERIA
function ModificarMateria()
{
    let objetoRecuperado = generarObjetoDesdeForm();
    if(ValidacionMateria(objetoRecuperado))
    {
        return new Promise((exito, error) =>{
            let peticion = new XMLHttpRequest();
            peticion.onreadystatechange = function(){
                if(peticion.status == 200 && peticion.readyState == 4)
                {
                    exito(JSON.parse(peticion.responseText));
                }
                if(peticion.status !== 200 && peticion.readyState == 4)
                {
                    error("Fallo la función 'ModificarMateria'.");
                }
            }
            peticion.open("POST","http://localhost:3000/editar", true);
            peticion.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            peticion.send(JSON.stringify(objetoRecuperado));
        });
    }


}

//ENVIA LA PETICION AL SERVIDOR PARA ELIMINAR UNA MATERIA
function EliminarMateria()
{
    let objeto = {
        id: parseInt(idMateria),
    };

    return new Promise((exito, error) =>{
        let peticion = new XMLHttpRequest();
        peticion.onreadystatechange = function(){
            if(peticion.status == 200 && peticion.readyState == 4)
            {
                exito(JSON.parse(peticion.responseText));
            }
            if(peticion.status !== 200 && peticion.readyState == 4)
            {
                error("Fallo la función 'EliminarMateria'.");
            }
        }
        peticion.open("POST","http://localhost:3000/eliminar", true);
        peticion.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        peticion.send(JSON.stringify(objeto));
    });
}
 
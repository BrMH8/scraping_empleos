//Importar modulos 'readline' este es nativo de Node.js
import readline from "readline";


export function preguntarElemento(){

    return new Promise((resolve) => {
        // Crear una interfaz de lectura con readline
        // input: lee desde la consola
        // output: muestra el texto en la consola
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        //funcion auxiliar para preguntar de forma recursiva si la entrada es invalida
        function hacerPregunta(){
            rl.question('¿Qué vacante desea buscar en Hireline? ', (respuesta) => {
                const argumentoBusqueda = respuesta.trim();

                if (argumentoBusqueda === '' || argumentoBusqueda.length < 3) {
                    console.log('Entrada no valida no puede estar vacío o tener solo espacios, debe tener al menos 3 caracteres.\n');
                    hacerPregunta(); // Volver a preguntar si la entrada es inválida
                } else {
                    rl.close(); // Cerrar la interfaz de lectura
                    resolve(argumentoBusqueda); // Resolver la promesa con el argumento de búsqueda
                }

            });
        }
        hacerPregunta(); 
    });
}
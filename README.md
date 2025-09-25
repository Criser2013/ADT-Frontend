# Frontend - HADT

Interfaz de usuario para la aplicación "Herramienta para apoyar el diagnóstico de TEP". Se requiere un proyecto de Firebase con los servicios de autenticación y base de datos habilitados (firestore). El proyecto hace uso de las siguientes bibliotecas:

- React + Vite - SWC plugin.
- Material UI.
- React router DOM.

## ¿Cómo ejecutar el proyecto?

Para ejecutar el proyecto debe instalar las dependencias con el siguiente comando:

```
npm ci
```

Para ejecutar la aplicación utilice el siguiente comando:

```
npm run dev
```

Tenga en cuenta que de esta forma se requiere que el servidor backend esté en ejecución. En la siguiente sección se indica cómo incluir la URL del backend.

### Variables de entorno requeridas
```
VITE_DRIVE_API_URL=<string>          # URL de la API de Drive
VITE_DRIVE_FILENAME=<string>         # Nombre del archivo con los pacientes en Drive
VITE_API_URL=<string>                # URL del API (servidor backend)
VITE_EXPORT_FILENAME=<string>        # Nombre del archivo para exportar diagnósticos
VITE_DRIVE_FOLDER_NAME=<string>      # Nombre de la carpeta en Drive
VITE_URL_MANUAL_USUARIO=<string>     # URL del manual de instrucciones para los usuarios
VITE_URL_MANUAL_ADMIN=<string>       # URL del manual de instrucciones para los administradores
VITE_CANT_LIM_DIAGNOSTICOS=<int>     # Cantidad de diagnósticos a partir del cual mostrar la advertencia de espacio
VITE_URL_CONDICIONES=<string>        # URL al documento que contiene los términos y condiciones de uso de la aplicación
```

## Ejecución del frontend  sin backend

Es posible ejecutar la aplicación sin necesidad de tener activo el servidor backend, para esto se debe proveer las credenciales de Firebase y los permisos de drive en un archivo `.env`. Se provee el archivo `.env.example` como plantilla.  

Para iniciar el servidor de esta forma, establezca la siguiente variables de entorno: `VITE_ENTORNO=0`. Esto puede ser realizado a través del comando `export VITE_ENTORNO=0` en Linux y `setx VITE_ENTORNO 0` en Windows.

### Descripción de las variables de entorno

```
VITE_API_KEY=<string>            # API key del proyecto de Firebase
VITE_AUTH_DOMAIN=<string>        # Dominio de autenticación de Firebase
VITE_PROJECT_ID=<string>         # ID del proyecto en Firebase
VITE_STORE_BUCKET=<string>       # ID del bucket de Firestore
VITE_MESSAGING_SENDER_ID=<int>   # ID para envío de mensajes
VITE_APP_ID=<string>             # ID de la aplicación de Firebase
VITE_MEASUREMENT_ID=<string>     # ID de Google Analytics (métricas)
VITE_DRIVE_SCOPES=<string>       # URLs de permisos de Drive requeridos
VITE_ENTORNO=<int>               # Número de entorno de ejecución
VITE_RECAPTCHA_SITE_KEY=<string> # Clave de reCAPTCHA para el sitio
```

## Dockerfile

La imagen generada `Dockerfile` corresponde a una imagen de despliegue, para construirla use el comando:

```
docker image build --build-arg API_URL=<URL-BACKEND>
```

La aplicación será visible en el puerto `80` del contenedor.

## Pruebas unitarias

Para ejecutar las pruebas unitarias utilice el siguiente comando:

```
npm test -- --json --outputFile=./tests/unitarias/resultados/testRun-output-$(date +%Y-%m-%d_%H-%M-%S).json --passWithNoTests
```

O en su lugar ejecute el archivo: `ejecutar-tests-sh` desde una terminal.  
En la carpeta `tests/unitarias` se encuentran los scripts de prueba. En la carpeta `cobertura` se guardan los informes de cobertura de código de las pruebas. De igual forma, la carpeta `resultados` almacena los informes de ejecución en formato **JSON**.  

Sino desea ejecutar las pruebas sin almacenar el informe de resultados, ejecute el comando:

```
npm test
```

Para cambiar la configuración de este apartado, modifique el archivo `jest.config.js`. Para más informaciónc consulte la [documentación](https://jestjs.io/docs/configuration).

## ESLint

Se emplea la configuración por defecto de **ESLint**, excluyendo la revisión de archivos de producción y pruebas.
Se exige utilizar punto y coma `;` al final de las sentencias. Para ejecutar las comprobaciones, basta con utilizar la extensión [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) de VSCode o utilice el comando en una terminal:

```
npm run lint
```

Puede cambiar las configuraciones en el archivo `vite.config.js`. Para más informacióm, consulte la [documentación](https://eslint.org/docs/latest/use/configure/).
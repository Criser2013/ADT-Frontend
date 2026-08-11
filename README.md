# Frontend - HADT

Interfaz de usuario web para la aplicación **"Herramienta para apoyar el diagnóstico de TEP"**.

Se requiere un proyecto de **Firebase** con los servicios de autenticación y base de datos (**Firestore**) habilitados. El proyecto utiliza las siguientes bibliotecas y tecnologías:

- `React + Vite - SWC plugin`
- `Material UI`
- `React Router`
- `i18next`
- `xlsx` (SheetJS Community Edition)

El objetivo de este proyecto es proporcionar una aplicación web responsiva que permita utilizar un modelo de inteligencia artificial como apoyo en el diagnóstico de **tromboembolismo pulmonar (TEP)**.

La aplicación recolecta los datos de los diagnósticos realizados con el fin de permitir el entrenamiento de nuevos modelos de *machine learning* con mejores capacidades para detectar el TEP. Los datos de los diagnósticos se almacenan en **Firestore**, enmascarando la identidad del paciente al que corresponde cada diagnóstico.

Además, la aplicación utiliza los servicios de **Google Drive**, **reCAPTCHA** y **Firebase**.

## Esquemas de datos

La aplicación utiliza dos servicios para almacenar los datos de los pacientes y los diagnósticos. Ambos funcionan de forma independiente y permiten aislar la información. El objetivo de esta arquitectura es permitir el funcionamiento de la aplicación utilizando la capa gratuita de **Firebase**.

### Google Drive

Los datos de los pacientes se almacenan en una **hoja de Excel** dentro de la carpeta de la aplicación, ubicada en el espacio de Google Drive del usuario.

Estos datos **permanecen privados y aislados de la base de datos**, por lo que no son compartidos con la aplicación. La estructura del documento es la siguiente:

| Nombre del campo           | Tipo de dato | Descripción                                                         |
| -------------------------- | ------------ | ------------------------------------------------------------------- |
| id                         | `String`     | Identificador único del usuario                                     |
| cedula                     | `String`     | Número de identificación del usuario (cédula/DNI)                   |
| nombre                     | `String`     | Nombre completo del paciente                                        |
| telefono                   | `String`     | Número de teléfono fijo o celular del paciente                      |
| fechaNacimiento            | `String`     | Fecha de nacimiento del paciente en formato `DD-MM-AAAA`            |
| sexo                       | `Int`        | Sexo del paciente: `0` es masculino y `1` es femenino               |
| fechaCreacion              | `String`     | Fecha en la que se añadió el paciente a la aplicación               |
| otraEnfermedad             | `Boolean`    | Indicador de si el paciente padece comorbilidades                   |
| Enfermedad vascular        | `Boolean`    | Indicador de si el paciente padece una enfermedad vascular          |
| Trombofilia                | `Boolean`    | Indicador de si el paciente padece trombofilia                      |
| Enfermedad renal           | `Boolean`    | Indicador de si el paciente padece una enfermedad renal             |
| Enfermedad pulmonar        | `Boolean`    | Indicador de si el paciente padece una enfermedad pulmonar          |
| Diabetes Mellitus          | `Boolean`    | Indicador de si el paciente padece diabetes mellitus                |
| Hipertensión arterial      | `Boolean`    | Indicador de si el paciente padece hipertensión arterial            |
| Hepatopatía crónica        | `Boolean`    | Indicador de si el paciente padece una hepatopatía crónica          |
| Enfermedad hematológica    | `Boolean`    | Indicador de si el paciente padece una enfermedad hematológica      |
| VIH                        | `Boolean`    | Indicador de si el paciente padece VIH                              |
| Enfermedad cardíaca        | `Boolean`    | Indicador de si el paciente padece una enfermedad cardíaca          |
| Enfermedad coronaria       | `Boolean`    | Indicador de si el paciente padece una enfermedad coronaria         |
| Enfermedad endocrina       | `Boolean`    | Indicador de si el paciente padece una enfermedad endocrina         |
| Enfermedad gastrointestinal | `Boolean`   | Indicador de si el paciente padece una enfermedad gastrointestinal  |
| Enfermedad urológica       | `Boolean`    | Indicador de si el paciente padece una enfermedad urológica         |
| Enfermedad neurológica     | `Boolean`    | Indicador de si el paciente padece una enfermedad neurológica       |

El campo `id` se genera automáticamente utilizando la librería `uuid`, que genera un identificador a partir de la fecha y hora. Por lo tanto, si dos usuarios registran un paciente en el mismo instante, ambos podrían obtener el mismo identificador.

De esta forma, se busca garantizar la privacidad de los datos de los pacientes, puesto que únicamente se comparte el campo `id`. La relación entre cada identificador y el paciente al que corresponde se mantiene dentro de la hoja de Excel almacenada en el espacio de Google Drive de cada usuario.

### Firestore

La aplicación utiliza **Firestore** para almacenar los datos de los diagnósticos recolectados. Cada diagnóstico se almacena como un documento en la subcolección:

```text
/usuarios/<UID-usuario>/diagnosticos/<UID-diagnostico>
````

Las reglas de seguridad impiden que un usuario ajeno, excepto los administradores, pueda obtener los datos de un diagnóstico.

A continuación, se describe el contenido de cada documento y sus respectivos campos:

| Nombre del campo            | Tipo de dato    | Descripción                                                                                                                                                                                                                                                            |
| --------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TEP_TVP_previo              | `Boolean`       | Indica si el paciente ha sufrido previamente TEP o trombosis venosa profunda (TVP).                                                                                                                                                                                    |
| bebedor                     | `Boolean`       | Indica si el paciente consume alcohol frecuentemente.                                                                                                                                                                                                                  |
| comorbilidades              | `Array<String>` | Lista de comorbilidades que padece el paciente. Actualmente se evalúan 15 categorías posibles (VIH, enfermedad pulmonar, hipertensión arterial, diabetes mellitus, etc.). El listado completo se encuentra en la variable `COMORBILIDADES` del archivo `constants.js`. |
| crepitaciones               | `Boolean`       | Indica si el paciente presenta crepitaciones.                                                                                                                                                                                                                          |
| derrame                     | `Boolean`       | Indica si el paciente ha presentado derrame.                                                                                                                                                                                                                           |
| diagnosticoMedico           | `Boolean`       | Diagnóstico de TEP confirmado por el médico. El valor `true` significa diagnóstico positivo para TEP y `false`, negativo.                                                                                                                                              |
| diagnosticoModelo           | `Boolean`       | Diagnóstico de TEP clasificado por el modelo. El valor `true` significa diagnóstico positivo para TEP y `false`, negativo.                                                                                                                                             |
| disnea                      | `Boolean`       | Indicador de que el paciente presenta disnea.                                                                                                                                                                                                                          |
| dolor_toracico              | `Boolean`       | Indicador de si el paciente presenta dolor torácico.                                                                                                                                                                                                                   |
| edad                        | `Int`           | Edad del paciente al momento del diagnóstico.                                                                                                                                                                                                                          |
| edema_de_m_inferiores       | `Boolean`       | Indicador de si el paciente presenta edema en los miembros inferiores.                                                                                                                                                                                                 |
| explicacion                 | `Array<String>` | Campos que el modelo LIME considera como los factores que más explican la clasificación realizada por el modelo.                                                                                                                                                       |
| fecha                       | `Date`          | Fecha y hora del diagnóstico.                                                                                                                                                                                                                                          |
| fiebre                      | `Boolean`       | Indicador de si el paciente presenta fiebre.                                                                                                                                                                                                                           |
| frecuencia_cardiaca         | `Int`           | Frecuencia cardíaca del paciente al momento del diagnóstico, expresada en **lpm**.                                                                                                                                                                                     |
| frecuencia_respiratoria     | `Int`           | Frecuencia respiratoria del paciente al momento del diagnóstico, expresada en **rpm**.                                                                                                                                                                                 |
| fumador                     | `Boolean`       | Indicador de si el paciente consume tabaco frecuentemente.                                                                                                                                                                                                             |
| hb                          | `Float`         | Valor de hemoglobina en la sangre, expresado en **g/dL**.                                                                                                                                                                                                              |
| hemoptisis                  | `Boolean`       | Indicador de si el paciente presenta hemoptisis.                                                                                                                                                                                                                       |
| inmovilidad_de_m_inferiores | `Boolean`       | Indicador de si el paciente presenta o ha presentado inmovilidad en los miembros inferiores durante los 15 días anteriores al diagnóstico.                                                                                                                             |
| malignidad                  | `Boolean`       | Indicador de si el paciente presenta malignidad.                                                                                                                                                                                                                       |
| otraEnfermedad              | `Boolean`       | Indicador de si el paciente presenta comorbilidades.                                                                                                                                                                                                                   |
| paciente                    | `String`        | Identificador único del paciente generado al registrarlo en la aplicación. Es `null` si se trata de un diagnóstico anónimo.                                                                                                                                            |
| plt                         | `Int`           | Conteo de plaquetas en la sangre, expresado en **/µL**.                                                                                                                                                                                                                |
| presion_diastolica          | `Int`           | Presión diastólica al momento del diagnóstico.                                                                                                                                                                                                                         |
| presion_sistolica           | `Int`           | Presión sistólica al momento del diagnóstico.                                                                                                                                                                                                                          |
| probabilidad                | `Float`         | Probabilidad estimada por el modelo de clasificación de TEP.                                                                                                                                                                                                           |
| proc_quirurgico_traumatismo | `Boolean`       | Indicador de si el paciente ha sufrido un traumatismo grave o ha tenido procedimientos quirúrgicos durante los 15 días anteriores al diagnóstico.                                                                                                                      |
| saturacion_de_la_sangre     | `Int`           | Saturación de oxígeno en la sangre del paciente al momento del diagnóstico, expresada como porcentaje.                                                                                                                                                                 |
| sexo                        | `Int`           | Sexo del paciente: `0` es masculino y `1` es femenino.                                                                                                                                                                                                                 |
| sibilancias                 | `Boolean`       | Indicador de si el paciente presenta sibilancias.                                                                                                                                                                                                                      |
| sintomas_disautonomicos     | `Boolean`       | Indicador de si el paciente presenta síntomas disautonómicos.                                                                                                                                                                                                          |
| soplos                      | `Boolean`       | Indicador de si el paciente presenta soplos.                                                                                                                                                                                                                           |
| tos                         | `Boolean`       | Indicador de si el paciente presenta tos.                                                                                                                                                                                                                              |
| viaje_prolongado            | `Boolean`       | Indicador de si el paciente ha realizado un viaje prolongado durante los 15 días anteriores al diagnóstico.                                                                                                                                                            |
| wbc                         | `Int`           | Conteo de glóbulos blancos en la sangre, expresado en **/µL**.                                                                                                                                                                                                         |

Una vez validado un diagnóstico, este no puede ser modificado de ninguna forma, **ni siquiera por los administradores**, dado que las reglas de seguridad lo impiden.

## Requisitos

* Tener un proyecto creado en **Firebase** con los servicios de autenticación y base de datos **Firestore** activados.
* Haber configurado **Firebase Authentication** para utilizar **Google** como método de autenticación. También se debe haber configurado el proyecto para ser utilizado por el cliente web.
* Obtener y configurar una clave para utilizar la API de **Google Drive**. Para ello, se debe crear un proyecto en **Google Cloud**.
* Obtener y configurar una clave para utilizar la API de **reCAPTCHA v2**.
* Ejecutar el servidor backend de la aplicación utilizando las credenciales descritas anteriormente, así como las credenciales específicas del proyecto correspondiente.

## ¿Cómo ejecutar el proyecto?

### 1. Clonar el repositorio

```bash
git clone https://github.com/Criser2013/ADT-Frontend.git
```

### 2. Instalar las dependencias del proyecto

```bash
npm ci
```

### 3. Configurar las variables de entorno

Establecer los valores de las variables de entorno de acuerdo con los definidos en el archivo `.env.example`.

### 4. Configurar las reglas de seguridad de Firestore

Colocar y publicar las reglas de seguridad de **Firestore** que se encuentran en el archivo `firestore.rules`.

### 5. Ejecutar el proyecto en modo desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en modo desarrollo a través del puerto `5173`.

## Despliegue en producción

La forma más sencilla de desplegar la aplicación es utilizar plataformas como **Vercel** u **OnRender**. Para ello, basta con disponer de un repositorio con el código, configurar las variables de entorno y establecer la configuración necesaria para que `react-router` funcione correctamente.

Otra alternativa consiste en construir una imagen a partir del archivo `Dockerfile`, especificando como parámetro la URL en la que se ejecuta el servidor backend y utilizando el archivo `.env` para proporcionar las variables necesarias durante la compilación del proyecto.

```bash
docker image build --build-arg API_URL=<URL-BACKEND>
```

Una vez finalizado el proceso de construcción, la aplicación estará disponible en el puerto `80` del contenedor.

## Pruebas y aseguramiento de la calidad

El aseguramiento de la calidad y el correcto funcionamiento de la aplicación son prioridades durante su desarrollo. Parte de los esfuerzos se ha dedicado al diseño e implementación de pruebas unitarias utilizando la librería `jest` para validar las funcionalidades de la aplicación.

Actualmente, el porcentaje de cobertura de sentencias es del **96 %**, mientras que la cobertura de ramas es del **84 %**.

Los casos de prueba y los scripts se encuentran en la ruta:

```text
/tests/unitarias/scripts
```

Los informes de ejecución y de cobertura de código se almacenan, respectivamente, en las siguientes carpetas:

```text
/tests/unitarias/resultados
/tests/unitarias/cobertura
```

Para ejecutar las pruebas, se puede utilizar cualquiera de los siguientes comandos:

```bash
npm test                # Ejecuta las pruebas y genera el informe de cobertura.
./ejecutar-tests.sh     # Ejecuta las pruebas y guarda los informes de ejecución y cobertura.
```

### Análisis estático

Para las pruebas estáticas se utiliza la herramienta **ESLint**, con la configuración recomendada para `React` y basada en el estándar **ECMAScript 2024**.

La ejecución manual del análisis estático se realiza mediante el siguiente comando:

```bash
npm run lint
```
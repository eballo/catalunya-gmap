![example workflow](https://github.com/eballo/catalunya-gmap/actions/workflows/build.yml/badge.svg)

# Interactive Map of Catalunya using GoogleMaps
Interactive map of Catalunya using GoogleMaps library.

<img src="https://github.com/eballo/catalunya-gmap/blob/main/screenshot/screenshot-v5.png" alt="screen-shot" align="center" />

## Demo

[Demo](./demo.md)

# Marker cluster Info
http://code.google.com/p/google-maps-utility-library-v3/wiki/Libraries

# Inspiration links
https://www.w3schools.com/howto/howto_js_filter_lists.asp
https://elfsight.com/google-maps-widget/#demo

# How to use this library

1. Add the following files to your html page

```
    <div id="container">
    
        <div id="primaryDiv" class="primaryDiv_big">
            <div id="mapContainer">
                <div id="gMap"></div>
            </div>
        </div>
    
        <div id="secondaryDiv">
            <div id="error">
                <h2>No hi ha cap edificaci&oacute; disponible per aquesta comcarca</h2>
            </div>
            <input type="text" id="search-llista" placeholder="cercar..">
            <div id="llista">
                <ul id="mapLlist"></ul>
            </div>
        </div>
        
    </div>
    ...
    <footer>
        <script type="text/javascript" src="assets/js/catalunya-gmap/jquery-3.2.1.min.js"></script>
        <script type="text/javascript" src="assets/js/catalunya-gmap/bootstrap.min.js"></script>
        <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-path.min.js"></script>
        <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap.min.js"></script>
    </footer>
```

Inside the catalunya-gmap-main we can find the important code :
```
    const monument = new MonumentBuilder('gMap');
    const mapManager = await monument.create()
```

## Versions

[Change log](./changelog.md)

## Development

Since version 5.0 uses [webpack](https://webpack.js.org/).

### Installation

#### Configuration

add a .env file and setup your google api key and the other required env variables. Check the `.env.sample` for 
more information, and create the following files: 
.env (local)
.env.production (production)

```
GOOGLE_MAPS_API_KEY=xxxxxxx
SERVER_HOST='http://localhost:9000/'
DEBUG=true
USER_POSITION=false
```

NOTE: it is important that the server host ends with a '/' like in the sample.

Building the theme requires [node.js](http://nodejs.org/download/). We recommend you update to the latest version of npm: `npm install -g npm@latest`.

From the command line:

1. Navigate to the theme directory, then run `npm install`
3. Build `npm run buildLocal`
4. Start `npm run start`
5. (optional) buildWatch `npm run buildWatch` 

Open your browser [localhost:9000](http://localhost:9000/)

### Available node commands

* `buildLocal` — Compile (local) and optimize the files in your web directory
* `buildProd`  — Compile (production) and optimize the files in your web directory
* `buildWatch` — Compile (local) and optimize the files in your web directory and watch for changes to update the files
* `start`      — Starts  a web server


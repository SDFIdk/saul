# SAUL

This is a collection of stand-alone methods for photogrammetry calculations and API interactions that are primarily used by https://github.com/SDFIdk/skraafoto_frontend

You can use these as building blocks for your own web application that wants to interface with STAC API for Danske Skråfotos.

## Install
```
npm install saul
```

Then create a configuration file or Javascript object with proper the values and make sure to load it into your application before using any of the SAUL utilities.

This package ships with an example configuration file at `/example/config.js.example`

## Use
```
import {getSTAC} from 'saul'

let response = await getSTAC('/some-endpoint')
```

## Final thoughts

We welcome any feedback that might help makes this package more useful to you.

Best regards,
The SAUL team @ SDFI

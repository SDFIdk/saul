# SAUL

This is a collection of stand-alone methods for photogrammetry calculations and API interactions that are primarily used by https://github.com/SDFIdk/skraafoto_frontend

You can use these as building blocks for your own web application that wants to interface with STAC API for Danske Skråfotos.

## Install
Install from [Github](https://github.com/SDFIdk/saul) (latest):
```
npm install --save git@github.com:SDFIdk/saul.git
```

Then create a configuration file or Javascript object with proper values and make sure to load it into your application before using any of the SAUL utilities.

This package ships with an example configuration file at `/example/config.js.example`

## Use

For now, you can see the available utilities by looking into `index.js`.

There is an example of how to import an use those utilities in your Javascript:
```
import {getSTAC} from '@sdfidk/saul'

let response = await getSTAC('/some-stac-endpoint')
```

## Acknowledgements

SAUL is made available under the MIT license by
The Skråfoto Team @ [SDFI](https://sdfi.dk/)

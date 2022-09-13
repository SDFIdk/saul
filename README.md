# SAUL

This is a collection of stand-alone methods for photogrammetry calculations and API interactions that are primarily used by https://github.com/SDFIdk/skraafoto_frontend

You can use these as building blocks for your own web application that wants to interface with STAC API for Danske Skråfotos.

## Installation

1. Install from [Github](https://github.com/SDFIdk/saul) (latest):
```
npm install --save git@github.com:SDFIdk/saul.git
```

2. Create a configuration file or Javascript object with proper values and make sure to load it into your application before using any of the SAUL utilities. This package ships with an example configuration file at `/example/config.js.example`

## How to use

This is an example of how to import and use those utilities in Javascript:
```
import auth from './config.js' // This is the path to your configuration file
import {getSTAC} from 'skraafoto-saul'

let response = await getSTAC('/some-stac-endpoint', auth)
console.log(response)
```

## API docs

To read the docs, first build the documentation with JSDoc:
```
npm run docs
```
A `docs` directory will be created with a bunch of HTML files containing the documentation.

## How to test

From within `node_modules/saul` you can run the `test` command to check that saul core features are still working.
```
npm run test
```

## Acknowledgements

SAUL is made available under the MIT license by
The Skråfoto Team @ [SDFI](https://sdfi.dk/)

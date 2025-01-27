'use strict';

import * as express from 'express';
import * as path from 'path';
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import  { SwaggerUI } from './swagger.ui';
import  { SwaggerRouter } from './swagger.router';
import  { SwaggerParameters } from './swagger.parameters';
import * as logger from 'morgan';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import { OpenApiValidator } from 'express-openapi-validator';

export class ExpressAppConfig {
    private app: express.Application;
    private definitionPath: string;
    private routingOptions;

    constructor(definitionPath: string, routingOptions) {
        this.definitionPath = definitionPath;
        this.routingOptions = routingOptions;
        this.app = express();

        const spec = fs.readFileSync(definitionPath, 'utf8');
        const swaggerDoc = jsyaml.safeLoad(spec);

        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true}));
        this.app.use(bodyParser.text({ limit: '50mb' }));
        this.app.use(bodyParser.json({ limit: '50mb' }));

        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true}));
        this.app.use(cookieParser());

        const swaggerUi = new SwaggerUI(swaggerDoc, undefined);
        this.app.use(swaggerUi.serveStaticContent());
    }

    public addValidator() {
        new OpenApiValidator({
            apiSpec: this.definitionPath,
        })
            .install(this.app)
            .then(() => {
                this.app.use(new SwaggerParameters().checkParameters());
                this.app.use(new SwaggerRouter().initialize(this.routingOptions));

                this.app.use((err, req, res, next) => {
                    // format errors
                    res.status(err.status || 500).json({
                        message: err.message,
                        errors: err.errors,
                    });
                });
            });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
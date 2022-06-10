'use strict';
import { ExpressAppConfig } from "./middleware/express.app.config";
import { Oas3AppOptions } from "./middleware/oas3.options";
import { OpenApiRequestHandler } from 'express-openapi-validator/dist/framework/types'

export function expressAppConfig(
  definitionPath: string,
  appOptions: Oas3AppOptions,
  customMiddlewares?: OpenApiRequestHandler[]
): ExpressAppConfig {
  return new ExpressAppConfig(definitionPath, appOptions, customMiddlewares);
}

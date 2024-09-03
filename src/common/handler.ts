/* eslint-disable @typescript-eslint/no-explicit-any */

import { HandlerError, HandlerResponse } from '@/models/handler.model';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import { logger } from './logger';

export function createHandler<TOUTPUT>(
  // dtoSchema: z.AnyZodObject | z.ZodArray<any>,
  // eslint-disable-next-line no-unused-vars
  handler: ({ event, context }: { event: APIGatewayProxyEventV2; context: Context }) => Promise<HandlerResponse<TOUTPUT>>,
  // handler: ({ dto, context }: { dto: z.infer<any>; context: Context }) => Promise<HandlerResponse<TOUTPUT>>,
): (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyStructuredResultV2> {
  return async (event: APIGatewayProxyEventV2, context: Context): Promise<HandlerResponse<any>> => {
    try {
      // Avoid creating a new mongoDb connection
      context.callbackWaitsForEmptyEventLoop = false;

      // Zod body validation
      // await validate(dtoSchema, event);

      // Handler
      // TODO: setEnv
      // setEnv({
      //   MONGODB_PROD_URL: (Config as SsmEnv).MONGODB_PROD_URL.toString() || '',
      //   BIGQUERY_JSON_CRED: (Config as SsmEnv).BIGQUERY_JSON_CRED.toString() || '',
      //   MONGODB_URL: process.env.MONGODB_URL || '',
      // });
      const response = await handler({ event, context });
      // const response = await handler({ dto: event, context });

      return {
        statusCode: response.statusCode,
        body: response.body,
      };
    } catch (error) {
      logger.error(error);
      if (error instanceof HandlerError) {
        throw {
          statusCode: error.statusCode,
          message: error.message,
          body: error?.error ? error?.error : error,
        } as HandlerResponse<any>;
      }
      throw {
        statusCode: 500,
        message: 'UNKNOWN_ERROR',
        body: error,
      } as HandlerResponse<any>;
    }
  };
}

// TODO: add zod validation
// async function validate(schema: ZodSchema, data: any): Promise<void> {
//   return schema?.safeParseAsync(data).then((result): void => {
//     if (!result?.success) {
//       throw new HandlerError(400, 'VALIDATION_ERROR', result);
//     }
//   });
// }

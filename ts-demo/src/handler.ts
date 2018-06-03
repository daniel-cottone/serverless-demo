import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { DataMapper, ItemNotFoundException } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';
import { User } from './User';

const client: DynamoDB = new DynamoDB({ region: process.env.AWS_REGION });
const mapper: DataMapper = new DataMapper({ client });


// Helper functions
const respond = (statusCode, response?) => ({ statusCode, body: JSON.stringify(response) });
const ok = (response?) => respond(200, response);
const badRequest = (response?) => respond(400, response);
const notFound = (response?) => respond(404, response);
const serverError = (response?) => respond(500, response);

const formatError = (error) => ({ message: error.message, ...error });
const handleError = (error) => (error.name === 'ItemNotFoundException')
  ? notFound(formatError(error))
  : serverError(formatError(error));


// Handlers
export const listUsers: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    const users = [];
    for await (const user of mapper.scan(User)) {
      users.push(user);
    }
    return ok(users);
  } catch (error) {
    return handleError(error);
  }
};

export const getUser: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    const id = event.pathParameters.id;
    const user = await mapper.get(new User({ id }));
    return ok(user);
  } catch (error) {
    return handleError(error);
  }
};

export const createUser: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    const request = JSON.parse(event.body);
    const user = await mapper.put(new User(request));
    return ok(user);
  } catch (error) {
    return handleError(error);
  }
};

export const patchUser: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    const id = event.pathParameters.id;
    const request = JSON.parse(event.body);
    let user = await mapper.get(new User({ id }));
    for (const key in request) {
      user[key] = request[key];
    }
    user = await mapper.update(user);
    return ok(user);
  } catch (error) {
    return handleError(error);
  }
};

export const updateUser: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    const id = event.pathParameters.id;
    const request = JSON.parse(event.body);
    const user = await mapper.put(new User({
      ...request,
      id
    }));
    return ok(user);
  } catch (error) {
    return handleError(error);
  }
};

export const deleteUser: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  try {
    const id = event.pathParameters.id;
    const user = await mapper.delete(new User({ id }));
    return ok();
  } catch (error) {
    return handleError(error);
  }
};

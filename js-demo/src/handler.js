const ddm = require('@aws/dynamodb-data-mapper');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const User = require('./User');

const client = new DynamoDB({ region: process.env.AWS_REGION });
const mapper = new ddm.DataMapper({ client });


// Helper functions
const respond = (cb, statusCode, response) => cb(null, { statusCode, body: JSON.stringify(response) });
const ok = (cb, response) => respond(cb, 200, response);
const badRequest = (cb, response) => respond(cb, 400, response);
const notFound = (cb, response) => respond(cb, 404, response);
const serverError = (cb, response) => respond(cb, 500, response);

const formatError = (error) => ({ message: error.message, ...error });
const handleError = (cb, error) => {
  if (error instanceof ddm.ItemNotFoundException) {
    notFound(cb, formatError(error));
  } else {
    serverError(cb, formatError(error));
  }
}


// Handlers
const listUsers = async (event, context, callback) => {
  try {
    const users = [], iterable = mapper.scan(User);
    let response;
    while (response = await iterable.next()) {
      if (response.done) {
        break;
      } else {
        users.push(response.value);
      }
    }
    ok(callback, users);
  } catch (error) {
    handleError(callback, error);
  }
};

const getUser = async (event, context, callback) => {
  try {
    const id = event.pathParameters.id;
    const user = await mapper.get(new User({ id }));
    ok(callback, user);
  } catch (error) {
    handleError(callback, error);
  }
};

const createUser = async (event, context, callback) => {
  try {
    const request = JSON.parse(event.body);
    const user = await mapper.put(new User(request));
    ok(callback, user);
  } catch (error) {
    handleError(callback, error);
  }
};

const updateUser = async (event, context, callback) => {
  try {
    const id = event.pathParameters.id;
    const request = JSON.parse(event.body);
    const user = await mapper.put(new User({
      ...request,
      id
    }));
    ok(callback, user);
  } catch (error) {
    handleError(callback, error);
  }
};

const patchUser = async (event, context, callback) => {
  try {
    const id = event.pathParameters.id;
    const request = JSON.parse(event.body);
    let user = await mapper.get(new User({ id }));
    for (const key in request) {
      user[key] = request[key];
    }
    user = await mapper.update(user);
    ok(callback, user);
  } catch (error) {
    handleError(callback, error);
  }
};

const deleteUser = async (event, context, callback) => {
  try {
    const id = event.pathParameters.id;
    const user = await mapper.delete(new User({ id }));
    ok(callback);
  } catch (error) {
    handleError(callback, error);
  }
};


// Exports
module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
}

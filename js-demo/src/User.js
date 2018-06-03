const ddm = require('@aws/dynamodb-data-mapper');
const uuid = require('uuid/v4');

class User {
  constructor(obj = {}) {
    Object.assign(this, obj);
  }
}

Object.defineProperties(User.prototype, {
  [ddm.DynamoDbTable]: {
    value: 'users'
  },
  [ddm.DynamoDbSchema]: {
    value: {
      id: {
        type: 'String',
        keyType: 'HASH',
        defaultProvider: uuid
      },
      username: {
        type: 'String'
      },
      email: {
        type: 'String'
      },
    },
  },
});

module.exports = User;

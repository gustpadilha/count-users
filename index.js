const AWS = require('aws-sdk')
const countapi = require('countapi-js')

const dynamo = new AWS.DynamoDB.DocumentClient()

exports.handler = async (event, context) => {
  let body
  let user
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    switch (event.routeKey) {
      case 'GET /users/{id}':
        body = await dynamo
          .get({
            TableName: 'users',
            Key: {
              id: event.pathParameters.id,
            },
          })
          .promise()
        break
      case 'POST /users':
        let requestJSON = JSON.parse(event.body)
        await dynamo
          .put({
            TableName: 'users',
            Item: {
              id: requestJSON.id,
              name: requestJSON.name,
              email: requestJSON.email,
            },
          })
          .promise()
        break
      case 'GET /users/access/{id}':
        user = await dynamo
          .get({
            TableName: 'users',
            Key: {
              id: event.pathParameters.id,
            },
          })
          .promise()
        if (user)
          await countapi
            .get('gustavopadilha.com.br', `user${event.pathParameters.id}`)
            .then((result) => {
              body = result
            })
        break
      case 'PUT /users/{id}':
        user = await dynamo
          .get({
            TableName: 'users',
            Key: {
              id: event.pathParameters.id,
            },
          })
          .promise()
        if (user)
          await countapi
            .hit('gustavopadilha.com.br', `user${event.pathParameters.id}`)
            .then((result) => {
              body = result
            })
        break
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`)
    }
  } catch (err) {
    statusCode = 400
    body = err
  } finally {
    body = JSON.stringify(body)
  }

  return {
    statusCode,
    body,
    headers,
  }
}

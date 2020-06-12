const { ApolloServer } = require('apollo-server-lambda');
const { ApolloGateway } = require('@apollo/gateway');
const { formatError } = require('apollo-errors');

const gateway = new ApolloGateway({
    serviceList: [
        {
            name: 'account-service',
            url: 'http://localhost:3002/dev/graphql',
        },
        {
            name: 'product-service',
            url: 'http://localhost:3004/dev/graphql',
        },
        {
            name: 'review-service',
            url: 'http://localhost:3006/dev/graphql',
        },
        {
            name: 'inventory-service',
            url: 'http://localhost:3008/dev/graphql',
        },
    ],
});

const createHandler = async () => {
    const { schema, executor } = await gateway.load();
    const server = new ApolloServer({
        schema,
        executor,
        formatError,
        introspection: true,
        playground: true,
        context: ({ event, context }) => ({
            headers: event.headers,
            functionName: context.functionName,
            event,
            context,
        }),
    });
    // eslint-disable-next-line no-return-await
    return server.createHandler({
        cors: {
            origin: '*',
            credentials: true,
            methods: 'GET, POST',
            allowedHeaders:
                'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        },
    });
};

// eslint-disable-next-line import/prefer-default-export
exports.graphqlHandler = (event, context, callback) => {
    createHandler().then(handler => handler(event, context, callback));
};

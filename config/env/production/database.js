// module.exports = ({ env }) => ({
//     defaultConnection: 'default',
//     connections: {
//       default: {
//         connector: 'mongoose',
//         settings: {
//           uri: 'mongodb://root:root@150.95.80.181:27017/strapi?authSource=admin&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&directConnection=true&ssl=false',
//           srv: env.bool('DATABASE_SRV', true),
//           port: env.int('DATABASE_PORT', 27017),
//           database: 'strapi',
//         },
//         // options: {
//         //   authenticationDatabase: env('AUTHENTICATION_DATABASE', null),
//         //   ssl: env.bool('DATABASE_SSL', true),
//         // },
//       },
//     },
//   })
const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.user,
        password: config.password,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      options: {
        ssl: true,
      },
    },
  },
});
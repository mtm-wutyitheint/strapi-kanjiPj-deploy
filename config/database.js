const parse = require('pg-connection-string').parse;

module.exports = ({ env }) => {

  if(env('NODE_ENV') === 'production'){
    const config = parse(process.env.DATABASE_URL)
    return {
      defaultConnection : 'default',
      connections: {
        connector: 'bookshelf',
        settings: {
          client: 'postgres',
          host: env('DATABASE_HOST', '127.0.0.1'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          username: env('DATABASE_USERNAME', ''),
          password: env('DATABASE_PASSWORD', ''), 
          ssl: {
            rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
          },  
        },
        options: {
          ssl: env.bool('DATABASE_SSL', false),
        },
      }
    }
  }
  return {
  defaultConnection: 'default',
    connections: {
      default: {
        connector: 'bookshelf',
        settings: {
          client: 'sqlite',
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        },
        options: {
          useNullAsDefault: true,
        },
      },
    },
  }
};

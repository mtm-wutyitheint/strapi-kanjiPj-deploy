module.exports = ({ env }) => ({
  host: '0.0.0.0',
  // port: env.int('NODE_PORT', 1337),
  port: process.env.PORT || env.int('PORT', 1337),
  admin: {
  autoopen: false,
  },
});
 

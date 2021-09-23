module.exports = ({ env }) => ({
  host: '0.0.0.0',
  port: env.int('NODE_PORT', 1337),
admin: {
autoopen: false,
},
});
 

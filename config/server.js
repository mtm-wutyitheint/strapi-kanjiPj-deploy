module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  // port: env.int('PORT', 1337),
  port: process.env.PORT || env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '83e73d4d6f41e41c446b912ee5ed7495'),
    },
  },
});

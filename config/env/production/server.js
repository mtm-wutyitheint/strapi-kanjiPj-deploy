module.exports = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: process.env.PORT
});
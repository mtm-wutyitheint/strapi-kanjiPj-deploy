'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async player_login(ctx) {
    const player = ctx.request.body;
    if (!('name' in player) || !('password' in player)) {
      return ctx.send({ message: 'invalid data' }, 400);
    }
    const isExist = await strapi.services.players.findOne(player);
    if (isExist === null) {
      return ctx.send({status: "fail"}, 400);
    }
    return {
      status: 'success',
      name: isExist.name,
      id: isExist.id
    }
  }
};

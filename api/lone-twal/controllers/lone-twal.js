'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async importgameData(ctx) {
        const words = ctx.request.body;
        let entities = [];
        try {
          await Promise.all(words.map(async (word) => {
            let entity = await strapi.services['lone-twal'].create(word);
            entities.push(entity);
          }));
    
        } catch (err) {
          console.error(err.message);
          return ctx.response.badRequest(err.message);
        }
        return entities;
      },
};

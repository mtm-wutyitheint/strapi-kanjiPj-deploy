"use strict";
// const {importLibraryThatParsesCSV}  = require('{importLibraryThatParsesCSV}');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
var fs = require("fs");
var parse = require("csv-parse");

module.exports = {
  generateUsername(firstname, surname) {
    return `${firstname[0]}-${surname}`.toLowerCase();
  },
  async uploadFile(ctx) {
    let entities = [];
    try {
      var csvData = [];
      fs.createReadStream("C:/Users/WutyiTheint/Downloads/辞書_9000.csv")
        .pipe(parse())
        .on("data", async function (row) {
          const jpDatas = {
            kanji: row[1],
            furigana: row[0],
            meaning: row[2],
            myanmarMeaning: row[3],
          };
          let entity = await strapi.services["words-collection"].create(jpDatas);
          entities.push(entity);
          csvData.push(jpDatas);
        })
        .on("end", function () {
          console.log(csvData);
        });
    } catch (err) {
      console.error(err.message);
      return ctx.response.badRequest(err.message);
    }
    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models["words-collection"] })
    );
  },
};

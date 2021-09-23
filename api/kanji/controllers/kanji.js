'use strict';
const { sanitizeEntity } = require('strapi-utils');
const _ = require('lodash');
const { isNil } = require('lodash');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async importKanji(ctx) {
    const words = ctx.request.body;
    let entities = [];
    try {
      await Promise.all(words.map(async (word) => {
        let isDuplicated = false;
        let messages = 'duplicate words : ';
        if (await strapi.services.kanji.isDuplicated(word.kanji, word.level)) {
          isDuplicated = true;
          messages = messages + `${word.kanji}`;
        }
       let entity = await strapi.services.kanji.create(word);
        entities.push(entity);
      }));

    } catch (err) {
      console.error(err.message);
      return ctx.response.badRequest(err.message);
    }
    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.kanji }));
  },

  async quizSample(ctx) {
    try {
      const { level, mode, kind, start, end, options } = ctx.query;
      const params = {
        level,
        _limit: end
      }
      const quizs = [];
      const entities = await strapi.services.kanji.find(params);
      if (entities.length == 0) {
        return [];
      }
      const meaning_list = _.map(entities, entity => {
        return {
          meaning: entity.meaning,
          ischoose: false,
          isCorrect: false,
          disable: false
        };
      });
      if (mode === 'test' && kind === 'random') {
        return meaning_list;
      }
      const randomMeaning = strapi.services.kanji.getRandom(entities, 30);
      if (isNil(randomMeaning)) {
        return ctx.send({ message: 'Data is null or underfined value' }, 404);
      }
      if (randomMeaning.length == 0) {
        return ctx.send({ message: 'No kanji words found' }, 404);
      }
      await Promise.all(randomMeaning.map(word => {
        let meanings = _.cloneDeep(meaning_list);
        meanings = _.filter(meaning_list, m => m.meaning !== word.meaning);
        let answer_list = strapi.services.kanji.getRandom(meanings, 5)
        answer_list.push({
          meaning: word.meaning,
          ischoose: false,
          isCorrect: false,
          disable: false
        });
        answer_list = strapi.services.kanji.shuffle(answer_list);
        const quiz = {
          kanji: word.kanji,
          correct: word.meaning,
          answer_list
        }
        quizs.push(quiz);
      }))
      return quizs;
    }
    catch (error) {
      console.log('=========== Error in quizAnswerWithMeaning ========');
      console.error(error);
    }
  },

  async quiz(ctx) {
    try {
      let { level, mode, kind, count, chapter, options } = ctx.query;
      let quizs = [];
      const params = {
        level,
        _limit: -1
      }
      const entities = await strapi.services.kanji.find(params);
      if (entities.length == 0) {
        return [];
      }
      if (mode !== 'exam') {
        quizs = strapi.services.kanji.generateQuizByOptions(entities, count, chapter, kind, options);
        return quizs;
      }
      if (mode === 'exam') {
        quizs = strapi.services.kanji.generateQuizByOptions(entities, count, chapter, kind, options);
        return quizs;
      }
      return [];
    } catch (error) {
      console.error('error in quiz api : ', error);
    }
  }

};

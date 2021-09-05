"use strict";
const _ = require("lodash");
const { isNil, mean, memoize } = require("lodash");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const options = {
  answerWithMeaning: "answerWithMeaning",
  answerWithKanji: "answerWithKanji",
  answerWithKunyoumi: "answerWithKunyoumi",
  answerWithOnyoumi: "answerWithOnyoumi",
  answerWithPictures: "answerWithPictures",
};
module.exports = {
  isDuplicated: async (word, level) => {
    return (await strapi.services.kanji.count({ kanji: word, level })) > 0;
  },

  getRandom: (arr, n) => {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  },

  shuffle: (array) => {
    var currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  },

  getKanjiByChapter: (entities, chapter) => {
    let final = [];
    _.forEach(chapter, (c) => {
      const data = _.slice(entities, c.start, c.end);
      final.push(...data);
    });
    return final;
  },

  generateQuizByOptions: async (
    entities,
    count = 20,
    chapter = [{ start: "1", end: "10" }],
    kind,
    options_lst
  ) => {
    try {
      const response = {
        answer_with_meaning: [],
        answer_with_kanji: [],
        answer_with_kunyomi: [],
        answer_with_onyomi: [],
      };
      for (let option of options_lst) {
        switch (option) {
          case options.answerWithMeaning:
            const answerMeaning = await strapi.services.kanji.questionForm(
              entities,
              count,
              chapter,
              kind,
              options.answerWithMeaning
            );
            response.answer_with_meaning = answerMeaning;
            break;
          case options.answerWithKanji:
            const answerKanji = await strapi.services.kanji.questionForm(
              entities,
              count,
              chapter,
              kind,
              options.answerWithKanji
            );
            response.answer_with_kanji = answerKanji;
            break;
          case options.answerWithKunyoumi:
            const answerKunyoumi = await strapi.services.kanji.questionForm(
              entities,
              count,
              chapter,
              kind,
              options.answerWithKunyoumi
            );
            response.answer_with_kunyomi = answerKunyoumi;
            break;
          case options.answerWithOnyoumi:
            const answerOnyoumi = await strapi.services.kanji.questionForm(
              entities,
              count,
              chapter,
              kind,
              options.answerWithOnyoumi
            );
            response.answer_with_onyomi = answerOnyoumi;
            break;
          case options.answerWithPictures:
            // comming soon
            break;
          default:
            break;
        }
      }
      return response;
    } catch (error) {
      console.error("Error in generateQuizByOptions : ", console.error(error));
    }
  },

  questionForm: async (entities, count, chapter, kind, opts) => {
    const response = [];
    let meaning_list = [];
    switch (opts) {
      case options.answerWithMeaning:
        meaning_list = strapi.services.kanji.getMeaningList(
          entities,
          options.answerWithMeaning
        );
        break;
      case options.answerWithKanji:
        meaning_list = strapi.services.kanji.getMeaningList(
          entities,
          options.answerWithKanji
        );
        break;
      case options.answerWithKunyoumi:
        meaning_list = strapi.services.kanji.getMeaningList(
          entities,
          options.answerWithKunyoumi
        );
        break;
      case options.answerWithOnyoumi:
        meaning_list = strapi.services.kanji.getMeaningList(
          entities,
          options.answerWithOnyoumi
        );
        break;
      case options.answerWithPictures:
        // comming soon
        break;
      default:
        break;
    }
    let randomMeaning;
    if (kind === "random") {
      randomMeaning = strapi.services.kanji.getRandom(entities, count);
    } else {
      randomMeaning = strapi.services.kanji.getKanjiByChapter(
        entities,
        chapter
      );
    }
    if (isNil(randomMeaning)) {
      return ctx.send({ message: "Data is null or underfined value" }, 404);
    }
    if (randomMeaning.length == 0) {
      return ctx.send({ message: "No kanji words found" }, 404);
    }
    await Promise.all(
      randomMeaning.map((word) => {
        let meanings = _.cloneDeep(meaning_list);
        meanings = strapi.services.kanji.filterMeaning(
          meaning_list,
          word,
          opts
        );
        let answer_list = strapi.services.kanji.getRandom(meanings, 5);
        answer_list.push(strapi.services.kanji.getAnswerList(word, opts));
        answer_list = strapi.services.kanji.shuffle(answer_list);
        const quiz = strapi.services.kanji.getShuffleQuiz(
          word,
          answer_list,
          opts
        );
        response.push(quiz);
      })
    );
    return response;
  },

  filterMeaning: (meaning_list = [], word, kind) => {
    switch (kind) {
      case options.answerWithMeaning:
        return _.filter(meaning_list, (m) => {
          if (m.meaning !== word.meaning && m.meaning !== "-") {
            return m;
          }
        });
      case options.answerWithKanji:
        return _.filter(meaning_list, (m) => {
          if (m.meaning !== word.kanji && m.meaning !== "-") {
            return m;
          }
        });
      case options.answerWithKunyoumi:
        return _.filter(meaning_list, (m) => {
          if (m.meaning !== word.kunyomi && m.meaning !== "-") {
            return m;
          }
        });
      case options.answerWithOnyoumi:
        return _.filter(meaning_list, (m) => {
          if (m.meaning !== word.onyomi && m.meaning !== "-") {
            return m;
          }
        });
      case options.answerWithPictures:
        break;
      default:
        break;
    }
  },

  getMeaningList: (entities, kind) => {
    let meaning_list = [];
    switch (kind) {
      case options.answerWithMeaning:
        meaning_list = _.map(entities, (entity) => {
          return {
            meaning: entity.meaning,
            ischoose: false,
            isCorrect: false,
            disable: false,
          };
        });
        return meaning_list;
      case options.answerWithKanji:
        meaning_list = _.map(entities, (entity) => {
          return {
            meaning: entity.kanji,
            ischoose: false,
            isCorrect: false,
            disable: false,
          };
        });
        return meaning_list;
      case options.answerWithKunyoumi:
        meaning_list = _.map(entities, (entity) => {
          return {
            meaning: entity.kunyomi,
            ischoose: false,
            isCorrect: false,
            disable: false,
          };
        });
        return meaning_list;
      case options.answerWithOnyoumi:
        meaning_list = _.map(entities, (entity) => {
          return {
            meaning: entity.onyomi,
            ischoose: false,
            isCorrect: false,
            disable: false,
          };
        });
        return meaning_list;
      case options.answerWithPictures:
        break;
      default:
        break;
    }
    return meaning_list;
  },

  getAnswerList: (word, kind) => {
    switch (kind) {
      case options.answerWithMeaning:
        return {
          meaning: word.meaning,
          ischoose: false,
          isCorrect: false,
          disable: false,
        };
      case options.answerWithKanji:
        return {
          meaning: word.kanji,
          ischoose: false,
          isCorrect: false,
          disable: false,
        };
      case options.answerWithKunyoumi:
        return {
          meaning: word.kunyomi,
          ischoose: false,
          isCorrect: false,
          disable: false,
        };
      case options.answerWithOnyoumi:
        return {
          meaning: word.onyomi,
          ischoose: false,
          isCorrect: false,
          disable: false,
        };
      case options.answerWithPictures:
        break;
      default:
        break;
    }
  },

  getShuffleQuiz: (word, answer_list, kind) => {
    switch (kind) {
      case options.answerWithMeaning:
        return {
          head: word.kanji,
          correct: word.meaning,
          answer_list,
        };
      case options.answerWithKanji:
        return {
          head: word.meaning,
          correct: word.kanji,
          answer_list,
        };
      case options.answerWithKunyoumi:
        return {
          head: word.kanji,
          correct: word.kunyomi,
          answer_list,
        };
      case options.answerWithOnyoumi:
        return {
          head: word.kanji,
          correct: word.onyomi,
          answer_list,
        };
      case options.answerWithPictures:
        break;
      default:
        break;
    }
  },
};

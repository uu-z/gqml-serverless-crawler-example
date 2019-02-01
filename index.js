const Apify = require("apify");
const _ = require("lodash");
const cheerio = require("cheerio");
const { gqml } = require("gqml");

// const { log } = Apify.utils;
// log.setLevel(log.LEVELS.WARNING);

gqml
  .yoga({
    typeDefs: `${__dirname}/schema.graphql`,
    resolvers: {
      Query: {
        yjs: async (parent, { start = 1, end = 5 }) => {
          let data = [];
          const requestList = new Apify.RequestList({
            sources: _.range(start, end).map(i => ({
              url: `https://www.yuanjisong.com/job/allcity/page${i}`
            }))
          });
          await requestList.initialize();
          const crawler = new Apify.CheerioCrawler({
            requestList,
            minConcurrency: 10,
            maxConcurrency: 50,
            maxRequestRetries: 1,
            handlePageTimeoutSecs: 60,
            handlePageFunction: async ({ request, html }) => {
              const $ = cheerio.load(html);
              let item = $(".db_adapt")
                .map((i, el) => {
                  return {
                    url: $(el)
                      .find("a.media_desc_content_adapt")
                      .attr("href"),
                    title: $(el)
                      .find(".topic_title")
                      .text(),
                    desc: $(el)
                      .find(".media_desc_adapt")
                      .text(),
                    time: $(el)
                      .find("div.job_list_item_div > div:nth-child(3) > div > p > span:nth-child(3)")
                      .text()
                      .replace(/[^\d]+/g, ""),
                    price: $(el)
                      .find(".job_list_item_div > div:nth-child(4) > div > p > span.rixin-text-jobs")
                      .text()
                      .replace(/[^\d]+/g, ""),
                    status: $(el)
                      .find(".appoint_confirm")
                      .text()
                  };
                })
                .get();
              data = [...data, ...item];
            },
            handleFailedRequestFunction: async ({ request }) => {
              console.log(`Request ${request.url} failed twice.`);
            }
          });
          await crawler.run();
          console.log("Crawler finished.");
          return data;
        }
      }
    }
  })
  .start({
    port: 8001
  });

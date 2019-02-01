import cheerio from "cheerio";
import axios from "axios";

const main = async () => {
  let { data } = await axios.get("https://www.yuanjisong.com/job/allcity/page2");
  let $ = cheerio.load(data);
  $(".db_adapt").map((i, v) => {
    v; //?
  });
};

main();

require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const tokenizer = require("./tokenizer");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function gpt35(messages, temperature, maxToken, fn) {
  return new Promise(async (resolve, reject) => {
    try {
      let total_tokens = 0;
      for (let index in messages) {
        total_tokens += tokenizer(
          `${messages[index].role}:\n ${messages[index].content}`
        );
      }
      console.log(total_tokens);
      console.log(maxToken - total_tokens);
      const completion = await openai.createChatCompletion(
        {
          model: "gpt-3.5-turbo-16k",
          messages: messages,
          max_tokens: maxToken - total_tokens,
          temperature: temperature,
          stream: true,
        },
        { responseType: "stream" }
      );
      let result = "";

      completion.data.on("data", (data) => {
        const lines = data
          ?.toString()
          ?.split("\n")
          .filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            total_tokens += tokenizer(result);
            resolve([result, total_tokens]); // Résoudre la promesse avec le résultat lorsque le flux est terminé
            break;
          }
          if (isJsonString(message)) {
            const parsed = JSON.parse(message);
            if (parsed.choices[0].delta.content) {
              result += parsed.choices[0].delta.content;
              if (fn) {
                fn(result);
              }
              process.stdout.write(parsed.choices[0].delta.content);
            }
          }
        }
      });

      completion.data.on("error", (error) => {
        reject(error); // Rejeter la promesse en cas d'erreur
      });
    } catch (error) {
      console.log("error");
      reject(error)
    }
  });
}

module.exports = gpt35;

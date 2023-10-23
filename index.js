const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const limit = require("express-rate-limit");
const SocketService = require("./Utils/socket");
const { v4: uuidv4 } = require("uuid");
const gpt35 = require("./Utils/gpt");

require("dotenv").config();

const app = express();
const port = 3020;

const server = require("http").Server(app);

app.set("socketService", new SocketService(server));

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(morgan("dev"));
app.use(cors());

app.use(
  limit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // 200 request
    message: {
      toManyRequest: true,
    },
  })
);

app.use(express.static(__dirname + '/dist'));
// Send all other items to index file
app.get('*', (req, res) => res.sendFile(__dirname + '/dist/index.html'));

app.post("/api", async (req, res) => {
  const { messages, chatId } = req.body;

  const [gptResponse, token] = await gpt35([{role: "system", content: `
  Idriss Biyira est un élève dévoué en classe de terminale, reconnu pour son approche amicale, son esprit innovant, et son engagement sincère envers l'amélioration de l'expérience scolaire pour tous les élèves. Énergique et accessible, Idriss se démarque par sa capacité à écouter activement et à inclure les suggestions de tous dans ses initiatives.

Caractéristiques personnelles :

    Positif et enthousiaste, avec un penchant pour l'humour amical.
    Passionné par l'égalité, encourageant la participation de tous.
    Créatif et ouvert aux nouvelles idées, surtout celles qui renforcent la communauté.
    Empathique, toujours prêt à aider et à soutenir ses camarades.

Programme présidentiel :

    Loisirs : Interclasse et interscolaire, soirée de cinéma pour Halloween, soirée de Saint-Valentin, concours de musique, grand bal, et journée de la mode.
    Études : Sessions d'étude en groupe, tutorat par les pairs, et ressources d'apprentissage interactives.
    Collecte de dons : Organiser des événements de collecte de fonds pour soutenir des causes sociales et scolaires.
    Orientation : Journée d'orientation ou forum des métiers pour aider les élèves à planifier leur avenir.
    Culture et Art : Quizz culturel, pièces de théâtre, concours d'éloquence, et divers clubs artistiques et culturels, y compris le club de lecture et de débat, le club de journalisme, et le club d'anglais.

Parrainage :
Idriss promeut un programme de parrainage où les élèves des classes supérieures soutiennent et guident les élèves plus jeunes, favorisant un sentiment de communauté et de soutien mutuel.

Interactions :

    Répond avec enthousiasme et de manière informative aux questions sur son programme.
    Encourage les élèves à partager leurs propres idées et préoccupations, soulignant toujours l'importance de chaque voix.
    Garde un ton positif, même lorsqu'il aborde des sujets plus sérieux.
    S'efforce de motiver et d'inspirer les élèves à s'impliquer et à faire une différence.

Limites :
Le chatbot ne fournit pas de conseils personnels approfondis et redirige les conversations sensibles ou critiques vers les canaux appropriés (par exemple, les conseillers scolaires ou les adultes de confiance).
  `}, ...messages], 1, 4000, (data) => {
    let formattedData = !req.body.isFromMobile
      ? data.replace(/\n/g, "<br />")
      : data;
    req.app.get("socketService").broadcastEmiter(
      {
        chatId: chatId,
        data: formattedData,
      },
      "chatCompletion"
    );
  });

  return res
    .status(200)
    .json({
      success: true,
      messages: [...messages, { role: "assistant", content: gptResponse }],
    });
});

server.listen(port, function () {
  console.debug(`listening on port ${port}`);
});

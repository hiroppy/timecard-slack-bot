import * as functions from "firebase-functions";
import {App, ExpressReceiver} from "@slack/bolt";
import {hello, bye, addMe} from "./tasks";

const config = functions.config();
const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.secret,
  endpoints: "/",
  processBeforeResponse: true,
});
const app = new App({
  receiver: expressReceiver,
  token: config.slack.token,
});

app.command("/timecard", async ({ack, body, command}) => {
  const {user_id: userId, user_name: userName, team_id: teamId} = body;

  async function respond(text: string) {
    await ack({
      response_type: "in_channel",
      text,
    });
  }

  try {
    switch (command.text) {
      case "hello":
        await respond(await hello(userId));
        break;
      case "bye":
        await respond(await bye(userId));
        break;
      case "add me":
        await respond(await addMe({userId, userName, teamId}));
        break;
      case "src":
        await respond("src: https://github.com/hiroppy/timecard-slack-bot");
        break;
      default:
        throw new Error("no command, you can choose hello/bye");
    }
  } catch (e) {
    await respond(e.message);
  }
});

app.error(async (err) => {
  functions.logger.error(err);
});

export const timecard = functions.https.onRequest(expressReceiver.app);

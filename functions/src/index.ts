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

app.command("/timecard", async ({say, ack, body, command}) => {
  const {user_id: userId, user_name: userName, team_id: teamId} = body;

  await ack();

  try {
    switch (command.text) {
      case "hello":
        await say(await hello(userId));
        break;
      case "bye":
        await say(await bye(userId));
        break;
      case "add me":
        await say(await addMe({userId, userName, teamId}));
        break;
      case "src":
        await say("src: https://github.com/hiroppy/timecard-slack-bot");
        break;
      default:
        throw new Error("no command, you can choose hello/bye");
    }
  } catch (e) {
    await say(e.message);
  }
});

app.error(async (err) => {
  functions.logger.error(err);
});

export const timecard = functions.https.onRequest(expressReceiver.app);

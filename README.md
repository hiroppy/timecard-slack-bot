# Record your work time

This is a bot of Slack and exists on firebase.

## Seup

```sh
$ npm i firebase-tools -g
$ git clone git@github.com:hiroppy/timecard-slack-bot.git
$ cd timecard-slack-bot
$ firebase functions:config:set slack.token=xxx
$ firebase functions:config:set slack.secret=yyy
$ mv .runtimeconfig.json.sample .runtimeconfig.json # and modify
$ cd functions && npm i
$ firebase deploy
```

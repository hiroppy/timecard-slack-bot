import * as functions from "firebase-functions";
import {
  UserInfo,
  getUserHistoryKey,
  getUser,
  addUser,
  updateUser,
  addTimecardLog,
  getTimeCardLogs,
} from "./db";
import {generateHash, getCurrentTime, convertUnixTimeToMins} from "./utils";

export async function hello(userId: string) {
  const status = "start";
  const user = await getUser(userId);

  if (!user) {
    return "Please add you first.";
  }

  const {currentStatus, history} = user.data();

  if (currentStatus === status) {
    throw new Error("The current status is \"start\".");
  }

  const hash = generateHash();
  const historyKey = getUserHistoryKey();

  functions.logger.info(history);

  await Promise.all([
    updateUser(user.id, {
      currentStatus: status,
      lastHash: hash,
      ...(!history[historyKey] ?
        {
          [`history.${historyKey}`]: {
            total: 0,
            days: {},
          },
        } :
        {}),
    }),
    addTimecardLog({status, hash, userId: user.id}),
  ]);

  return "hello 🌞";
}

export async function bye(userId: string) {
  const status = "end";
  const user = await getUser(userId);

  if (!user) {
    return "Please add you first.";
  }

  const {currentStatus, lastHash, history} = user.data();

  if (currentStatus === status) {
    throw new Error("The current status is \"end\".");
  }

  await Promise.all([
    updateUser(user.id, {currentStatus: status}),
    addTimecardLog({status, hash: lastHash, userId: user.id}),
  ]);

  let sum = 0;
  const logs = await getTimeCardLogs(user.id, lastHash);

  logs.docs.forEach((log) => {
    const {unixTime} = log.data();

    sum = sum === 0 ? unixTime : Math.abs(sum - unixTime);
  });

  const mins = convertUnixTimeToMins(sum);
  const {day: today} = getCurrentTime();
  const key = getUserHistoryKey();
  const {total, days} = history[key] as UserInfo["history"][0];
  const newMonthTotal = total + mins;

  await updateUser(user.id, {
    [`history.${key}`]: {
      total: newMonthTotal,
      days: {
        ...days,
        [today]: days[today] ? days[today] + mins : mins,
      },
    },
  });

  return `bye 🌝 today: ${mins}mins, month: ${newMonthTotal}mins`;
}

export async function addMe(userInfo: { userId: string; userName: string; teamId: string }) {
  const user = await getUser(userInfo.userId);

  if (!user) {
    // need to set 'end' to avoid validation
    await addUser({...userInfo, lastHash: "", currentStatus: "end", history: {}});

    functions.logger.info(`Added a new user(${userInfo.userName})`);
    return "You've been added.";
  }

  return "You've already exist.";
}

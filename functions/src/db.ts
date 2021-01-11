import * as admin from "firebase-admin";
import {getCurrentTime} from "./utils";

export type Status = "start" | "end";

export type UserInfo = {
  userId: string;
  userName: string;
  teamId: string;
  lastHash: string;
  currentStatus: Status;
  history: {
    [yearMonth: string]: {
      total: number;
      days: {
        [day: number]: number;
      };
    };
  };
};

admin.initializeApp();

const db = admin.firestore();

export function getUserHistoryKey() {
  const {year, month} = getCurrentTime();

  return `${year}_${month}`;
}

export async function getUser(targetedUserId: UserInfo["userId"]) {
  const res = await db.collection("users").get();

  return res.docs.find((info) => {
    const {userId} = info.data();

    return targetedUserId === userId;
  });
}

export async function updateUser(docId: string, userInfo: Partial<UserInfo>) {
  await db
      .collection("users")
      .doc(docId)
      .update({
        ...userInfo,
      // updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
}

export async function addUser(userInfo: UserInfo) {
  return await db.collection("users").add(userInfo);
}

export async function addTimecardLog(data: {
  userId: UserInfo["userId"];
  status: Status;
  hash: string;
}) {
  await db.collection("timecard-logs").add({...data, ...getCurrentTime()});
}

export async function getTimeCardLogs(userId: UserInfo["userId"], hash: string) {
  return await db
      .collection("timecard-logs")
      .where("userId", "==", userId)
      .where("hash", "==", hash)
      .get();
}

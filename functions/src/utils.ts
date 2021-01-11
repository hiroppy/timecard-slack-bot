import {randomBytes} from "crypto";

export function getCurrentTime() {
  // or functions.region
  const date = new Date(new Date().toLocaleString("ja-JP", {timeZone: "Asia/Tokyo"}));
  const unixTime = Date.now();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return {unixTime, year, month, day};
}

export function generateHash() {
  return randomBytes(20).toString("hex");
}

export function convertUnixTimeToMins(unixTime: number) {
  return Math.round(unixTime / 60000);
}

export function convertMinsToHM(num: number) {
  const hours = Math.floor(num / 60);
  const minutes = num % 60;

  return `${hours}:${minutes}`;
}

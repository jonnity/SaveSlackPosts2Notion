export const channels: { [key: string]: ChannelName | "bot_test" } = {
  C0147THE1GT: "want_eat",
  C013SUZ53JT: "want_go",
  CUQNTD6DN: "want_other",
  CUQ9E9W9J: "recommend",
  C012WJRS0JD: "bot_test",
};
export type ChannelId = keyof typeof channels;

export const users = {
  UV28LBM3Q: "かほり",
  UUQP98YE9: "ゆうと",
};
export type UserId = keyof typeof users;

export const databaseIds = {
  want_eat: "2319f0d0cc744a8895d494c846d4c209",
  want_go: "666e14e261e8414ea5aa7d5ad4e6ee03",
  want_other: "571e3ae811004c7394b9616725dea97b",
  recommend: "3cbfbc46bfc94525a1e1618a8ab5c9a5",
  bot_test: "d12872402373422d80f3622fbf5a3d80",
};
type ChannelName = keyof typeof databaseIds;

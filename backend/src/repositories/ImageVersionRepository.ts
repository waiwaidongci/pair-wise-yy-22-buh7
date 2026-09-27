import { dataStore } from "./dataStore";

export const imageVersionRepository = {
  findAll: () => dataStore.imageVersion,
  save: (row: unknown) => {
    dataStore.imageVersion.push(row as never);
    return row;
  }
};

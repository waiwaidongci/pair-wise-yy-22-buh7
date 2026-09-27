import { dataStore } from "./dataStore";

export const restorationStepRepository = {
  findAll: () => dataStore.restorationStep,
  save: (row: unknown) => {
    dataStore.restorationStep.push(row as never);
    return row;
  }
};

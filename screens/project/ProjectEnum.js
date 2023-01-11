import {ISSUE} from '../../data/issue';

export const PROJECT_STATUS = {
  lowRisk: {
    id: 0,
    value: 1,
    name: '低度風險',
  },
  mediumRisk: {
    id: 1,
    value: 2,
    name: '中度風險',
  },
  highRisk: {
    id: 2,
    value: 3,
    name: '高度風險',
  },
};

export const getProjectStatusById = id => {
  if (id == 0) return PROJECT_STATUS.lowRisk;
  if (id == 1) return PROJECT_STATUS.mediumRisk;
  if (id == 2) return PROJECT_STATUS.highRisk;

  return null;
};

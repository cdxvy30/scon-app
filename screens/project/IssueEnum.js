import { ISSUE } from "../../data/issue";

export const ISSUE_STATUS = {
    lowRisk: {
        id: 0,
        value: 1,
        name: '無風險'
    },
    mediumRisk: {
        id: 1,
        value: 2,
        name: '有風險，須改善'
    },
    highRisk: {
        id: 2,
        value: 3,
        name: '有風險，須立即改善'
    }
};

export const getIssueStatusById = (id) => {
    if(id==0)
        return ISSUE_STATUS.lowRisk;
    if(id==1)
        return ISSUE_STATUS.mediumRisk;
    if(id==2)
        return ISSUE_STATUS.highRisk;

    return null;
}
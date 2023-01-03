import SQLite from 'react-native-sqlite-storage';
import {BaseModel, types} from '../lib/react-native-sqlite-orm';
import config from '../configs/sqliteConfig';

export default class IssueLocation extends BaseModel { //entends 繼承父類別
  constructor(obj) {
    super(obj);
  }

  static get database() { //static 不需實例化（var ... = new ...）即可直接被呼叫
    return async () => SQLite.openDatabase({name: `${config.db_name}.db`});
  }

  static get tableName() {
    return 'issue_location';
  }

  static get columnMapping() {
    return {
      id: {type: types.TEXT, primary_key: true},
      location: {type: types.TEXT, not_null: true},
      project_id: {type: types.TEXT, not_null: true},
      created_at: {type: types.INTEGER, default: () => Date.now()},
      updated_at: {type: types.INTEGER, default: () => Date.now()},
    };
  }
}
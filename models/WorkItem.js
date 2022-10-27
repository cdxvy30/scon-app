import SQLite from 'react-native-sqlite-storage';
import {BaseModel, types} from '../lib/react-native-sqlite-orm';
import config from '../configs/sqliteConfig';

export default class WorkItem extends BaseModel { //entends 繼承父類別
  constructor(obj) {
    super(obj);
  }

  static get database() { //static 不需實例化（var ... = new ...）即可直接被呼叫
    return async () => SQLite.openDatabase({name: `${config.db_name}.db`});
  }

  static get tableName() {
    return 'workitem';
  }

  static get columnMapping() {
    return {
      id: {type: types.TEXT, primary_key: true},
      name: {type: types.TEXT, not_null: true},
      manager: {type: types.TEXT, not_null: true},
      project_id: {type: types.TEXT, not_null: true},
      phone_number: {type: types.TEXT, not_null: true},
      company: {type: types.TEXT, not_null: true},
    };
  }
}

import SQLite from 'react-native-sqlite-storage';
import {BaseModel, types} from '../lib/react-native-sqlite-orm';
import config from '../configs/sqliteConfig';

export default class Project extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase({name: `${config.db_name}.db`});
  }

  static get tableName() {
    return 'project';
  }

  static get columnMapping() {
    return {
      id: {type: types.TEXT, primary_key: true},
      name: {type: types.TEXT, not_null: true},
      image: {type: types.TEXT, not_null: true},
      status: {type: types.INTEGER, not_null: true},
      address: {type: types.TEXT, not_null: true},
      company: {type: types.TEXT, not_null: true},
      manager: {type: types.TEXT, not_null: true},
      inspector: {type: types.TEXT, not_null: true},
      email: {type: types.TEXT, not_null: true},
      user_id: {type: types.TEXT, not_null: true},
      created_at: {type: types.INTEGER, default: () => Date.now()},
      updated_at: {type: types.INTEGER, default: () => Date.now()},
    };
  }
}

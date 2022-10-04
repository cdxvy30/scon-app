import SQLite from 'react-native-sqlite-storage';
import {BaseModel, types} from '../lib/react-native-sqlite-orm';
import config from '../configs/sqliteConfig';

SQLite.enablePromise(true);

export default class User extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase({name: `${config.db_name}.db`});
  }

  static get tableName() {
    return 'user';
  }

  static get columnMapping() {
    return {
      id: {type: types.TEXT, primary_key: true},
      username: {type: types.TEXT, unique: true, not_null: true},
      password: {type: types.TEXT, not_null: true},
      created_at: {type: types.INTEGER, default: () => Date.now()},
      updated_at: {type: types.INTEGER, default: () => Date.now()},
    };
  }
}

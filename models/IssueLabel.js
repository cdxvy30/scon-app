import SQLite from 'react-native-sqlite-storage';
import {BaseModel, types} from '../lib/react-native-sqlite-orm';
import config from '../configs/sqliteConfig';

export default class IssueLabel extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase({name: `${config.db_name}.db`});
  }

  static get tableName() {
    return 'issue_label';
  }

  static get columnMapping() {
    return {
      id: {type: types.TEXT, primary_key: true},
      issue_id: {type: types.TEXT, not_null: true},
      max_x: {type: types.INTEGER, not_null: true},
      max_y: {type: types.INTEGER, not_null: true},
      min_x: {type: types.INTEGER, not_null: true},
      min_y: {type: types.INTEGER, not_null: true},
      name: {type: types.TEXT, not_null: true},
      mode: {type: types.TEXT, not_null: true},
      path: {type: types.JSON, not_null: true},
      created_at: {type: types.INTEGER, default: () => Date.now()},
    };
  }
}

import SQLite from 'react-native-sqlite-storage';
import {BaseModel, types} from '../lib/react-native-sqlite-orm';
import config from '../configs/sqliteConfig';

export default class Issue extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return async () => SQLite.openDatabase({name: `${config.db_name}.db`});
  }

  static get tableName() {
    return 'issue';
  }

  static get columnMapping() {
    return {
      id: {type: types.TEXT, primary_key: true},
      image_uri: {type: types.TEXT, not_null: true},
      image_width: {type: types.INTEGER, not_null: true},
      image_height: {type: types.INTEGER, not_null: true},
      tracking: {type: types.BOOLEAN, not_null: true},
      location: {type: types.TEXT, not_null: true},
      responsible_corporation: {type: types.TEXT, not_null: true},
      activity: {type: types.TEXT, not_null: true},                 // What's this? -> 工項
      assignee: {type: types.TEXT, not_null: true},                 // 負責人
      assignee_phone_number: {type: types.TEXT, not_null: true},
      safety_manager: {type: types.TEXT, not_null: true},
      violation_type: {type: types.TEXT, not_null: true},
      type: {type: types.TEXT, not_null: true},
      status: {type: types.INTEGER, not_null: true},
      type_remark: {type: types.TEXT, not_null: false},   // 備註
      project_id: {type: types.TEXT, not_null: true},
      created_at: {type: types.INTEGER, default: () => Date.now()},
      updated_at: {type: types.INTEGER, default: () => Date.now()},
    };
  }
}

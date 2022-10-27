const SYSTEM_CONFIG = {
  db_name: 'inspection-labeling-db-4',
  user_table_name: 'project', // 使用者
  user_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    username: 'TEXT UNIQUE NOT NULL',
    password: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
    updated_at: 'INTEGER NOT NULL',
  },
  project_table_name: 'project', // 專案
  project_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    name: 'TEXT NOT NULL',
    image: 'TEXT NOT NULL',
    status: 'INTEGER NOT NULL',
    address: 'TEXT NOT NULL',
    company_in_charge: 'TEXT NOT NULL',
    project_person_in_charge: 'TEXT NOT NULL',
    record_person_in_charge: 'TEXT NOT NULL',
    email: 'TEXT NOT NULL',
    user_id: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
    updated_at: 'INTEGER NOT NULL',
  },
  issue_table_name: 'issue', // 缺失
  issue_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    image: 'TEXT NOT NULL',
    tracking: 'BOOLEAN NOT NULL',
    location: 'TEXT NOT NULL',
    activity: 'TEXT NOT NULL',
    activity_person_in_charge: 'TEXT NOT NULL',
    assignee_phone_number:'TEXT NOT NULL',
    she_person_in_charge: 'TEXT NOT NULL',
    project_id: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
    updated_at: 'INTEGER NOT NULL',
  },
  issue_category_table_name: 'issue_category', // 防墜網, 腳趾版....
  issue_category_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    category: 'TEXT UNIQUE NOT NULL',
    created_at: 'INTEGER NOT NULL',
    updated_at: 'INTEGER NOT NULL',
  },
  issue_description_table_name: 'issue_description', // 防墜網未確實鋪設, 工人未配戴安全鎖....
  issue_description_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    description: 'TEXT NOT NULL',
    category_id: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
    updated_at: 'INTEGER NOT NULL',
  },
  issue_belong_table_name: 'issue_belong',
  issue_belong_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    issue_id: 'TEXT NOT NULL',
    issue_description_id: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
  },
  issue_improvement_table_name: 'issue_improvement', // 缺失改善
  issue_improvement_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    image: 'TEXT NOT NULL',
    issue_id: 'TEXT NOT NULL',
    remark: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
    updated_at: 'INTEGER NOT NULL',
  },
  issue_label_table_name: 'issue_label', // 圖片標注
  issue_label_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    issue_id: 'TEXT NOT NULL',
    max_x: 'INTEGER NOT NULL',
    max_y: 'INTEGER NOT NULL',
    min_x: 'INTEGER NOT NULL',
    min_y: 'INTEGER NOT NULL',
    created_at: 'INTEGER NOT NULL',
  },
  work_item_table_name: 'workitem', // 工項
  work_item_table_shcema: {
    id: 'TEXT PRIMARY KEY NOT NULL',
    name: 'TEXT NOT NULL',
    manager: 'TEXT NOT NULL',
    phone_number: 'TEXT NOT NULL',
    company: 'TEXT NOT NULL',
    project_id: 'TEXT NOT NULL',
    created_at: 'INTEGER NOT NULL',
    updated_at: 'INTEGER NOT NULL',
  }
};

export default SYSTEM_CONFIG;

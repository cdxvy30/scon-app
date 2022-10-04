// import * as SQLite from 'expo-sqlite';
// import config from '../configs/sqliteConfig';

// const db = SQLite.openDatabase(`${config.db_name}.db`);

// const getTableInfo = () => {
//   const tableKeyList = Object.keys(config).filter(key =>
//     key.includes('table_name'),
//   );
//   const tableNameList = tableKeyList.map(key => config[key]);
//   const tableSchemaList = tableKeyList.map(
//     key => config[key.replace('name', 'schema')],
//   );

//   return {
//     nameList: tableNameList,
//     schemaList: tableSchemaList,
//   };
// };

// export const dbInit = () => {
//   const promise = new Promise((resolve, reject) => {
//     const {nameList, schemaList} = this.getTableInfo();

//     db.transaction(tx => {
//       /* Drop Table */
//       nameList.map(tableName => {
//         tx.executeSql(
//           `DROP TABLE IF EXISTS ${tableName};`,
//           [],
//           (_, result) => {
//             console.log(`[Sqlite] Drop table succeeded. ${tableName}`);
//             resolve(result);
//           },
//           (_, err) => {
//             console.log(`[Sqlite] Drop table failed. ${tableName}`);
//             reject(err);
//             return false;
//           },
//         );
//       });

//       /* Create Table */
//       nameList.map((tableName, index) => {
//         const schema = schemaList[index];
//         const columnNameList = Object.keys(schema);
//         const columnContraintList = columnNameList.map(
//           conlumnName => schema[conlumnName],
//         );

//         let insertQuery = '';
//         columnNameList.map((conlumnName, idx) => {
//           insertQuery.concat(`${conlumnName} ${columnContraintList[idx]}, `);
//         });
//         insertQuery = insertQuery.slice(0, insertQuery.length - 2);

//         tx.executeSql(
//           `CREATE TABLE IF NOT EXISTS ${tableName} (${insertQuery});`,
//           [],
//           (_, result) => {
//             console.log(`[Sqlite] Create table succeeded. ${tableName}`);
//             resolve(result);
//           },
//           (_, err) => {
//             console.log(`[Sqlite] Create table failed. ${tableName}`);
//             reject(err);
//             return false;
//           },
//         );
//       });
//     });
//   });
//   return promise;
// };

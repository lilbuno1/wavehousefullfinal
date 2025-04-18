import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('warehouse.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL
      );`
    );
  });
};

export const getItems = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM items;',
      [],
      (_, { rows: { _array } }) => callback(_array)
    );
  });
};

export const addItem = (name, quantity, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO items (name, quantity) VALUES (?, ?);',
      [name, quantity],
      (_, result) => callback(result)
    );
  });
};

export const deleteItem = (id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM items WHERE id = ?;',
      [id],
      (_, result) => callback(result)
    );
  });
};
import React, { createContext, useState, useEffect } from 'react';
import { getActivityLog } from '../utils/activity';

export const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const [activity, setActivity] = useState([]);

  // Load lúc đầu
  useEffect(() => {
    getActivityLog().then(setActivity);
  }, []);

  // Hàm reload log (khi có hành động mới)
  const reload = async () => {
    const logs = await getActivityLog();
    setActivity(logs);
  };

  return (
    <ActivityContext.Provider value={{ activity, reload }}>
      {children}
    </ActivityContext.Provider>
  );
}
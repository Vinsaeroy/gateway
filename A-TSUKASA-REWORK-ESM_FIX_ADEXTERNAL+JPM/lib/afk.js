import fs from "fs";
import path from "path";

const afkPath = "./database/afk.json";

function loadAfk() {
  if (!fs.existsSync(afkPath)) {
    fs.writeFileSync(afkPath, "{}");
  }
  try {
    return JSON.parse(fs.readFileSync(afkPath, "utf8"));
  } catch (e) {
    return {};
  }
}

function saveAfk(data) {
  fs.writeFileSync(afkPath, JSON.stringify(data, null, 2));
}

export const setAfk = (groupId, userId, reason) => {
  const data = loadAfk();
  
  if (!data[groupId]) {
    data[groupId] = {};
  }
  
  data[groupId][userId] = {
    reason: reason || "AFK",
    time: Date.now()
  };
  
  saveAfk(data);
};

export const removeAfk = (groupId, userId) => {
  const data = loadAfk();
  
  if (data[groupId] && data[groupId][userId]) {
    delete data[groupId][userId];
    
    if (Object.keys(data[groupId]).length === 0) {
      delete data[groupId];
    }
    
    saveAfk(data);
  }
};

export const getAfk = (groupId, userId) => {
  const data = loadAfk();
  
  if (data[groupId] && data[groupId][userId]) {
    return data[groupId][userId];
  }
  
  return null;
};

export const getAfkData = () => loadAfk();

export const getGroupAfk = (groupId) => {
  const data = loadAfk();
  return data[groupId] || {};
};
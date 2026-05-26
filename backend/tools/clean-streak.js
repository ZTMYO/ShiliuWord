const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const { SQLITE_FILE } = require("../config");

function locateSqlJsFile(file) {
  return path.join(__dirname, "..", "node_modules", "sql.js", "dist", file);
}

async function main() {
  const SQL = await initSqlJs({
    locateFile: locateSqlJsFile
  });

  if (!fs.existsSync(SQLITE_FILE)) {
    console.log("数据库文件不存在");
    return;
  }

  const db = new SQL.Database(fs.readFileSync(SQLITE_FILE));
  
  // 检查 users 表结构
  const columns = db.exec("PRAGMA table_info(users);")?.[0]?.values || [];
  const columnNames = columns.map(row => String(row?.[1] || "").trim());
  
  console.log("当前 users 表字段:", columnNames.join(", "));
  
  if (columnNames.includes("streak")) {
    console.log("\n发现旧的 streak 字段，正在删除...");
    
    // 备份数据库
    const backupFile = SQLITE_FILE + ".backup." + Date.now();
    fs.copyFileSync(SQLITE_FILE, backupFile);
    console.log("已创建备份:", backupFile);
    
    // 删除字段
    db.exec("ALTER TABLE users DROP COLUMN streak;");
    
    // 保存
    fs.writeFileSync(SQLITE_FILE, Buffer.from(db.export()));
    console.log("已成功删除 streak 字段");
    
    // 验证
    const newColumns = db.exec("PRAGMA table_info(users);")?.[0]?.values || [];
    const newColumnNames = newColumns.map(row => String(row?.[1] || "").trim());
    console.log("\n清理后字段:", newColumnNames.join(", "));
  } else {
    console.log("\n数据库已干净，没有旧的 streak 字段");
  }
}

main().catch(console.error);

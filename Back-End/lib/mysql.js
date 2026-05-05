import mysql from 'mysql2/promise';

const globalForMySQL = globalThis;

// Ultra-optimized connection pool for cPanel with node-mysql2
export const mysqlPool = globalForMySQL.mysqlPool ?? mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 3306,
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'wemax',
  waitForConnections: true,
  connectionLimit: 1, // SINGLE CONNECTION for cPanel
  queueLimit: 3, // Minimal queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  acquireTimeout: 30000, // 30 second timeout
  // node-mysql2 specific optimizations
  charset: 'utf8mb4',
  timezone: '+00:00',
  multipleStatements: false,
  namedPlaceholders: false,
  // SSL for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

if (process.env.NODE_ENV !== 'production') {
  globalForMySQL.mysqlPool = mysqlPool;
}

// Single connection reuse - get connection and reuse
let singleConnection = null;

const getConnection = async () => {
  if (!singleConnection) {
    singleConnection = await mysqlPool.getConnection();
  }
  return singleConnection;
};

const releaseConnection = () => {
  // Don't release - keep connection alive for reuse
};

// Table name mapping for case-insensitive queries
const tableNameMap = {
  'user': 'User',
  'product': 'Product',
  'package': 'Package',
  'order': 'Order',
  'cart': 'Cart',
  'wishlist': 'Wishlist',
  'review': 'Review',
  'chat': 'Chat',
  'message': 'Message',
  'shippingrate': 'ShippingRate',
  'flashsalesettings': 'FlashSaleSettings',
  'productimage': 'ProductImage',
  'productspec': 'ProductSpec',
  'packageitem': 'PackageItem',
  'packageimage': 'PackageImage',
  'cartproductline': 'CartProductLine',
  'cartpackageline': 'CartPackageLine',
  'orderitem': 'OrderItem',
  'orderpackageline': 'OrderPackageLine',
  'wishlistitem': 'WishlistItem',
  'messageattachment': 'MessageAttachment'
};

// Normalize table names in queries
const normalizeQuery = (query) => {
  let normalizedQuery = query;
  // Replace backtick-wrapped table names
  Object.keys(tableNameMap).forEach(lowerName => {
    const properName = tableNameMap[lowerName];
    // Match lowercase table names wrapped in backticks
    const pattern1 = new RegExp('`' + lowerName + '`', 'gi');
    normalizedQuery = normalizedQuery.replace(pattern1, '`' + properName + '`');
  });
  // Replace table names without backticks (word boundaries)
  Object.keys(tableNameMap).forEach(lowerName => {
    const properName = tableNameMap[lowerName];
    // Use word boundary to match complete table names
    const pattern2 = new RegExp('\\b' + lowerName + '\\b', 'gi');
    normalizedQuery = normalizedQuery.replace(pattern2, properName);
  });
  return normalizedQuery;
};

// Ultra-optimized query execution with node-mysql2
export const executeQuery = async (query, params = []) => {
  const connection = await getConnection();
  // Normalize table names for case sensitivity
  const normalizedQuery = normalizeQuery(query);
  try {
    // Remove console.log in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('Query:', query);
      console.log('Params:', params);
      console.log('Param types:', params.map(p => typeof p));
    }
    
    // Validate parameters before execution
    if (!Array.isArray(params)) {
      throw new Error('Parameters must be an array');
    }
    
    // Use query() instead of execute() to avoid prepared statement issues
    const [rows] = await connection.query(normalizedQuery, params);
    return rows;
  } catch (error) {
    console.error('MySQL error:', error.message);
    console.error('Failed query:', normalizedQuery);
    console.error('Failed params:', params);
    throw error;
  }
};

// Sequential transaction execution (no parallel queries)
export const executeTransaction = async (queries) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    // Execute SEQUENTIALLY, not in parallel
    for (const { query, params } of queries) {
      const normalizedQuery = normalizeQuery(query);
      const [rows] = await connection.query(normalizedQuery, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error.message);
    throw error;
  }
};

// Ultra-optimized batch insert for node-mysql2
export const batchInsert = async (table, columns, values) => {
  const connection = await getConnection();
  try {
    const placeholders = values.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
    const flatValues = values.flat();
    
    const query = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`;
    const [result] = await connection.execute(query, flatValues);
    return result;
  } catch (error) {
    console.error('Batch insert error:', error.message);
    throw error;
  }
};

// Close single connection on app shutdown
export const closeConnection = async () => {
  if (singleConnection) {
    singleConnection.release();
    singleConnection = null;
  }
  await mysqlPool.end();
};

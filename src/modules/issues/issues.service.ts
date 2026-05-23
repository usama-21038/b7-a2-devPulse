import pool from '../../config/db';

interface CreateIssueInput {
  title: string;
  description: string;
  type: string;
  reporterId: number;
}

interface UpdateIssueInput {
  title?: string;
  description?: string;
  type?: string;
}

// Reporter-এর তথ্য আলাদা query করে আনার helper function
const fetchReporter = async (reporterId: number) => {
  const result = await pool.query(
    'SELECT id, name, role FROM users WHERE id = $1',
    [reporterId]
  );
  return result.rows[0] || null;
};

// নতুন issue তৈরি
export const createIssue = async (input: CreateIssueInput) => {
  const { title, description, type, reporterId } = input;

  // Validation
  if (!['bug', 'feature_request'].includes(type)) {
    throw new Error('INVALID_TYPE');
  }
  if (title.length > 150) {
    throw new Error('TITLE_TOO_LONG');
  }
  if (description.length < 20) {
    throw new Error('DESCRIPTION_TOO_SHORT');
  }

  // reporter_id validate - application logic দিয়ে
  const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [reporterId]);
  if (userCheck.rows.length === 0) {
    throw new Error('REPORTER_NOT_FOUND');
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporterId]
  );

  return result.rows[0];
};

// সব issue পাওয়া (filter + sort সহ)
export const getAllIssues = async (
  sort: string = 'newest',
  type?: string,
  status?: string
) => {
  // Dynamic WHERE clause তৈরি করা
  const conditions: string[] = [];
  const values: string[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

  const result = await pool.query(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values
  );

  const issues = result.rows;

  if (issues.length === 0) return [];

  // JOIN ছাড়াই reporter data আনা - batch query ব্যবহার করে
  // সব unique reporter_id নিয়ে একটাই query করা হচ্ছে
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reportersResult = await pool.query(
    'SELECT id, name, role FROM users WHERE id = ANY($1::int[])',
    [reporterIds]
  );

  // reporter গুলোকে map করা দ্রুত lookup-এর জন্য
  const reporterMap: Record<number, { id: number; name: string; role: string }> = {};
  reportersResult.rows.forEach((r) => {
    reporterMap[r.id] = r;
  });

  // issues-এর সাথে reporter মিলানো
  return issues.map((issue) => {
    const { reporter_id, ...rest } = issue;
    return {
      ...rest,
      reporter: reporterMap[reporter_id] || null,
    };
  });
};

// একটি issue পাওয়া
export const getIssueById = async (id: number) => {
  const result = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new Error('ISSUE_NOT_FOUND');
  }

  const issue = result.rows[0];
  const reporter = await fetchReporter(issue.reporter_id);
  const { reporter_id, ...rest } = issue;

  return { ...rest, reporter };
};

// Issue update করা
export const updateIssue = async (
  issueId: number,
  requesterId: number,
  requesterRole: string,
  input: UpdateIssueInput
) => {
  // আগে issue খোঁজা
  const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [issueId]);

  if (issueResult.rows.length === 0) {
    throw new Error('ISSUE_NOT_FOUND');
  }

  const issue = issueResult.rows[0];

  // Permission check:
  // - contributor শুধু নিজের issue update করতে পারবে এবং শুধু 'open' থাকলে
  // - maintainer যেকোনো issue update করতে পারবে
  if (requesterRole === 'contributor') {
    if (issue.reporter_id !== requesterId) {
      throw new Error('FORBIDDEN');
    }
    if (issue.status !== 'open') {
      throw new Error('ISSUE_NOT_OPEN');
    }
  }

  // Validation
  if (input.type && !['bug', 'feature_request'].includes(input.type)) {
    throw new Error('INVALID_TYPE');
  }
  if (input.title && input.title.length > 150) {
    throw new Error('TITLE_TOO_LONG');
  }
  if (input.description && input.description.length < 20) {
    throw new Error('DESCRIPTION_TOO_SHORT');
  }

  // শুধু যে field গুলো পাঠানো হয়েছে সেগুলোই update করা
  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }
  if (input.type !== undefined) {
    updates.push(`type = $${paramIndex++}`);
    values.push(input.type);
  }

  updates.push(`updated_at = NOW()`);
  values.push(issueId);

  const result = await pool.query(
    `UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0];
};

// Issue delete করা (শুধু maintainer)
export const deleteIssue = async (issueId: number) => {
  const result = await pool.query(
    'DELETE FROM issues WHERE id = $1 RETURNING id',
    [issueId]
  );

  if (result.rows.length === 0) {
    throw new Error('ISSUE_NOT_FOUND');
  }
};
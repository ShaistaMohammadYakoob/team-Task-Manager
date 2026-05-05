import assert from 'node:assert/strict';
import { test } from 'node:test';

import { initials, normalizeTags, priorityLabels, statusLabels } from '../src/utils/format.js';
import { cn } from '../src/utils/cn.js';
import { getJobRoleLabel } from '../src/utils/teamRoles.js';
import { isEmail, isEmployeeId, isStrongPassword, validateDueDate } from '../src/utils/validators.js';

test('validators accept valid input and reject invalid input', () => {
  assert.equal(isEmail('dev@example.com'), true);
  assert.equal(isEmail('not-an-email'), false);
  assert.equal(isEmployeeId('EMP-1024'), true);
  assert.equal(isEmployeeId('bad id'), false);
  assert.equal(isStrongPassword('password1'), true);
  assert.equal(isStrongPassword('password'), false);
  assert.equal(validateDueDate('2999-01-01'), true);
  assert.equal(validateDueDate('2000-01-01'), false);
});

test('format helpers normalize display data', () => {
  assert.equal(initials('Grace Hopper'), 'GH');
  assert.equal(initials(''), 'U');
  assert.deepEqual(normalizeTags(' api, frontend, , qa '), ['api', 'frontend', 'qa']);
  assert.equal(statusLabels['in-progress'], 'In Progress');
  assert.equal(priorityLabels.high, 'High');
});

test('shared UI helpers expose expected values', () => {
  assert.equal(cn('btn', false, undefined, 'active'), 'btn active');
  assert.equal(getJobRoleLabel('qa-tester'), 'QA Tester');
  assert.equal(getJobRoleLabel('unknown'), 'Not assigned');
});

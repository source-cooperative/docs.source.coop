// Self-check: node --experimental-strip-types src/policies.check.ts
import assert from 'node:assert';
import {
  DEFAULT_BUCKET,
  DEFAULT_REGION,
  REGIONS,
  REGIONS_BY_AREA,
  bucketFor,
  buildBucketPolicy,
  buildIdentityPolicy,
  isValidPrincipalArn,
  joinPrefix,
  existenceCheckUrl,
} from './policies.ts';

assert.equal(joinPrefix(' org ', 'product'), 'org/product');
assert.equal(joinPrefix('/org/', ''), 'org');
assert.equal(joinPrefix('org', '   '), 'org');

for (const arn of [
  'arn:aws:iam::123456789012:root',
  'arn:aws:iam::123456789012:role/source-coop-upload',
  'arn:aws:iam::123456789012:user/data-uploader',
]) {
  assert.ok(isValidPrincipalArn(arn), arn);
}
for (const bad of ['123456789012', 'arn:aws:s3:::bucket', 'arn:aws:iam::12345:role/x', '']) {
  assert.ok(!isValidPrincipalArn(bad), bad);
}

const identity = buildIdentityPolicy(DEFAULT_BUCKET, 'org/product');
assert.equal(identity.Statement[0].Resource, `arn:aws:s3:::${DEFAULT_BUCKET}/org/product/*`);
assert.ok(identity.Statement[0].Action.includes('s3:AbortMultipartUpload'));
assert.ok(!identity.Statement[0].Action.includes('s3:PutObjectAcl'));
// s3:ListBucketMultipartUploads cannot be scoped to a prefix, so it must never
// appear: it would expose every other provider's in-progress uploads.
const grantsBucketWideMultipart = (policy) =>
  JSON.stringify(policy).includes('ListBucketMultipartUploads');
assert.ok(!grantsBucketWideMultipart(identity));

const bucketPolicy = buildBucketPolicy(DEFAULT_BUCKET, 'org/product', 'arn:aws:iam::123456789012:root');
assert.ok(bucketPolicy.Statement.every((s) => s.Principal.AWS === 'arn:aws:iam::123456789012:root'));
assert.deepEqual(
  bucketPolicy.Statement.map((s) => s.Sid),
  ['Grant-org-product-Write', 'Grant-org-product-List'],
);
assert.equal(
  buildBucketPolicy(DEFAULT_BUCKET, 'org', 'arn:aws:iam::123456789012:root').Statement[0].Sid,
  'Grant-org-Write',
);
assert.ok(!grantsBucketWideMultipart(bucketPolicy));
// Every statement stays scoped: object actions to the prefix ARN, ListBucket by condition.
for (const st of bucketPolicy.Statement) {
  const scoped = st.Resource.endsWith('/org/product/*') || 'Condition' in st;
  assert.ok(scoped, `unscoped statement: ${st.Sid}`);
}

// Every region must appear exactly once, in exactly one area group.
assert.equal(new Set(REGIONS.map((r) => r.region)).size, REGIONS.length);
assert.equal(
  REGIONS_BY_AREA.reduce((n, [, regions]) => n + regions.length, 0),
  REGIONS.length,
);
assert.ok(REGIONS.some((r) => r.region === DEFAULT_REGION));
assert.equal(bucketFor(DEFAULT_REGION), DEFAULT_BUCKET);
assert.equal(bucketFor('eu-west-1'), 'eu-west-1.opendata.source.coop');

assert.equal(
  existenceCheckUrl('org/product'),
  'https://source.coop/api/v1/products/org/product',
);
assert.equal(
  existenceCheckUrl(' org/product/ '),
  'https://source.coop/api/v1/products/org/product',
);
// An account ID on its own is checkable too.
assert.equal(existenceCheckUrl('org'), 'https://source.coop/api/v1/products/org');
assert.equal(existenceCheckUrl(''), null);
assert.equal(existenceCheckUrl('org/product/extra'), null);

console.log('policies.ts: all checks passed');

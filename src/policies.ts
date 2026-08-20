// Policy builders shared by the wizard pages. Pure functions — see policies.check.ts.

// Regional data buckets — keep in sync with docs/about-source/infrastructure.md.
export const REGIONS: {area: string; region: string; location: string}[] = [
  {area: 'Americas', region: 'us-east-1', location: 'US East (N. Virginia)'},
  {area: 'Americas', region: 'us-east-2', location: 'US East (Ohio)'},
  {area: 'Americas', region: 'us-west-1', location: 'US West (N. California)'},
  {area: 'Americas', region: 'us-west-2', location: 'US West (Oregon)'},
  {area: 'Americas', region: 'ca-central-1', location: 'Canada (Central)'},
  {area: 'Americas', region: 'sa-east-1', location: 'South America (São Paulo)'},
  {area: 'Europe', region: 'eu-west-1', location: 'Europe (Ireland)'},
  {area: 'Europe', region: 'eu-west-2', location: 'Europe (London)'},
  {area: 'Europe', region: 'eu-west-3', location: 'Europe (Paris)'},
  {area: 'Europe', region: 'eu-central-1', location: 'Europe (Frankfurt)'},
  {area: 'Europe', region: 'eu-north-1', location: 'Europe (Stockholm)'},
  {area: 'Asia Pacific', region: 'ap-northeast-1', location: 'Asia Pacific (Tokyo)'},
  {area: 'Asia Pacific', region: 'ap-northeast-2', location: 'Asia Pacific (Seoul)'},
  {area: 'Asia Pacific', region: 'ap-northeast-3', location: 'Asia Pacific (Osaka)'},
  {area: 'Asia Pacific', region: 'ap-south-1', location: 'Asia Pacific (Mumbai)'},
  {area: 'Asia Pacific', region: 'ap-southeast-1', location: 'Asia Pacific (Singapore)'},
  {area: 'Asia Pacific', region: 'ap-southeast-2', location: 'Asia Pacific (Sydney)'},
];

export const bucketFor = (region: string): string => `${region}.opendata.source.coop`;

/** Regions grouped by area, for <optgroup>. */
export const REGIONS_BY_AREA: [string, typeof REGIONS][] = [...new Set(REGIONS.map((r) => r.area))].map(
  (area) => [area, REGIONS.filter((r) => r.area === area)],
);

export const DEFAULT_REGION = 'us-west-2';
export const DEFAULT_BUCKET = bucketFor(DEFAULT_REGION);

/** Trim slashes/spaces and collapse the parts into an `a/b` style key prefix. */
export function joinPrefix(...parts: string[]): string {
  return parts
    .map((p) => p.trim().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

// ponytail: enough to catch typos before someone emails us an unusable ARN.
// AWS is the real validator.
const ARN_RE = /^arn:aws:iam::\d{12}:(root|(role|user)\/[\w+=,.@\-/]+)$/;

export function isValidPrincipalArn(arn: string): boolean {
  return ARN_RE.test(arn.trim());
}

// Multipart uploads need only these object-level actions: PutObject covers
// CreateMultipartUpload / UploadPart / CompleteMultipartUpload, and the ARN
// scopes every one of them to the prefix.
//
// s3:ListBucketMultipartUploads is deliberately NOT granted. It is bucket-level
// and AWS does not support the s3:prefix condition key on it, so it cannot be
// scoped — granting it would let one provider enumerate every other provider's
// in-progress uploads in this shared bucket. Nothing in an upload path calls it;
// only `aws s3api list-multipart-uploads` does, and the bucket's lifecycle rules
// already clean up incomplete uploads after 7 days.
const OBJECT_ACTIONS = [
  's3:PutObject',
  's3:GetObject',
  's3:DeleteObject',
  's3:PutObjectAcl',
  's3:AbortMultipartUpload',
  's3:ListMultipartUploadParts',
];

/**
 * Identity policy a data provider attaches to their own IAM role/user, granting
 * read/write under their prefix in the Source Cooperative bucket.
 */
export function buildIdentityPolicy(bucket: string, prefix: string) {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'SourceCoopWritePrefix',
        Effect: 'Allow',
        Action: OBJECT_ACTIONS,
        Resource: `arn:aws:s3:::${bucket}/${prefix}/*`,
      },
      {
        Sid: 'SourceCoopListPrefix',
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: `arn:aws:s3:::${bucket}`,
        Condition: {StringLike: {'s3:prefix': [`${prefix}/*`, prefix]}},
      },
    ],
  };
}

/**
 * Bucket policy statements Source Cooperative adds to grant an external
 * principal (account, role, or user) write access to one prefix.
 */
export function buildBucketPolicy(bucket: string, prefix: string, principalArn: string) {
  const principal = {AWS: principalArn.trim()};
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: sid(prefix, 'Write'),
        Effect: 'Allow',
        Principal: principal,
        Action: OBJECT_ACTIONS,
        Resource: `arn:aws:s3:::${bucket}/${prefix}/*`,
      },
      {
        Sid: sid(prefix, 'List'),
        Effect: 'Allow',
        Principal: principal,
        Action: 's3:ListBucket',
        Resource: `arn:aws:s3:::${bucket}`,
        Condition: {StringLike: {'s3:prefix': [`${prefix}/*`, prefix]}},
      },
    ],
  };
}

/**
 * `Grant-account-product-Write`. Bucket policy Sids allow hyphens (unlike IAM
 * identity policy Sids, which are alphanumeric only), so the prefix stays legible.
 */
function sid(prefix: string, suffix: string): string {
  const slug = prefix.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'prefix';
  return `Grant-${slug}-${suffix}`;
}

/**
 * Source Cooperative API URL that answers 404 iff `prefix` names an account or
 * product that does not exist, or null when the prefix is not checkable.
 *
 * Both routes send `Access-Control-Allow-Origin: *`
 * (source-cooperative/source.coop#490); until that ships the fetch fails and
 * callers stay silent rather than warn.
 */
export function existenceCheckUrl(prefix: string): string | null {
  const parts = joinPrefix(prefix).split('/');
  if (parts.length > 2 || parts.some((p) => !p)) return null;
  return `https://source.coop/api/v1/products/${parts.join('/')}`;
}

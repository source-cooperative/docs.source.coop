import React, {useState} from 'react';
import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import {useExistenceCheck} from '@site/src/useExistenceCheck';
import {
  DEFAULT_REGION,
  REGIONS_BY_AREA,
  bucketFor,
  buildIdentityPolicy,
  joinPrefix,
} from '@site/src/policies';

export default function IamPolicyWizard(): ReactNode {
  const [accountId, setAccountId] = useState('');
  const [productId, setProductId] = useState('');
  const [region, setRegion] = useState(DEFAULT_REGION);

  const prefix = joinPrefix(accountId, productId);
  const policy = prefix ? buildIdentityPolicy(bucketFor(region), prefix) : null;
  const check = useExistenceCheck(prefix);

  return (
    <Layout
      title="IAM Policy Wizard"
      description="Generate the IAM policy your AWS role or user needs to upload to Source Cooperative.">
      <main className="container margin-vert--lg">
        <h1>IAM policy wizard</h1>
        <p>
          Generate the policy to attach to the IAM role or user in <strong>your own</strong> AWS
          account, so it can upload to your prefix in the Source Cooperative bucket. See{' '}
          <a href="/data-upload">Upload Your Data</a> for the full walkthrough.
        </p>

        <div className="margin-bottom--lg" style={{display: 'grid', gap: '1rem', maxWidth: 480}}>
          <label>
            Source Cooperative account ID <span aria-hidden="true">*</span>
            <input
              className="margin-top--xs"
              style={{width: '100%'}}
              required
              placeholder="your-org"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </label>
          <label>
            Product ID <em>(optional)</em>
            <input
              className="margin-top--xs"
              style={{width: '100%'}}
              placeholder="your-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <small>Leave blank to grant access to every product under the account.</small>
          </label>
          <label>
            Bucket region
            <select
              className="margin-top--xs"
              style={{width: '100%'}}
              value={region}
              onChange={(e) => setRegion(e.target.value)}>
              {REGIONS_BY_AREA.map(([area, regions]) => (
                <optgroup key={area} label={area}>
                  {regions.map((r) => (
                    <option key={r.region} value={r.region}>
                      {r.location} — {bucketFor(r.region)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        {check === 'missing' && (
          <div className="alert alert--warning margin-bottom--md" role="status">
            <code>{prefix}</code> was not found on Source Cooperative. Double-check the IDs —
            though this is expected if you have not created it yet. The policy below is generated
            either way.
          </div>
        )}
        {policy ? (
          <>
            <p>
              Attach this policy to your role or user. It grants read/write (including multipart
              uploads) under <code>{prefix}/</code>.
            </p>
            <CodeBlock
              language="json"
              title="source-coop-upload-policy.json"
              children={JSON.stringify(policy, null, 2)}
            />
            <div className="alert alert--secondary margin-top--md" role="note">
              This only grants permission on your side. Uploads will fail with{' '}
              <code>AccessDenied</code> until Source Cooperative grants your ARN access on the
              bucket. Email <a href="mailto:hello@source.coop">hello@source.coop</a> with the ARN of
              the role or user and the prefix <code>{prefix}/</code>.
            </div>
          </>
        ) : (
          <p>
            <em>Enter an account ID to generate the policy.</em>
          </p>
        )}
      </main>
    </Layout>
  );
}

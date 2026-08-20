import React, {useState} from 'react';
import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import {useExistenceCheck} from '@site/src/useExistenceCheck';
import {
  DEFAULT_REGION,
  REGIONS_BY_AREA,
  bucketFor,
  buildBucketPolicy,
  isValidPrincipalArn,
  joinPrefix,
} from '@site/src/policies';

export default function BucketPolicyWizard(): ReactNode {
  const [principalArn, setPrincipalArn] = useState('');
  const [prefixInput, setPrefixInput] = useState('');
  const [region, setRegion] = useState(DEFAULT_REGION);

  const prefix = joinPrefix(prefixInput);
  const arn = principalArn.trim();
  const arnLooksValid = isValidPrincipalArn(arn);
  const policy = arn && prefix ? buildBucketPolicy(bucketFor(region), prefix, arn) : null;
  const check = useExistenceCheck(prefix);

  return (
    <Layout
      title="Bucket Policy Wizard (internal)"
      description="Generate the bucket policy statements granting an external AWS principal write access to a prefix.">
      <main className="container margin-vert--lg">
        <h1>Bucket policy wizard</h1>
        <div className="alert alert--warning" role="note">
          <strong>Internal tool.</strong> Generates the bucket policy statements that grant an
          external AWS principal write access to one prefix. Merge these into the bucket policy —
          do not replace it.
        </div>

        <div
          className="margin-vert--lg"
          style={{display: 'grid', gap: '1rem', maxWidth: 560}}>
          <label>
            Principal ARN <span aria-hidden="true">*</span>
            <input
              className="margin-top--xs"
              style={{width: '100%'}}
              required
              placeholder="arn:aws:iam::123456789012:role/source-coop-upload"
              value={principalArn}
              onChange={(e) => setPrincipalArn(e.target.value)}
            />
            <small>
              Account (<code>:root</code>), role, or user ARN, as provided by the data provider.
            </small>
          </label>
          <label>
            Prefix <span aria-hidden="true">*</span>
            <input
              className="margin-top--xs"
              style={{width: '100%'}}
              required
              placeholder="account-id/product-id"
              value={prefixInput}
              onChange={(e) => setPrefixInput(e.target.value)}
            />
            <small>Account ID alone covers every product under that account.</small>
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

        {arn && !arnLooksValid && (
          <div className="alert alert--danger margin-bottom--md" role="alert">
            That does not look like an IAM principal ARN. Expected{' '}
            <code>arn:aws:iam::123456789012:root</code>,{' '}
            <code>arn:aws:iam::123456789012:role/NAME</code>, or{' '}
            <code>arn:aws:iam::123456789012:user/NAME</code>.
          </div>
        )}

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
              Grants <code>{arn}</code> read/write (including multipart uploads) under{' '}
              <code>{prefix}/</code>.
            </p>
            <CodeBlock language="json" children={JSON.stringify(policy, null, 2)} />
          </>
        ) : (
          <p>
            <em>Enter a principal ARN and a prefix to generate the statements.</em>
          </p>
        )}
      </main>
    </Layout>
  );
}

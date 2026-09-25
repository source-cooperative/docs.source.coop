---
title: Automated Access
id: automated-access
slug: /automated-access
---

Some software reaches Source Cooperative with nobody at the keyboard: a nightly
sync, a publishing pipeline, an instrument that uploads its readings. Give it a
**service account** and an **API key**. The AWS CLI and SDKs exchange the key
for short-lived credentials at the [data proxy](/data-proxy) and renew them on
their own, so nothing else has to run on the machine.

## What a service account is

A service account is a login for software. It belongs to one account, yours or
an organization's, and whoever manages that account manages it.

- **It has its own access.** You grant it products one at a time, to read or to
  read and write. It can reach only products its owner owns, and it never
  inherits your access or anyone else's.
- **There's no person behind it.** It has no profile, can't sign in to the
  website, and can't create products or manage people.
- **You can stop it without touching a person.** Revoke its keys, or disable or
  delete it, and nobody's own account changes.

An organization can own service accounts, so a pipeline doesn't depend on the
account of whoever set it up.

A service account's ID is its owner's ID, two hyphens, and a name of its own,
such as `your-org--nightly-sync`. It can't be changed.

## Create a service account

1. Open the profile page of the account that will own it, yours or an
   organization's, click the gear icon, and choose **Service Accounts**.
2. Click **New service account**.
3. Under **Who it is**, enter a **Name**, such as `Nightly Sync`. The **Account
   ID** is made from the name; click **Edit** beside it to choose another.
4. Leave **How software signs in** empty. It is for GitHub Actions, which
   [isn't available yet](#github-actions).
5. Under **What it can reach**, click **Grant a product**, choose a product and
   **Read** or **Read and write**, and click the check mark. Repeat for each
   product the job needs, and no more: a job that only downloads needs **Read**.
6. Click **Create service account**.

You land on the service account's page. You can change what it reaches at any
time under **Can reach**; each change is saved as you make it.

## API keys

An API key lets software on your own server, VM, cluster or instrument sign in
as the service account.

### Issue a key

1. On the service account's page, under **API keys**, click **Issue an API
   key**.
2. Enter a **Label** that says where the key will live, such as `HPC cron job`,
   so you know which key to revoke later.
3. Choose when it **Expires**: in 30 days, 90 days or a year, or never (until
   you revoke it).
4. Click **Issue key**.

The key is shown once. Copy it now: Source stores only a hash of it, so nobody
can show it to you again. If you lose it, issue another and revoke the lost one.
A key starts with `sck_`.

You can't issue a key to a disabled service account.

### Set up the machine

Save the key in a file that only the job's user can read. A trailing newline is
fine.

```bash
mkdir -p -m 700 ~/.source-coop
cat > ~/.source-coop/nightly-sync.key   # paste the key, press Enter, then Ctrl-D
chmod 600 ~/.source-coop/nightly-sync.key
```

Then set five environment variables wherever the job runs. The dialog that
showed you the key lists them too, filled in for your service account apart from
the key file's path:

```bash
export AWS_ROLE_ARN=arn:aws:iam::your-org--nightly-sync:role/FullAccess
export AWS_WEB_IDENTITY_TOKEN_FILE=$HOME/.source-coop/nightly-sync.key
export AWS_ENDPOINT_URL_STS=https://data.source.coop/.sts
export AWS_ENDPOINT_URL_S3=https://data.source.coop
export AWS_REGION=us-west-2
```

| Variable | What it's for |
| --- | --- |
| `AWS_ROLE_ARN` | How much the credentials may do. `FullAccess` is everything the service account may do; `ReadOnly` is reads only. The value has the shape AWS tools expect, with the service account's ID where an AWS account number would be. |
| `AWS_WEB_IDENTITY_TOKEN_FILE` | The file that holds the key, as an absolute path. |
| `AWS_ENDPOINT_URL_STS` | Where to exchange the key for credentials: the data proxy. |
| `AWS_ENDPOINT_URL_S3` | Where to send S3 requests: the data proxy. |
| `AWS_REGION` | Required by S3 clients. It doesn't say where your data is stored. |

That's all. The AWS CLI and SDKs read the key from the file, exchange it at the
data proxy for credentials that last an hour, and exchange it again before those
run out. Nothing else runs on the machine, and the key file never changes.

The two endpoint variables need **AWS CLI 2.13** or later, or **boto3 1.28**
(**botocore 1.31**) or later. Older releases ignore them and send the key to AWS
instead, which refuses it.

With the AWS CLI:

```bash
aws --version   # aws-cli/2.13.0 or later
aws s3 ls s3://your-org/your-product/
aws s3 sync ./outgoing s3://your-org/your-product/outgoing/
```

With boto3:

```python
import boto3  # boto3 1.28 (botocore 1.31) or later

# No keys, endpoint or region here: boto3 reads the five variables.
s3 = boto3.client("s3")
s3.upload_file("mydata.csv", "your-org", "your-product/mydata.csv")
```

Other AWS SDKs work the same way, provided their web identity credential
provider reads `AWS_ENDPOINT_URL_STS`.

A cron job or a system service doesn't read your shell's profile, so set the
variables in its own environment.

### If the key is refused

A key that has been revoked or has expired, a key whose service account is
disabled, and a value that isn't a Source Cooperative key at all are all refused
with the same error:

```text
An error occurred (InvalidIdentityToken) when calling the AssumeRoleWithWebIdentity operation: API key was not accepted (request id 8f3a1c2b9d4e5f60-SEA)
```

The service account's page shows whether it is disabled, and each key's row
shows whether the key has been revoked or has expired. If none of those explains
it, email [hello@source.coop](mailto:hello@source.coop) and quote the request
id: it lets us find the reason in our logs.

### Keep the key secret

- Treat the key as a password for the service account. Keep it out of source
  control, scripts and command lines, and give it to the job as a file.
- `aws --debug` prints the key, because it logs the request that carries it.
  Don't share debug output from a machine that has a key set up.
- A key goes in a file or in the body of a request, never in a URL, because URLs
  end up in logs. The data proxy refuses a key sent in a URL, with
  `API key must be sent in the request body, not the URL`. If that ever happens,
  replace the key.

### Rotate a key, or change when it expires

A service account can have several keys at once, so you can replace one without
stopping the job: issue a new key, deploy it, and revoke the old one once
nothing uses it. Each key's row shows when it was last used.

To change when a key expires, click **Change expiry** on its row: later, for a
job that runs longer than planned, or sooner, during an incident. The new expiry
counts from today.

## Tools that keep their first credentials

The AWS CLI and SDKs renew credentials on their own. Tools that manage
credentials themselves often don't: given a fixed set of credentials
(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN`, or the
same values in their own settings), they read it once and use it until they
exit. GDAL's `/vsis3/`, DuckDB and rclone are common examples; DuckDB reads a
secret's credentials when you run `CREATE SECRET`.

Credentials from the data proxy last an hour, so with these tools a transfer
that runs longer than that fails partway through with an `ExpiredToken` (HTTP
403) error, although the key is still good. To avoid it:

- Split long transfers into runs that each finish within the hour, and give
  each run fresh credentials: start a new process, or in DuckDB, replace the
  secret (`CREATE OR REPLACE SECRET`) before each batch.
- Do large copies with the AWS CLI (`aws s3 cp`, `aws s3 sync`) or an AWS SDK,
  which renew credentials mid-transfer.
- Where a tool can run a credential helper each time its credentials run out,
  use one. GDAL can; see the next section.

## GDAL

GDAL's `/vsis3/` can't use an API key directly. Given `AWS_ROLE_ARN` and
`AWS_WEB_IDENTITY_TOKEN_FILE` and no other credentials, GDAL 3.6 and later do
the exchange themselves, in a way that can't work for a key:

- They don't read `AWS_ENDPOINT_URL_STS`, so they send the key to AWS, not to
  the data proxy.
- They put the key in the URL of the request. The data proxy refuses a key in a
  URL, and a key sent to AWS in a URL should be treated as exposed.

So where GDAL runs with the five variables set, also set
`CPL_AWS_WEB_IDENTITY_ENABLE=NO` to stop it trying. If GDAL has already run with
them, replace the key.

:::info Coming soon

The Source CLI will be able to exchange an API key without a browser
([source-coop-cli#17](https://github.com/source-cooperative/source-coop-cli/issues/17)).
GDAL 3.12 and later can then get credentials from it as a `credential_process`,
and renew them the same way. This page will show the setup once that release is
out.

:::

## Revoke a key, or stop a service account

| To | Do this | What happens |
| --- | --- | --- |
| Stop one key | Click **Revoke** on the key's row. | New exchanges with the key are refused within about a minute. |
| Stop everything the service account does | Click **Disable** under **Danger zone**. | New exchanges with any of its keys are refused within about a minute. Writes stop within about a minute, and reads of restricted products within about five minutes. |

Revoking a key doesn't recall credentials already issued with it: they keep
working until they expire, an hour after they were issued, or up to 12 hours if
the client asked for longer. Disabling the service account cuts those off too,
which makes it the emergency stop for a leaked key. Public products stay
readable by anyone, as always.

Disabling keeps the service account's keys and grants. Enabling it again makes
every key that hasn't been revoked or expired work again, so revoke a leaked key
before you enable the account.

### Revoke a key you found

Anyone who holds a key can revoke it, without an account. If you come across one
that has leaked, in a repository, a log or a message, send it in the body of
this request:

```bash
curl -X POST https://source.coop/api/v1/service-account-keys/revocations \
  -H 'content-type: application/json' \
  -d '{"key":"sck_…"}'
```

For a well-formed key the answer is always `204 No Content`, whether the key was
live, already revoked or unknown. A live key is revoked, and new exchanges with
it stop within about a minute. Send the key in the body, never in the URL.

We plan to revoke keys pushed to public GitHub repositories automatically,
through GitHub's secret scanning.

## GitHub Actions

:::info Coming soon

A service account can also trust a GitHub Actions workflow, which then signs in
with a token GitHub issues for each run, with no key to store. The service
account page already lets you add a workflow, but the data proxy doesn't accept
those sign-ins yet
([data.source.coop#222](https://github.com/source-cooperative/data.source.coop/issues/222),
[data.source.coop#223](https://github.com/source-cooperative/data.source.coop/issues/223)).
Until it does, a workflow can use an API key like any other machine: keep the
key in a GitHub Actions secret, write it to a file at the start of the job, and
set the variables above.

:::

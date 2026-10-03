---
title: Automated Access
sidebar_label: With a Service Account
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
an organization's. Only the owner of a personal account, or an owner or
maintainer of an organization, can create or edit its service accounts. Other
organization members can't.

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

You need to be the account's owner or, for an organization, one of its owners or
maintainers.

1. Open the profile page of the account that will own it, yours or an
   organization's, click the gear icon, and choose **Service Accounts**.
2. Click **New service account**.
3. Under **Who it is**, enter a **Name**, such as `Nightly Sync`. The **Account
   ID** is made from the name; click **Edit** beside it to choose another.
4. Under **How software signs in**, click **Add a GitHub workflow** to trust a
   [GitHub Actions workflow](#github-actions), or **Add an API key** to issue
   [a key](#issue-a-key) for anything else. Both are optional here: you can add
   either later.
5. Under **What it can reach**, click **Grant a product**, choose a product and
   **Read** or **Read and write**, and click the check mark. Repeat for each
   product the job needs, and no more: a job that only downloads needs **Read**.
6. Click **Create service account**.

You land on the service account's page, showing the key if you added one. You
can change what it reaches at any time under **Can reach**; each change is saved
as you make it.

## API keys

An API key lets software on your own server, VM, cluster or instrument sign in
as the service account.

### Issue a key

1. On the service account's page, under **Signs in with**, click **Add
   sign-in** and choose **API key**.
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
mkdir -p ~/.source-coop && chmod 700 ~/.source-coop
(umask 077; cat > ~/.source-coop/nightly-sync.key)   # paste the key, press Enter, then Ctrl-D
```

Then set five environment variables wherever the job runs. The key's row on the
service account's page lists them too, under **Example usage** in its menu,
filled in for your service account apart from the key file's path:

```bash
export AWS_DEFAULT_REGION=us-west-2
export AWS_ENDPOINT_URL_S3=https://data.source.coop
export AWS_ENDPOINT_URL_STS=https://data.source.coop/.sts
export AWS_ROLE_ARN=arn:aws:iam::your-org--nightly-sync:role/FullAccess
export AWS_WEB_IDENTITY_TOKEN_FILE=/home/your-user/.source-coop/nightly-sync.key
```

| Variable | What it's for |
| --- | --- |
| `AWS_DEFAULT_REGION` | Unused by the data proxy, which accepts any region, but set it anyway: many SDKs won't sign requests without one. It doesn't say where your data is stored. The AWS CLI, boto3 and the Go SDK read it; the JavaScript and Java SDKs read `AWS_REGION` instead, so for those set that too. |
| `AWS_ENDPOINT_URL_S3` | Where to send S3 requests: the data proxy. |
| `AWS_ENDPOINT_URL_STS` | Where to exchange the key for credentials: the data proxy. |
| `AWS_ROLE_ARN` | How much the credentials may do. `FullAccess` is everything the service account may do; `ReadOnly` is reads only. The value has the shape AWS tools expect, with the service account's ID where an AWS account number would be. |
| `AWS_WEB_IDENTITY_TOKEN_FILE` | The file that holds the key, as an absolute path. Write it out in full: cron and systemd don't expand `$HOME` or `~`. |

For a job that only reads, end `AWS_ROLE_ARN` in `role/ReadOnly` instead of
`role/FullAccess`. Its credentials can't write, even to products the service
account may write to. Any other role name is refused.

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

A key that has been revoked or has expired, and a key whose service account is
disabled, are refused with the same error:

```text
An error occurred (InvalidIdentityToken) when calling the AssumeRoleWithWebIdentity operation: API key was not accepted (request id 8f3a1c2b9d4e5f60-SEA)
```

The service account's page shows whether it is disabled, and each key's row
shows whether the key has been revoked or has expired. If none of those explains
it, email [hello@source.coop](mailto:hello@source.coop) and quote the request
id: it lets us find the reason in our logs.

A key's last six characters are a checksum of the rest, so a key that was cut
short or mistyped when it was copied is refused before anything is looked up,
with an error of its own:

```text
An error occurred (InvalidIdentityToken) when calling the AssumeRoleWithWebIdentity operation: API key is malformed; check that it was copied whole (request id 8f3a1c2b9d4e5f60-SEA)
```

Copy the key again from where you saved it. If you no longer have all of it,
issue a new key and revoke the old one. The Source CLI checks a key file the
same way before it sends the key.

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

To change when a key expires, choose **Change expiry** from its row's menu: later, for a
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
| Stop one key | Choose **Revoke** from the key's menu. | New exchanges with the key are refused within about a minute. |
| Stop one workflow | Choose **Remove** from the workflow's menu. | New sign-ins from the workflow are refused within about a minute. |
| Stop everything the service account does | Click **Disable** under **Danger zone**. | New exchanges with any of its keys, and new sign-ins from its workflows, are refused within about a minute. Writes stop within about a minute, and reads of restricted products within about five minutes. |

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
that has leaked, in a repository, a log or a message, save it in a file and
send it in the body of this request, so it stays out of your shell history and
process list:

```bash
cat > found.key   # paste the key, press Enter, then Ctrl-D
printf '{"key":"%s"}' "$(tr -d '\n' < found.key)" |
  curl -X POST https://source.coop/api/v1/service-account-keys/revocations \
    -H 'content-type: application/json' \
    --data-binary @-
rm found.key
```

For a well-formed key the answer is always `204 No Content`, whether the key was
live, already revoked or unknown. A live key is revoked, and new exchanges with
it stop within about a minute. Send the key in the body, never in the URL.

We plan to revoke keys pushed to public GitHub repositories automatically,
through GitHub's secret scanning.

## GitHub Actions

A service account can trust a GitHub Actions workflow, which then signs in with
a token GitHub issues for each run. There is no key to store, rotate or leak.

### Trust a workflow

1. On the service account's page, under **Signs in with**, click **Add
   sign-in** and choose **GitHub workflow**.
2. Enter the **Repository**, such as `your-org/pipelines`.
3. Under **Pinned to**, choose **Ref** and enter the full ref the workflow runs
   on, such as `refs/heads/main` or `refs/tags/v1.0`; or choose **Environment**
   and enter the name of the GitHub environment the job runs in.
4. Click **Trust it**.

The dialog shows the exact subject it trusts, such as
`repo:your-org/pipelines:ref:refs/heads/main`. A run's token has to carry that
subject exactly, so:

- A job that names an `environment:` carries the environment's subject, not
  the branch's. Pin such a job to its environment.
- Runs for pull requests carry a subject that can't be trusted, so a job
  triggered by `pull_request` can't sign in.
- Repositories created after July 2026 carry their owner's and their own
  numeric IDs, as in `your-org@123/pipelines@456`. The dialog offers that form
  when GitHub shows the repository publicly; for a private one, it prints a `gh`
  command that finds it.

A repository is trusted only for the ref or environment you name. To trust
another branch, add another workflow.

### Sign in from the job

Choose **Example usage** from the workflow's menu on the service account's page
for the step to add, filled in for your service account. It looks like this:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # lets the job ask GitHub for its token
      contents: read
    env:
      AWS_ENDPOINT_URL_S3: https://data.source.coop
    steps:
      - name: Sign in to Source Cooperative as your-org--nightly-sync
        uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::your-org--nightly-sync:role/FullAccess
          audience: https://data.source.coop
          sts-endpoint: https://data.source.coop/.sts
          aws-region: us-west-2
      - run: aws s3 sync ./outgoing s3://your-org/your-product/outgoing/
```

Unlike with an API key, the ID in `role-to-assume` matters: it names the service
account the job signs in as, and the sign-in succeeds only if that service
account trusts the workflow. End it in `role/ReadOnly` for a job that only
reads.

The step's credentials last an hour, and nothing renews them during the job. For
a longer job, add `role-duration-seconds` to the step, up to `43200` (12 hours).

A refused sign-in fails the step with:

```text
AccessDenied: Not authorized to perform sts:AssumeRoleWithWebIdentity (request id 8f3a1c2b9d4e5f60-SEA)
```

The same error covers a workflow the service account doesn't trust (check the
subject, as above), a disabled service account, and an ID in `role-to-assume`
that isn't a service account. If none of those explains it, email
[hello@source.coop](mailto:hello@source.coop) and quote the request id.

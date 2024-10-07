---
tags:
  - programming
  - golang
date: 2024-10-07
---

Every application needs to emit some event related message to inform the operators of the health and status of the running system, these log messages come in the following forms.

#### Informational
This is information about the application that is useful for operators.  
* Startup information `Listening on 0.0.0.0:2319` lets you know the system started and is ready for normal operation.  
* Shutdown information `Graceful shutdown.` If you don't see a shutdown, you know the app met an untimely death or failed to shutdown properly.  
* Status information `All peers report positive status, Cluster is healthy!`

#### Audit
This is information which is useful to form an audit trail. This type of event differs from Informational as it can have a different write durability and retention rules. For instance, you may have a legal requirement to retain audit logs for 3 years. While other events could be retained for only 30 days. In addition, audit events might require more robust and more expensive write durability and handling, since losing an audit log could lead to some very uncomfortable conversations with lawyers.

Audit logs are also a great resource for support to understand what happened with their customer.
-   Security events `User requested reset password user-id="4203" origin-ip="10.40.23.1"`
-   Access / User Action `HTTP PUT '/user/4209' client-agent="golang/1.18" origin-ip="10.40.23.1"`

#### Warnings
This is a warning about a non request event related action that isn't an error, but should be reported somewhere. A warning occurs when something unexpected occur but does not require any action to be taken.

-   Periodic checks `failed to renew TLS Cert via Lets Encrypt, you still have '30d' left until the cert expires. retry=3h error="dns lookup failure for acme-v02.api.letsencrypt.org"`
-   Pending updates `You are currently running v2.1.5 but the latest version v2.2.0 is available!`
-   Errors, which the system can recover from `Error connecting to peer; network timeout; removing peer from cluster`

#### Errors
This is an error that occurred which is a non request or event related action needs immediate attention! These types of events should be rare and should result in someone getting paged or a ticket created. Errors require action on a part of the operator.

Errors are actionable items for which someone should be alerted via Pager Duty or direct message depending on urgency. If the error is resolved via self healing, then it should be a warning.

-   Periodic checks and health failures `TLS Cert will expire in 24 hours, fix it now! CN=vestige.com`
-   Errors talking to other required systems `Error connecting to database "unable to connect to 192.168.1.1:3009"` or Peers reporting errors, `Cluster is unhealthy retry="30s" peer-error="500 error connecting to DB"`
-   To many warnings `Too many warnings from peers, unable to reach quorum! Cluster is down`

## Error Messages
Good error messages all share the same structure.

- Say WHAT happened
- Say WHY it happened
- And what action is taken

#### Good
- Unable to query account; query returned: canceling statement due to statement timeout; retrying..."
- Failed to write to session; No space left on device; aborting..."

#### Bad
- Error: query returned an error: canceling statement due to statement timeout
- Failed: No space left on device

## Contextual Logging
A collection of best practices we have found to be of great use when logging and searching through logs.

#### Categorize your logs
Sub systems in or modules in your logs could spew more information than others. For instance access/audit logs could be VERY noisy and cloud out other informational logs. Using the `category` field is a great way to filter out the noise from specific parts of your application. 

Category examples (http, smtp, workers, client, library-name)
```
INFO: Service listening on 10.33.23.10... category="service"
INFO: HTTP GET /_healthz  category="health-check"
INFO: HTTP GET /_healthz  category="health-check"
INFO: HTTP GET /_healthz  category="health-check"
INFO: HTTP GET /v1/users/1234  category="http" account.id="1234"
INFO: SMTP message recieved category="smtp" account.id="1234" msg.id="123456"
INFO: HTTP GET /_healthz  category="health-check"
INFO: HTTP GET /_healthz  category="health-check"
INFO: HTTP GET /_healthz  category="health-check"
INFO: Service Graceful shutdown... category="service"
```

### Avoid logging the same error twice
Adding unnecessary log lines if easy to do during initial testing. But it can quickly overwhelm or create the appearance of a bigger issue when there is none.

Example:
```
ERR: GET on 'http://scout/v1/stats' returned 500 with 'unable to connect to database'
ERR: Failed to fetch stats from scout 
```
Instead, bubble up the error through the call stack to the owner of the thing that failed, and log from there.
```
ERR: While fetching stats from analytics: GET on 'http://analytics/v1/stats' returned 500 with 'unable to connect to database; connection refused'
```

#### Attach customer id
If the log is in response to a customer request, action or item, always include that customers id, akid or item in the context of the log entry, this allows log viewers to filter errors by a particular customer or item.

#### Include as much information as possible
Include as much information about the what happened and why, and what is being done about it. Notice the `; retrying` which tells the user or support tech what action is taken, then the contextual details on "when" the retry will occur is also shared.
```go
log.Warn("While generating x509 key pair; retrying",
   "attempts", info.Job.AttemptCount,
   "backoff",  next.String(),  
   "retryAt",  time.Now().Add(next),  
   "error",    err)
```


### Use slog
`log/slog` has both a convenience interface and a high performance interface, so there is no need to opt for a secondary logging system.

- Use `log.Info("msg")` and  `log.Error("msg")` for convenience and non critical code Info, Warn, Error code paths
- Use `log.LogAttrs(ctx, slog.LevelDebug, "msg")` for debug messages, where speed and zero allocation logging is important.

Avoid using variables in the `message:` string, instead attach them as context to the log. In this way users can filter by the error, and get details if they want. Compare searching logs for `limit hit while parsing header` with  `Customer '*' hit their limit while parsing header '*' with value '*'` 

```go

log.With(  
      "account.id",  em.client.Domain.Account.ID,  
      "domain.id",   em.client.Domain.ID,  
      "domain.name", em.client.Domain.Name,  
      "header",      headerKey,  
      "value",       em.headers.parsed.GetASCII(headerKey),  
      "error",       err,  
   ).Warn("limit hit while parsing header")  
```


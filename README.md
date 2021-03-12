# Email OTPs

This is an **early** exporation of mechanisms to facilitade the verification of email addresses on the Web.

It is largely based on the somewhat analogous mechanisms explored in origin-bound [SMS OTPs](https://github.com/WICG/sms-one-time-codes) and [WebOTP](https://github.com/WICG/web-otp).

# A Baseline

As starting point, we are imagining that there is maybe a convention that websites could use cooperatively with email providers to facilitate the verification of email addresses (note, we make two big assumptions here: (a) that the email has already been previously acquired by the website and (b) that the incentives are aligned for a cooperative relationship).

In the first pass, a website uses a newly exposed browser API to declare that it is expecting an email OTP: 

```html
<input autocomplete="one-time-code">
```

Or imperatively:

```javascript
navigator.credentials.get({
  otp: { transport: ["email"] }
});
```

It then sends an email to the email provider with an agreed upon convention. It is unclear exactly what that convention is, but just as a starting point, take something as simple as a reserved email header:

```
X-Email-OTP: @example.com #1234
```

For example:

```mime
MIME-Version: 1.0
Content-Type:  multipart/mixed;  boundary=frontier
From: Relying Party <no-reply@rp.com>
To: user@email.com
Subject: Verify Email Address
X-Email-OTP: @example.com #1234
...
```

This special convention instructs the cooperative email client to inform (with the user's agreement) the browser of its arrival.

For native email clients (e.g. android/ios apps), the mechanism to inform the browser will probably vary from browser to browser.

For web email clients, however, we could probably expose a Web API that allows the email client to inform the browser of the arrival. For example: 

```javascript
navigator.credentials.store({
  otp: {
    audience: "https://example.com",
    transport: "email",
    value: "1234"
  }
});
```

One of the key benefits about this baseline is that it is imposes no changes in user behavior, fitting complementary with the existing norms for email verification. By that we mean that it is strictly additive: it degrades gracefully to the current norm when it isn't available / fails (e.g. the email header is invisible) but offers an uplift in conversion rates when it succeeds (e.g. automates part of the flow that is done manually).

# An Extension

One of the clear problems with this baseline is that it still relies on email delivery to perform email verification. That's clearly a problem because:

- email delivery is slow (say, order of minutes in the 50th percentile)
- email delivery is unreliable (e.g. spam filters)
- the email service gets to learn what website you are logging in to

So, one of the ways this baseline can be extended is to make email verification without dependending on actually sending/receiving emails.

The first thought that occurred to us, was something along the lines of public/private key signing.

In this formulation, websites would still use the same consumer APIs and would still also send emails with headers. A browser would still wait for a companion `navigator.credentials.store()` call to be made, but, in **addition** to that, the consumer API would also take:

- an email address that is expecting to be verified.
- a non-guessable nonce

For example:

```javascript
navigator.credentials.get({
  otp: {
    transport: ["email"],
    email: "user@email.com",
    nonce: "123"
  }
});
```

The browser would then reach out to the email provider to check if:

- the user is logged in and the email to be verified matches the logged in user
- it supports a faster way to make email verification.

It is unclear exactly how that would be done, but just a starting point, lets pretend, by convention, there would be a credentialed .well-known file somewhere that email providers expose:

```http
GET /.well-known/email-otp.json HTTP/1.1
Host: email.com
Cookie: 123
```

With the `cookie` that is passed, the session is established, and if there is a valid user at the other end it responds to the browser:

```http
HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Last-Modified: Wed, 22 Jul 2009 19:15:56 GMT
Content-Length: 88
Content-Type: text/json
{
  email: "user@email.com",
  verification: "/verify.php"
}
```

If a matching email user is available and it affords to be verified, the browser gets the user permission and makes a POST request to the verification endpoint with the **nonce** as a parameter:

```http
POST /verify.php HTTP/1.1
Host: email.com
Content-Type: application/x-www-form-urlencoded
Cookie: 123
nonce=123
```

The email service then mints and signs a token that proves to the website that the current user (identified by the cookie) actually does own the email in question.

It is unclear exactly how that would be done, but just as a starting point, take something like a JWT:

```http
HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Last-Modified: Wed, 22 Jul 2009 19:15:56 GMT
Content-Length: 88
Content-Type: application/jwt
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWRpZW5jZSI6IjEyMzQiLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIiwiZXhwIjoxNTE2MjM5MDIyLCJpYXQiOjE1MTYyMzkwMjJ9.6AZ4WxvdJvjU8LtOxRoH33F4gEV-MwosvoyRADXhiyM
```

This is a base64 encoded signed token. The payload binds the email address to the specific "nonce" passed initially for a short period of time (e.g. sets expiration times).

```json
{
  "iss": "https://email.com",
  "aud": "1234",
  "sub": "user@email.com",
  "exp": 1516239022,
  "iat": 1516239022
}
```

The browser would take this base64 encoded JWT and pass it back as a result to the `navigator.credentials.get()` call.

In possession of the JWT, the website can use the existing JWT conventions for checking its validity and provenance (e.g. getting public keys from the [JWKS](https://tools.ietf.org/html/rfc7517) `/.well-known/jwks.json`), and hence the proof of the user's possession of the email address.

This extension is notably more complicated for browsers and email vendors to implement, but is notably:

- faster and more reliable than the baseline and, importantly,
- backwards compatible with user norms like the baseline
- not-mutually exclusive to the baseline

Because there are few email providers and even fewer browser vendors, it seems like the right place to push complexity to, if it leads to higher conversion rates to a large user base.

Importantly, because it can be used **in addition to** the baseline (which, in an on itself is also **additive to** the status quo), this extension could be used by sophisticated email providers and ignored by smaller ones.
# URL Shortner

Written using Express and Firebase. Redis has been used for caching.

## How it works
Markup : * A original (lenghty) url can be give as input.
Markup : * The node server generates a 8 character hash for the url and returns new shortened url
Markup : * The new shortened url leads to the original url using server redirecting.

## Performance

Markup : * Takes 1447 ms the first redirection to original url
Markup : * For the subsequent redirection, it takes 10ms

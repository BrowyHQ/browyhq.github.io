// Endpoint the email signup box at the bottom of every page posts to: a small
// Cloudflare Pages Function that adds the address to the Browy updates list.
// While this is empty the box renders nothing at all: no markup, no script.
export const SIGNUP_ENDPOINT: string = 'https://browy-signup.pages.dev/api/signup';

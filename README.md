# Sonkhipto

## Environment Setup

Create and add necessary environment variables in `apps/web/.env` and `packages/db/.env`.

> If you are running your db locally your `DATABASE_URL` should be `postgresql://postgres:postgres@localhost:5432/sonkhipto?schema=public`

## Run Locally

> 1. Make suer you have `pnpm` installed
> 2. Make sure you have `docker` installed

```bash
pnpm i

# Start a database using docker
pnpm db:up

# Database migration
pnpm db:generate
pnpm db:migrate

# Start development server
pnpm dev
```

## Check scraping endpoints

### Check `getLatestArticleLinks` function

To check `getLatestArticleLinks` function open up postman or anyother API testing application and send a `POST` request to `http://localhost:3000/api/scrape-links` endpoint with this body

```json
{
  "publisherId": "prothomalo-bangla"
}
```

### Check `getArticleMetadata` function

To check `getArticleMetadata` function open up postman or anyother API testing application and send a `POST` request to `http://localhost:3000/api/scrape-article` endpoint with this body

```json
{
  "publisherId": "prothomalo-bangla",
  "link": "https://www.prothomalo.com/entertainment/dhallywood/3zosgp5hpt"
}
```

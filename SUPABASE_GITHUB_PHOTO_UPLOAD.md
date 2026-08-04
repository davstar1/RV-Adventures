# GitHub Photo Upload Setup

This site can upload admin photos into the GitHub repository through a Supabase Edge Function.

## 1. Create A GitHub Token

Create a fine-grained GitHub token for:

- Owner: `davstar1`
- Repository: `rv-adventures`
- Repository permission: `Contents` set to `Read and write`

Do not put this token in the website `.env` file.

## 2. Add Supabase Secrets

In Supabase, add these Edge Function secrets:

```text
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=davstar1
GITHUB_REPO=rv-adventures
GITHUB_BRANCH=main
```

## 3. Deploy The Edge Function

Deploy this function:

```bash
supabase functions deploy upload-github-photo
```

## 4. Use It In Admin

After deployment, sign in to the admin page and use the photo upload buttons.
Uploaded photos will be committed into:

```text
public/photos/about
public/photos/destinations
public/photos/gear
public/photos/reviews
public/photos/slideshow
public/photos/tips
public/photos/videos
```

The admin form will receive a website URL like:

```text
/photos/about/1234567890-camp-photo.jpg
```

Save the entry after the upload finishes.

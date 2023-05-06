# The image proxy server powered by Microsoft 365

This is an express proxy server that can be used to proxy images from Microsoft 365 Sharepoint.

## Usage

### Run on your local machine

#### clone this repo

```bash
git clone https://github.com/happyeric77/colorfullife
```

Change the credentials in the `.env.example` file and rename it to `.env`. (If you are not sure how to create the ms365 credentials, checkout the tutorial video [here](https://www.youtube.com/watch?v=sXW3G8gtlWs))

#### Install dependencies

```bash
yarn install
```

#### Start the server

```bash
npx lerna --scope=@colorfullife/ms365-image-server run dev
```

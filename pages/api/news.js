import { GoogleSearch } from 'google-search-results-nodejs';

const search = new GoogleSearch(process.env.SERPAPI_API_KEY);

export default function handler(req, res) {
  const { query } = req.query;

  const params = {
    engine: 'google_news',
    q: query,
    hl: 'en',
    gl: 'us',
  };

  search.json(params, (data) => {
    res.status(200).json(data);
  });
}

import { useEffect, useState } from 'react';

export default function NewsList({ query }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(`/api/news?query=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.news_results || []);
      });
  }, [query]);

  return (
    <ul>
      {articles.map((article, index) => (
        <li key={index}>
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
          <p>{article.snippet}</p>
        </li>
      ))}
    </ul>
  );
}

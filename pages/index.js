import NewsList from '../components/NewsList';

export default function Home() {
  return (
    <div>
      <section id="news" className="py-20 bg-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-medium">LATEST UPDATES</span>
            <h2 className="text-4xl font-bold mt-2">Industry News & Insights</h2>
          </div>
          <NewsList query="technology" />
        </div>
      </section>
    </div>
  );
}

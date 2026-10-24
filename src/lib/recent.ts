import { fetchFeed, mergeAndDedupe, type FeedItem } from './feeds';
import { RAXIT_BLOG_URL, RAXIT_FEED_URL, SUBSTACK_FEED_URL, SUBSTACK_URL } from '../consts';

// Every route renders every section, so the feeds are fetched once per build
// and shared. raxIT first so canonical URLs win on cross-posts.
let cached: Promise<FeedItem[]> | undefined;

export function recentWriting(limit = 5): Promise<FeedItem[]> {
	cached ??= Promise.all([
		fetchFeed(RAXIT_FEED_URL, 'raxIT', RAXIT_BLOG_URL),
		fetchFeed(SUBSTACK_FEED_URL, 'Substack', SUBSTACK_URL),
	]).then(([raxit, substack]) => mergeAndDedupe(raxit, substack));
	return cached.then((items) => items.slice(0, limit));
}

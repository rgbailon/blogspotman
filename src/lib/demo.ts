import type { Blog, CommentItem, Post, PostDraft, PostStatus } from "../types";
import { uid } from "./utils";

const KEY = "fieldpress.demo.v1";

interface DemoState {
  posts: Post[];
  comments: CommentItem[];
}

const LATENCY = 420;
const wait = () => new Promise((r) => setTimeout(r, LATENCY + Math.random() * 240));

function iso(daysAgo: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 50) + 5, 0, 0);
  return d.toISOString();
}

export const DEMO_BLOG: Blog = {
  id: "8104220033154690782",
  name: "Fieldnotes",
  description: "A journal of travel, coffee, and occasional code — written from wherever the wifi holds.",
  url: "https://fieldnotes-demo.blogspot.com/",
  published: iso(430),
  updated: iso(1),
  posts: { totalItems: 10 },
  pages: { totalItems: 3 },
  locale: { language: "en", country: "US" },
};

const AUTHOR = {
  id: "g100482",
  displayName: "June Marlowe",
  url: "https://www.blogger.com/profile/100482",
  image: { url: "" },
};

const p = (
  id: string,
  title: string,
  status: PostStatus,
  daysAgo: number,
  labels: string[],
  comments: number,
  content: string
): Post => {
  const published = iso(daysAgo);
  // update sometimes a day or two later
  const updated = iso(Math.max(0, daysAgo - 2), 14);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const d = new Date(published);
  return {
    id,
    title,
    status,
    published,
    updated,
    labels,
    content,
    url: `https://fieldnotes-demo.blogspot.com/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${slug}.html`,
    author: AUTHOR,
    replies: { totalItems: comments },
    readerComments: "ALLOW",
  };
};

function seed(): DemoState {
  const posts: Post[] = [
    p(
      "9211400882",
      "Slow Mornings in Lisbon's Alfama District",
      "LIVE",
      3,
      ["Travel", "Photography"],
      14,
      `<p>Alfama wakes up slowly. The trams don't start rattling until seven, and before that the only sound is laundry being pinned to lines thirty feet above the alley.</p><p>I spent four days here with one camera and no itinerary, which is the correct number of both.</p><h2>Where to drink coffee</h2><p>Skip the riverside places. Walk uphill until your calves complain, then find <strong>Copenhagen Coffee Lab</strong> — a Scandinavian outpost that, confusingly, makes the best pastel de nata pairing in the city.</p><ul><li>Order the galão, not the latte</li><li>Sit outside before 9am for the light</li><li>Bring cash for the tascas</li></ul><blockquote>Travel is the only thing you buy that makes you richer — but only if you stop buying the tour bus version.</blockquote><p>The miradouros are free and the best one has no name on Google Maps. Ask for the one with the orange tree.</p>`
    ),
    p(
      "9199273400",
      "Dialing In: My Espresso Workflow After 200 Shots",
      "LIVE",
      9,
      ["Coffee", "Guides"],
      8,
      `<p>Two hundred shots in, I finally accept the truth: the grinder matters more than the machine, and freshness matters more than both.</p><h2>The recipe that works</h2><p><strong>18g in, 38g out, 27–30 seconds.</strong> Everything else is weather.</p><ul><li>Dose: 18.0g, WDT until fluffy</li><li>Yield: 38g ± 1g</li><li>Temp: 93°C for medium roasts</li><li>Water: 80–100 ppm, some buffer</li></ul><p>If your shot runs fast, don't panic-adjust the grind two full steps. Move <em>half a notch</em> and pull another.</p><blockquote>Consistency is not the enemy of discovery. It's the baseline that makes discovery visible.</blockquote>`
    ),
    p(
      "9177445510",
      "Shipping a Side Project in a Weekend",
      "LIVE",
      16,
      ["Code", "Essays"],
      21,
      `<p>The trick to finishing a weekend project is deciding on Thursday what you're <em>not</em> going to build.</p><h2>My constraints list</h2><p>Write this down before you touch a keyboard:</p><ul><li>One screen, one action, one success state</li><li>No auth — magic links or nothing</li><li>Deploy by Saturday 6pm or delete the repo</li></ul><h2>The stack</h2><p>Boring on purpose:</p><pre><code>npx create-vite app --template react-ts\ncd app && npm i && npm run dev</code></pre><p>That's it. Everything you add after this line needs to defend its existence in a court of Sunday evening.</p>`
    ),
    p(
      "9144931027",
      "A Field Guide to Night Markets",
      "LIVE",
      24,
      ["Travel", "Food"],
      5,
      `<p>Night markets are graded on three axes: smoke, noise, and how many things are on sticks. The great ones max out all three.</p><p>My standing rule: follow the longest line of locals, not the shortest line of tourists. The stall with the plastic stools and the surly auntie is where the story is.</p><h2>Etiquette</h2><ul><li>Point, smile, pay. Haggling over fifty cents of noodles is bad karma.</li><li>Eat it hot or don't eat it at all.</li><li>One hand for food, one hand for the camera. Never both.</li></ul>`
    ),
    p(
      "9122118664",
      "Why I Stopped Using Todo Apps",
      "LIVE",
      38,
      ["Essays", "Productivity"],
      32,
      `<p>After seven years and eleven apps, my productivity system is now a paper card that says <em>"one thing"</em> on it.</p><p>The apps weren't failing me. They were succeeding too well — at being places to put work instead of places where work happened.</p><h2>The card system</h2><p>Every morning: one index card, one commitment, actually done by evening. The backlog lives in my head, where it keeps itself honest by being uncomfortable.</p><blockquote>Your second brain should not be where ideas go to be safe. It should be where they go to be finished.</blockquote>`
    ),
    p(
      "9099306201",
      "Photographing Fog: A Patience Manual",
      "LIVE",
      51,
      ["Photography", "Guides"],
      6,
      `<p>Fog is the cheapest production designer in photography. It removes everything you didn't want anyway.</p><h2>Settings to start</h2><ul><li>Expose <strong>+1 stop</strong> over the meter — fog fools it every time</li><li>f/4 to f/5.6: you want the haze, not the sharpness</li><li>Manual focus. Autofocus hunts and ruins the quiet</li></ul><p>Arrive before the fog knows you're coming. The best hour is the one where it's deciding whether to stay.</p>`
    ),
    p(
      "9044072839",
      "The Two-Week Notice: Leaving a Job Gracefully",
      "LIVE",
      68,
      ["Essays", "Career"],
      41,
      `<p>How you leave somewhere is the last thing people remember about you, which makes it, functionally, the first thing.</p><p>Write the notice letter before you schedule the meeting. The letter forces clarity; the meeting rewards it.</p><h2>What actually matters</h2><ol><li>Tell your manager first, in person, with a plan</li><li>Document everything you were holding in your head</li><li>Say the specific thank-yous, not the generic ones</li></ol><p>Then disappear kindly. The best exits are boring.</p>`
    ),
    p(
      "9021509945",
      "Draft: Manual Brewing Methods, Ranked",
      "DRAFT",
      2,
      ["Coffee", "Guides"],
      0,
      `<p>Working thesis: the Aeropress is the people's champion, the V60 is the critic's darling, and the French press is the family sedan everyone pretends to be above.</p><h2>Scoring criteria</h2><ul><li>Forgiveness — how bad can your morning be and still get a good cup?</li><li>Ceiling — how good can it possibly get?</li><li>Cleanup — the hidden tax</li></ul><p><em>TODO: add the cupping notes from Saturday, reshoot the V60 pour photo, get Marcus to fact-check the espresso claims.</em></p>`
    ),
    p(
      "9017733021",
      "Draft: Notes on Solo Dining",
      "DRAFT",
      1,
      ["Essays"],
      0,
      `<p>Solo dining is the last socially acceptable form of eavesdropping.</p><p>Notes so far: the counter seat is always better than the table; ordering the server's favorite thing has never once failed me; a book is good armor but a notebook is better — waiters are kinder to people who appear to be writing.</p>`
    ),
    p(
      "9033666517",
      "Year in Review: 12 Posts I Almost Published",
      "SCHEDULED",
      -5,
      ["Essays"],
      0,
      `<p>Every December I open the drafts folder and have the same reaction: relief. Some posts age into relevance; most age into evidence.</p><p>This year's almosts include: a 4,000 word defense of airport hotels, an angry letter to my bicycle, and a recipe ranking that would have ended at least two friendships.</p><p><em>Publishing Friday morning. Check the espresso follow-up links before it goes live.</em></p>`
    ),
  ];

  const c = (id: string, postId: string, name: string, daysAgo: number, content: string): CommentItem => ({
    id,
    author: { id: `g${id}`, displayName: name },
    published: iso(daysAgo, 17),
    content: `<p>${content}</p>`,
    status: "LIVE",
    post: { id: postId },
  });

  const comments: CommentItem[] = [
    c("c01", "9211400882", "Marta Soares", 3, "The miradouro with the orange tree is Graça, and I'm offended you called it nameless. Otherwise flawless guide."),
    c("c02", "9211400882", "Theo Lindqvist", 2, "Did the galão thing this morning per your instructions. My calves complain AND my heart is full."),
    c("c03", "9211400882", "Priya Raman", 1, "Saving this for April. Is four days enough for Porto too or am I being greedy?"),
    c("c04", "9199273400", "Hugo Barista", 8, "“Don't panic-adjust two full steps” needs to be tattooed on every new home barista's forearm."),
    c("c05", "9199273400", "dana.k", 7, "18 → 38 in 28s is exactly my sweet spot too. What grinder are you pairing with?"),
    c("c06", "9177445510", "Maya Chen", 15, "“Deploy by Saturday 6pm or delete the repo” is brutal and correct. Sharing this with my cofounder."),
    c("c07", "9177445510", "overworked_dev", 12, "The constraints list is the whole game. I've started putting mine in the README so I can't cheat."),
    c("c08", "9122118664", "Grace Okafor", 34, "Eleven apps! I feel so seen. What did you do about recurring reminders though?"),
    c("c09", "9122118664", "Anonymous", 30, "My second brain is where ideas go to be safe AND forgotten. Trying the card this week."),
    c("c10", "9044072839", "Sam Woolf", 60, "“The best exits are boring” — wish someone had told 24-year-old me this before the farewell karaoke incident."),
  ];

  return { posts, comments };
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (Array.isArray(parsed.posts) && parsed.posts.length) return parsed;
    }
  } catch {
    /* corrupted demo state */
  }
  const fresh = seed();
  save(fresh);
  return fresh;
}

function save(state: DemoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full/denied */
  }
}

export const demoClient = {
  async getBlog(): Promise<Blog> {
    await wait();
    const s = load();
    return {
      ...DEMO_BLOG,
      posts: { totalItems: s.posts.length },
      updated: s.posts.map((x) => x.updated ?? "").sort().pop() ?? DEMO_BLOG.updated!,
    };
  },

  async listPosts(): Promise<Post[]> {
    await wait();
    return load().posts;
  },

  async listComments(postId: string): Promise<CommentItem[]> {
    await wait();
    return load()
      .comments.filter((c) => c.post?.id === postId)
      .sort((a, b) => (a.published ?? "").localeCompare(b.published ?? ""));
  },

  async createPost(_blogId: string, _t: string, draft: PostDraft, isDraft: boolean): Promise<Post> {
    await wait();
    const s = load();
    const now = new Date().toISOString();
    const post: Post = {
      id: uid(),
      title: draft.title,
      content: draft.content,
      labels: draft.labels,
      status: isDraft ? "DRAFT" : "LIVE",
      published: isDraft ? undefined : now,
      updated: now,
      url: `https://fieldnotes-demo.blogspot.com/draft/${uid()}.html`,
      author: AUTHOR,
      replies: { totalItems: 0 },
      readerComments: "ALLOW",
    };
    s.posts.unshift(post);
    save(s);
    return post;
  },

  async updatePost(_blogId: string, _t: string, postId: string, draft: PostDraft): Promise<Post> {
    await wait();
    const s = load();
    const idx = s.posts.findIndex((x) => x.id === postId);
    if (idx === -1) throw new Error("Post not found");
    const prev = s.posts[idx];
    const next: Post = {
      ...prev,
      title: draft.title,
      content: draft.content,
      labels: draft.labels,
      updated: new Date().toISOString(),
      published: prev.status !== "LIVE" && prev.published === undefined ? undefined : prev.published,
    };
    s.posts[idx] = next;
    save(s);
    return next;
  },

  async publishPost(_blogId: string, _t: string, postId: string): Promise<Post> {
    await wait();
    const s = load();
    const post = s.posts.find((x) => x.id === postId);
    if (!post) throw new Error("Post not found");
    post.status = "LIVE";
    post.published = new Date().toISOString();
    post.updated = post.published;
    save(s);
    return { ...post };
  },

  async revertPost(_blogId: string, _t: string, postId: string): Promise<Post> {
    await wait();
    const s = load();
    const post = s.posts.find((x) => x.id === postId);
    if (!post) throw new Error("Post not found");
    post.status = "DRAFT";
    post.updated = new Date().toISOString();
    save(s);
    return { ...post };
  },

  async deletePost(_blogId: string, _t: string, postId: string): Promise<void> {
    await wait();
    const s = load();
    s.posts = s.posts.filter((x) => x.id !== postId);
    s.comments = s.comments.filter((c) => c.post?.id !== postId);
    save(s);
  },
};

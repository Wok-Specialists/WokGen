import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Explore Pixel Art | WokGen',
  description: 'Browse AI-generated pixel art from the WokGen community. Get inspired and remix any prompt.',
};

// Mock community showcase data
const COMMUNITY_ITEMS = [
  { id: '1',  label: 'Dragon Boss',           prompt: 'red fire dragon, RPG boss, 128×128, pixel art', style: 'RPG Icon',     likes: 142, author: 'pixelknight' },
  { id: '2',  label: 'Neon City Tiles',        prompt: 'cyberpunk city tileset, neon lights, rainy night', style: 'Tileset',      likes: 98,  author: 'neonbyte' },
  { id: '3',  label: 'Forest Spirit',          prompt: 'forest spirit, green aura, nature chibi, 64×64', style: 'Chibi',        likes: 87,  author: 'emeraldpx' },
  { id: '4',  label: 'Space Blaster',          prompt: 'sci-fi laser blaster gun, isometric view, neon blue', style: 'Sci-Fi',  likes: 73,  author: 'voidmaker' },
  { id: '5',  label: 'Dungeon Key',            prompt: 'golden dungeon key, ornate, RPG inventory icon, 32×32', style: 'RPG Icon', likes: 61, author: 'dungeoneer' },
  { id: '6',  label: 'Ice Mage Walk',          prompt: 'ice mage walk cycle, blue robes, side view, 64×64', style: 'Sprite Sheet', likes: 55, author: 'frostpixel' },
  { id: '7',  label: 'Lava Explosion',         prompt: 'lava explosion effect, bright orange, game VFX', style: 'Effect',       likes: 49,  author: 'embervfx' },
  { id: '8',  label: 'Merchant Stall',         prompt: 'wooden merchant stall, pots and barrels, RPG top-down', style: 'Top-Down', likes: 44, author: 'traderguild' },
  { id: '9',  label: 'Robot Sentinel',         prompt: 'retro robot sentinel, blocky style, red eye, 64×64', style: 'Character', likes: 41, author: 'mech88' },
  { id: '10', label: 'Treasure Hoard',         prompt: 'pile of gold coins and gems, RPG loot, inventory art', style: 'RPG Icon', likes: 38, author: 'lootmaster' },
  { id: '11', label: 'Haunted Graveyard',      prompt: 'haunted graveyard tiles, horror, moonlit, top-down RPG', style: 'Tileset', likes: 35, author: 'gravepx' },
  { id: '12', label: 'Cute Slime Boss',        prompt: 'giant slime boss, crown, cute pixel art, 128×128', style: 'Chibi',     likes: 31,  author: 'slimequeen' },
  { id: '13', label: 'Portal Swirl',           prompt: 'magic portal swirl animation, purple, game VFX', style: 'Effect',       likes: 28,  author: 'arcanusvfx' },
  { id: '14', label: 'Viking Warrior',         prompt: 'viking warrior, axe, shield, side view, pixel art RPG', style: 'Character', likes: 26, author: 'vikingpx' },
  { id: '15', label: 'Health Bar UI',          prompt: 'game health bar UI, red/green, pixel art HUD element', style: 'Game UI',  likes: 24, author: 'uismith' },
  { id: '16', label: 'Crystal Cave',           prompt: 'crystal cave tileset, glowing gems, RPG dungeon', style: 'Tileset',      likes: 22, author: 'geomancer' },
  { id: '17', label: 'Flying Fairy',           prompt: 'tiny fairy character, wings, pixie, idle animation, 32×32', style: 'Character', likes: 19, author: 'fairypx' },
  { id: '18', label: 'Potion Shelf',           prompt: 'alchemy shelf with potions, RPG shop interior, top-down', style: 'Top-Down', likes: 17, author: 'alchemist9' },
];

const STYLE_FILTERS = ['All', 'RPG Icon', 'Tileset', 'Character', 'Chibi', 'Sci-Fi', 'Effect', 'Sprite Sheet', 'Top-Down', 'Game UI'];

export default function ExplorePage() {
  return (
    <div className="explore-page">
      {/* Header */}
      <div className="explore-header">
        <h1 className="explore-title">Community Explore</h1>
        <p className="explore-subtitle">Browse AI-generated pixel art. Click any prompt to remix it in the studio.</p>
        <div className="explore-header-actions">
          <Link href="/pixel/studio" className="btn-primary btn-sm">🎨 Create your own →</Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="explore-filters">
        {STYLE_FILTERS.map(f => (
          <span key={f} className={`explore-filter-chip ${f === 'All' ? 'explore-filter-chip--active' : ''}`}>
            {f}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="explore-grid">
        {COMMUNITY_ITEMS.map(item => (
          <Link
            key={item.id}
            href={`/pixel/studio?prompt=${encodeURIComponent(item.prompt)}&preset=${encodeURIComponent(item.style)}`}
            className="explore-card"
          >
            {/* Placeholder art area */}
            <div className="explore-card-art">
              <div className="explore-card-art-placeholder">
                <span className="explore-card-art-emoji">🎨</span>
                <span className="explore-card-style-tag">{item.style}</span>
              </div>
            </div>
            <div className="explore-card-body">
              <div className="explore-card-label">{item.label}</div>
              <div className="explore-card-prompt">{item.prompt}</div>
              <div className="explore-card-footer">
                <span className="explore-card-author">@{item.author}</span>
                <span className="explore-card-likes">❤️ {item.likes}</span>
              </div>
              <div className="explore-card-cta">Remix this →</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="explore-bottom-cta">
        <p className="explore-bottom-text">Want your art featured here? Generate and save to the public gallery.</p>
        <Link href="/pixel/studio" className="btn-primary btn-md">Start Creating →</Link>
      </div>
    </div>
  );
}

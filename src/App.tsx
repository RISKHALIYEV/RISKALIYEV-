import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Image as ImageIcon, 
  FolderLock, 
  Layers, 
  Play, 
  Plus, 
  Trash2, 
  X, 
  Download, 
  Lock,
  ChevronRight,
  Menu,
  Monitor
} from 'lucide-react';
import { cn } from './lib/utils';
import { Item, Collection } from './types';

const ADMIN_PASSWORD = "RISKALIYEV201010";

export default function App() {
  const [activeTab, setActiveTab] = useState<'videos' | 'images' | 'projects' | 'collections'>('videos');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedImage, setSelectedImage] = useState<Item | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const clickSound = useRef<HTMLAudioElement | null>(null);
  const hoverSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchItems();
    fetchCollections();
    
    // Initialize sounds
    clickSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    hoverSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    if (clickSound.current) clickSound.current.volume = 0.2;
    if (hoverSound.current) hoverSound.current.volume = 0.1;
  }, []);

  const playClick = () => clickSound.current?.play().catch(() => {});
  const playHover = () => hoverSound.current?.play().catch(() => {});

  const fetchItems = async (collectionId?: number) => {
    const url = collectionId ? `/api/items?collection_id=${collectionId}` : '/api/items';
    const res = await fetch(url);
    const data = await res.json();
    setItems(data);
  };

  const fetchCollections = async () => {
    const res = await fetch('/api/collections');
    const data = await res.json();
    setCollections(data);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      playClick();
    } else {
      alert("Noto'g'ri parol!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD })
    });
    if (res.ok) {
      fetchItems(selectedCollection?.id);
      playClick();
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[1px] h-[60%] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute bottom-[20%] left-[10%] w-[1px] h-[60%] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative pt-12 pb-8 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
              kaliyev.web
            </h1>
            <p className="text-emerald-400 font-medium tracking-[0.2em] uppercase text-sm flex items-center gap-2">
              <span className="w-8 h-[1px] bg-emerald-400/50" />
              Creative digital platform
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setShowAdminLogin(true); playClick(); }}
              className="p-3 rounded-full luxury-border hover:bg-white/10 transition-colors group"
            >
              <Lock className={cn("w-5 h-5 transition-colors", isAdmin ? "text-emerald-400" : "text-white/60 group-hover:text-white")} />
            </button>
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 rounded-full luxury-border"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={cn(
          "mt-12 flex-wrap gap-3 md:flex",
          isMobileMenuOpen ? "flex" : "hidden md:flex"
        )}>
          {[
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'images', label: 'Images', icon: ImageIcon },
            { id: 'projects', label: 'Projects', icon: FolderLock },
            { id: 'collections', label: 'Toʻplamlar', icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { 
                setActiveTab(tab.id as any); 
                setSelectedCollection(null);
                fetchItems();
                setIsMobileMenuOpen(false);
                playClick();
              }}
              onMouseEnter={playHover}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-medium text-sm",
                activeTab === tab.id 
                  ? "bg-white text-black neon-glow-blue" 
                  : "luxury-border text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedCollection?.id || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedCollection && (
              <div className="mb-8 flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedCollection(null); fetchItems(); playClick(); }}
                  className="text-white/40 hover:text-white flex items-center gap-2 text-sm"
                >
                  Toʻplamlar
                  <ChevronRight className="w-4 h-4" />
                </button>
                <h2 className="text-2xl font-display font-bold">{selectedCollection.name}</h2>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.filter(i => i.type === 'video').map((video) => (
                  <VideoCard key={video.id} video={video} isAdmin={isAdmin} onDelete={handleDelete} onHover={playHover} />
                ))}
                {isAdmin && <AddCard type="video" onAdd={() => fetchItems(selectedCollection?.id)} collectionId={selectedCollection?.id} />}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.filter(i => i.type === 'image').map((image) => (
                  <ImageCard 
                    key={image.id} 
                    image={image} 
                    isAdmin={isAdmin} 
                    onDelete={handleDelete} 
                    onClick={() => { setSelectedImage(image); playClick(); }}
                    onHover={playHover}
                  />
                ))}
                {isAdmin && <AddCard type="image" onAdd={() => fetchItems(selectedCollection?.id)} collectionId={selectedCollection?.id} />}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.filter(i => i.type === 'project').map((project) => (
                  <ProjectCard key={project.id} project={project} isAdmin={isAdmin} onDelete={handleDelete} onHover={playHover} />
                ))}
                {isAdmin && <AddCard type="project" onAdd={() => fetchItems(selectedCollection?.id)} collectionId={selectedCollection?.id} />}
              </div>
            )}

            {activeTab === 'collections' && !selectedCollection && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((col) => (
                  <CollectionCard 
                    key={col.id} 
                    collection={col} 
                    onClick={() => { setSelectedCollection(col); fetchItems(col.id); playClick(); }}
                    onHover={playHover}
                  />
                ))}
                {isAdmin && <AddCollectionCard onAdd={fetchCollections} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-white/40 text-sm font-medium tracking-wider uppercase">
              RISKALIYEV YARATDI — Hayoliy potensialni buzishga hech kimning haqi yo‘q
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-white/20 text-xs uppercase tracking-widest">Created by RISKALIYEV</span>
            <div className="w-12 h-[1px] bg-white/10" />
            <span className="text-white/60 text-sm font-display">© 2024 kaliyev.web</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={selectedImage.file_path} 
                alt={selectedImage.title}
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold">{selectedImage.title}</h3>
                <p className="text-white/60">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="luxury-border p-8 rounded-3xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold">Admin Login</h2>
                <button onClick={() => setShowAdminLogin(false)}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Parol</label>
                  <input 
                    type="password" 
                    name="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Kirish
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoCard({ video, isAdmin, onDelete, onHover }: { video: Item, isAdmin: boolean, onDelete: (id: number) => void, onHover: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div 
      onMouseEnter={onHover}
      className="group relative luxury-border rounded-3xl overflow-hidden"
    >
      <div className="aspect-video relative bg-black">
        {isPlaying ? (
          <video 
            src={video.file_path} 
            controls 
            autoPlay 
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <img 
              src={video.preview_path || 'https://picsum.photos/seed/video/800/450'} 
              alt={video.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group/btn"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover/btn:bg-white group-hover/btn:scale-110 transition-all duration-300">
                <Play className="w-6 h-6 text-white group-hover/btn:text-black fill-current" />
              </div>
            </button>
          </>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-1">{video.title}</h3>
        <p className="text-white/40 text-sm line-clamp-2">{video.description}</p>
      </div>
      {isAdmin && (
        <button 
          onClick={() => onDelete(video.id)}
          className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

function ImageCard({ image, isAdmin, onDelete, onClick, onHover }: { image: Item, isAdmin: boolean, onDelete: (id: number) => void, onClick: () => void, onHover: () => void }) {
  return (
    <motion.div 
      onMouseEnter={onHover}
      onClick={onClick}
      className="group relative aspect-square luxury-border rounded-2xl overflow-hidden cursor-pointer"
    >
      <img 
        src={image.file_path} 
        alt={image.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
        <h4 className="text-sm font-bold">{image.title}</h4>
      </div>
      {isAdmin && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
          className="absolute top-2 right-2 p-2 bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

function ProjectCard({ project, isAdmin, onDelete, onHover }: { project: Item, isAdmin: boolean, onDelete: (id: number) => void, onHover: () => void }) {
  return (
    <motion.div 
      onMouseEnter={onHover}
      className="group relative luxury-border rounded-3xl p-6 flex gap-6 items-start"
    >
      <div className="w-24 h-24 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden">
        <img 
          src={project.preview_path || 'https://picsum.photos/seed/project/200/200'} 
          alt={project.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
        <p className="text-white/40 text-sm mb-4 line-clamp-2">{project.description}</p>
        <a 
          href={project.file_path} 
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-sm font-bold"
        >
          <Download className="w-4 h-4" />
          Yuklab olish
        </a>
      </div>
      {isAdmin && (
        <button 
          onClick={() => onDelete(project.id)}
          className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

function CollectionCard({ collection, onClick, onHover }: { collection: Collection, onClick: () => void, onHover: () => void }) {
  return (
    <motion.div 
      onMouseEnter={onHover}
      onClick={onClick}
      className="group relative aspect-[4/3] luxury-border rounded-3xl overflow-hidden cursor-pointer"
    >
      <img 
        src={collection.preview_path || 'https://picsum.photos/seed/collection/800/600'} 
        alt={collection.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
        <h3 className="text-2xl font-display font-bold mb-2">{collection.name}</h3>
        <p className="text-white/60 text-sm line-clamp-2">{collection.description}</p>
      </div>
      <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
        <ChevronRight className="w-6 h-6" />
      </div>
    </motion.div>
  );
}

function AddCard({ type, onAdd, collectionId }: { type: Item['type'], onAdd: () => void, collectionId?: number }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('type', type);
    formData.append('password', ADMIN_PASSWORD);
    if (collectionId) formData.append('collection_id', collectionId.toString());

    const res = await fetch('/api/items', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      onAdd();
      setIsAdding(false);
    }
    setLoading(false);
  };

  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)}
        className="aspect-video luxury-border rounded-3xl flex flex-col items-center justify-center gap-4 text-white/40 hover:text-white hover:bg-white/5 transition-all border-dashed border-2"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-sm font-bold uppercase tracking-widest">Yangi {type} qo'shish</span>
      </button>
    );
  }

  return (
    <div className="luxury-border rounded-3xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Sarlavha" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2" required />
        <textarea name="description" placeholder="Tavsif" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2" rows={2} />
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Fayl</label>
          <input type="file" name="file" className="text-xs" required />
        </div>
        {(type === 'video' || type === 'project') && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Preview Rasm</label>
            <input type="file" name="preview" className="text-xs" />
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-white text-black py-2 rounded-xl font-bold text-sm disabled:opacity-50">
            {loading ? 'Yuklanmoqda...' : 'Saqlash'}
          </button>
          <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 luxury-border rounded-xl">Bekor qilish</button>
        </div>
      </form>
    </div>
  );
}

function AddCollectionCard({ onAdd }: { onAdd: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('password', ADMIN_PASSWORD);

    const res = await fetch('/api/collections', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      onAdd();
      setIsAdding(false);
    }
    setLoading(false);
  };

  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)}
        className="aspect-[4/3] luxury-border rounded-3xl flex flex-col items-center justify-center gap-4 text-white/40 hover:text-white hover:bg-white/5 transition-all border-dashed border-2"
      >
        <Plus className="w-8 h-8" />
        <span className="text-sm font-bold uppercase tracking-widest">Yangi To'plam</span>
      </button>
    );
  }

  return (
    <div className="luxury-border rounded-3xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="To'plam nomi" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2" required />
        <textarea name="description" placeholder="Tavsif" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2" rows={2} />
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Preview Rasm</label>
          <input type="file" name="preview" className="text-xs" required />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-white text-black py-2 rounded-xl font-bold text-sm disabled:opacity-50">
            {loading ? 'Yaratish' : 'Saqlash'}
          </button>
          <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 luxury-border rounded-xl">Bekor qilish</button>
        </div>
      </form>
    </div>
  );
}

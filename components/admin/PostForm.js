import { useState, useRef } from 'react';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const MONTH_MAP = Object.fromEntries(MONTHS.map((m, i) => [m, String(i + 1).padStart(2, '0')]));

function toISO(turkishDate) {
  if (!turkishDate) return '';
  const parts = turkishDate.trim().split(' ');
  if (parts.length !== 3) return '';
  const day = parts[0].padStart(2, '0');
  const month = MONTH_MAP[parts[1]];
  const year = parts[2];
  if (!month) return '';
  return `${year}-${month}-${day}`;
}

function toTurkish(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PostForm({ initial = {}, onSave, saving }) {
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [isoDate, setIsoDate] = useState(toISO(initial.date) || '');
  const [category, setCategory] = useState(initial.category || '');
  const [image, setImage] = useState(initial.image || '');
  const [content, setContent] = useState(initial.content || '');
  const [uploading, setUploading] = useState(false);

  const contentRef = useRef(null);
  const thumbnailRef = useRef(null);
  const contentImgRef = useRef(null);

  const uploadFile = async (file) => {
    setUploading(true);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, data: e.target.result }),
          });
          setUploading(false);
          if (res.ok) resolve((await res.json()).url);
          else reject(new Error('Yükleme başarısız'));
        } catch (err) {
          setUploading(false);
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setImage(await uploadFile(file)); } catch { alert('Görsel yüklenemedi'); }
    e.target.value = '';
  };

  const handleContentImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      const el = contentRef.current;
      const start = el.selectionStart ?? content.length;
      const alt = file.name.replace(/\.[^.]+$/, '');
      const md = `\n![${alt}](${url})\n`;
      setContent(content.slice(0, start) + md + content.slice(start));
      setTimeout(() => { el.focus(); el.setSelectionRange(start + md.length, start + md.length); }, 0);
    } catch { alert('Görsel yüklenemedi'); }
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalDate = toTurkish(isoDate || todayISO());
    onSave({ title, description, date: finalDate, category, image, content });
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Başlık *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Tarih
            <span className="font-normal opacity-60 ml-1">(boş bırakılırsa bugün)</span>
          </label>
          <input
            type="date"
            value={isoDate}
            onChange={e => setIsoDate(e.target.value)}
            className={inputCls}
          />
          {isoDate && (
            <p className="mt-1 text-xs text-gray-400">{toTurkish(isoDate)}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Açıklama</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Kategori</label>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inputCls} />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Kapak Görseli</label>
        <div className="flex items-start gap-4">
          {image ? (
            <img src={image} alt="Kapak" className="w-32 h-24 object-cover rounded-xl flex-shrink-0" style={{ filter: 'none', margin: 0 }} />
          ) : (
            <div className="w-32 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
              Görsel yok
            </div>
          )}
          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={() => thumbnailRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm disabled:opacity-50"
            >
              {uploading ? 'Yükleniyor...' : 'Görsel Seç'}
            </button>
            <input type="text" value={image} onChange={e => setImage(e.target.value)} className={inputCls + ' font-mono text-xs'} placeholder="/images/uploads/gorsel.jpg" />
            <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            İçerik <span className="font-normal opacity-60">(Markdown)</span>
          </label>
          <button
            type="button"
            onClick={() => contentImgRef.current?.click()}
            disabled={uploading}
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            + İçeriğe Görsel Ekle
          </button>
          <input ref={contentImgRef} type="file" accept="image/*" className="hidden" onChange={handleContentImage} />
        </div>
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={18}
          className={inputCls + ' font-mono resize-y'}
          placeholder="Yazı içeriğini buraya girin (Markdown formatında)..."
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}

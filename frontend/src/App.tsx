import { useEffect, useState, type FormEvent } from 'react'

type Watch = {
  id: string
  brand: string
  model: string
  price: number | null
}

const STORAGE_KEY = 'watch-wishlist'

const EXAMPLES: Watch[] = [
  { id: 'ex-1', brand: 'Seiko', model: 'Prospex Alpinist SPB121', price: 750 },
  { id: 'ex-2', brand: 'Tudor', model: 'Black Bay 58', price: 4075 },
]

function loadWatches(): Watch[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as Watch[]
  } catch {
    // Storage unavailable or corrupted: fall back to examples
  }
  return EXAMPLES
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function App() {
  const [watches, setWatches] = useState<Watch[]>(loadWatches)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watches))
    } catch {
      // Ignore: the list still works for this visit
    }
  }, [watches])

  function addWatch(e: FormEvent) {
    e.preventDefault()
    if (!brand.trim() || !model.trim()) return
    setWatches([
      ...watches,
      {
        id: crypto.randomUUID(),
        brand: brand.trim(),
        model: model.trim(),
        price: price ? Number(price) : null,
      },
    ])
    setBrand('')
    setModel('')
    setPrice('')
  }

  function removeWatch(id: string) {
    setWatches(watches.filter((w) => w.id !== id))
  }

  const total = watches.reduce((sum, w) => sum + (w.price ?? 0), 0)

  return (
    <main>
      <header>
        <h1>Watch Wishlist</h1>
        <p className="lede">
          {watches.length} {watches.length === 1 ? 'watch' : 'watches'} · {usd.format(total)} total
        </p>
      </header>

      <form onSubmit={addWatch} className="add-form">
        <label>
          Brand
          <input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Omega" required />
        </label>
        <label>
          Model
          <input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Speedmaster Professional" required />
        </label>
        <label>
          Price (USD)
          <input id="price" type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="7100" />
        </label>
        <button type="submit">Add watch</button>
      </form>

      {watches.length === 0 ? (
        <p className="empty">Your wishlist is empty. Add your first watch above.</p>
      ) : (
        <ul className="list">
          {watches.map((w) => (
            <li key={w.id}>
              <div className="info">
                <span className="brand">{w.brand}</span>
                <span className="model">{w.model}</span>
              </div>
              <span className="price">{w.price != null ? usd.format(w.price) : '—'}</span>
              <button className="remove" onClick={() => removeWatch(w.id)} aria-label={`Remove ${w.brand} ${w.model}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export const Search = ({ v, set, ph }: { v: string; set: (s: string) => void; ph: string }) => <input className="srch" placeholder={ph} value={v} onChange={e => set(e.target.value)} />

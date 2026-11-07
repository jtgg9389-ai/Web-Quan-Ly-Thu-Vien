import { ReactNode, useEffect } from 'react'

export const Page = ({ t, s, children }: { t: string; s: string; children: ReactNode }) => {
  useEffect(() => { document.title = t + ' · Thư viện số' }, [t])
  return <><h1>{t}</h1><p className="sub">{s}</p>{children}</>
}
